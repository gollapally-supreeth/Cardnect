package com.cardnect.repository;

import com.cardnect.model.entity.OtpCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OtpCodeRepository extends JpaRepository<OtpCode, UUID> {
    Optional<OtpCode> findTopByEmailOrderByCreatedAtDesc(String email);
    void deleteByEmail(String email);
}

