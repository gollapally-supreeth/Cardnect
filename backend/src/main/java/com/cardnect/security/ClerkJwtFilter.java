package com.cardnect.security;

import com.cardnect.model.entity.User;
import com.cardnect.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.security.PublicKey;
import java.util.List;
import java.util.Optional;

/**
 * Clerk JWT Filter
 *
 * Validates the Clerk-issued JWT token from the Authorization header.
 * Clerk publishes its JWKS at https://api.clerk.com/v1/jwks.
 * The token is verified using the public key from that JWKS endpoint.
 *
 * On success, injects a UsernamePasswordAuthenticationToken into the
 * Spring Security context with the Clerk User ID as the principal.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class ClerkJwtFilter extends OncePerRequestFilter {

    private final ClerkJwksKeyProvider keyProvider;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String token = extractToken(request);
        if (token == null) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            PublicKey publicKey = keyProvider.getPublicKey(token);
            Claims claims = Jwts.parser()
                    .verifyWith(publicKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String clerkId = claims.getSubject();
            if (clerkId == null) {
                filterChain.doFilter(request, response);
                return;
            }

            Optional<User> userOpt = userRepository.findByClerkId(clerkId);
            if (userOpt.isEmpty()) {
                // User not yet synced — allow through, sync endpoint will handle it
                filterChain.doFilter(request, response);
                return;
            }

            User user = userOpt.get();
            if (user.isBlocked()) {
                response.sendError(HttpServletResponse.SC_FORBIDDEN, "Account suspended");
                return;
            }

            List<SimpleGrantedAuthority> authorities = List.of(new SimpleGrantedAuthority("ROLE_USER"));
            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(user, null, authorities);
            auth.setDetails(claims);

            SecurityContextHolder.getContext().setAuthentication(auth);
            log.debug("Authenticated user: {}", clerkId);

        } catch (Exception e) {
            log.warn("JWT validation failed: {}", e.getMessage());
            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }

    private String extractToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
