package com.cardnect.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Component
@Slf4j
public class AppwriteClient {

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    @Value("${appwrite.endpoint}")
    private String endpoint;

    @Value("${appwrite.project.id}")
    private String projectId;

    @Value("${appwrite.api.key}")
    private String apiKey;

    @Value("${appwrite.database.id}")
    private String databaseId;

    public AppwriteClient(ObjectMapper objectMapper) {
        this.httpClient = HttpClient.newHttpClient();
        this.objectMapper = objectMapper;
    }

    private HttpRequest.Builder requestBuilder(String path) {
        return HttpRequest.newBuilder()
                .uri(URI.create(endpoint + path))
                .header("Content-Type", "application/json")
                .header("X-Appwrite-Project", projectId)
                .header("X-Appwrite-Key", apiKey);
    }

    public Map<String, Object> createDocument(String collectionId, String documentId, Map<String, Object> data) {
        try {
            Map<String, Object> body = new HashMap<>();
            String documentIdParam = documentId != null ? documentId : "unique()";
            body.put("documentId", documentIdParam);
            body.put("data", data);

            String json = objectMapper.writeValueAsString(body);
            HttpRequest request = requestBuilder("/databases/" + databaseId + "/collections/" + collectionId + "/documents")
                    .POST(HttpRequest.BodyPublishers.ofString(json))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                log.error("Appwrite error: {} - {}", response.statusCode(), response.body());
                throw new RuntimeException("Failed to create document: " + response.body());
            }
            return objectMapper.readValue(response.body(), new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public Optional<Map<String, Object>> getDocument(String collectionId, String documentId) {
        try {
            HttpRequest request = requestBuilder("/databases/" + databaseId + "/collections/" + collectionId + "/documents/" + documentId)
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 404) {
                return Optional.empty();
            }
            if (response.statusCode() >= 400) {
                log.error("Appwrite error: {} - {}", response.statusCode(), response.body());
                throw new RuntimeException("Failed to get document: " + response.body());
            }
            return Optional.of(objectMapper.readValue(response.body(), new TypeReference<Map<String, Object>>() {}));
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public Map<String, Object> updateDocument(String collectionId, String documentId, Map<String, Object> data) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("data", data);

            String json = objectMapper.writeValueAsString(body);
            HttpRequest request = requestBuilder("/databases/" + databaseId + "/collections/" + collectionId + "/documents/" + documentId)
                    .method("PATCH", HttpRequest.BodyPublishers.ofString(json))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                log.error("Appwrite error: {} - {}", response.statusCode(), response.body());
                throw new RuntimeException("Failed to update document: " + response.body());
            }
            return objectMapper.readValue(response.body(), new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public void deleteDocument(String collectionId, String documentId) {
        try {
            HttpRequest request = requestBuilder("/databases/" + databaseId + "/collections/" + collectionId + "/documents/" + documentId)
                    .DELETE()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 404) {
                return; // already deleted
            }
            if (response.statusCode() >= 400) {
                log.error("Appwrite error: {} - {}", response.statusCode(), response.body());
                throw new RuntimeException("Failed to delete document: " + response.body());
            }
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> listDocuments(String collectionId, List<String> queries) {
        try {
            StringBuilder uriBuilder = new StringBuilder(endpoint)
                    .append("/databases/").append(databaseId)
                    .append("/collections/").append(collectionId)
                    .append("/documents");

            if (queries != null && !queries.isEmpty()) {
                uriBuilder.append("?");
                for (int i = 0; i < queries.size(); i++) {
                    if (i > 0) {
                        uriBuilder.append("&");
                    }
                    uriBuilder.append("queries[]=").append(URLEncoder.encode(queries.get(i), StandardCharsets.UTF_8));
                }
            }

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(uriBuilder.toString()))
                    .header("Content-Type", "application/json")
                    .header("X-Appwrite-Project", projectId)
                    .header("X-Appwrite-Key", apiKey)
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                log.error("Appwrite error: {} - {}", response.statusCode(), response.body());
                throw new RuntimeException("Failed to list documents: " + response.body());
            }

            Map<String, Object> resMap = objectMapper.readValue(response.body(), new TypeReference<Map<String, Object>>() {});
            Object docs = resMap.get("documents");
            if (docs instanceof List) {
                return (List<Map<String, Object>>) docs;
            }
            return Collections.emptyList();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
