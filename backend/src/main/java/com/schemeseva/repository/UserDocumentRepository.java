package com.schemeseva.repository;

import com.schemeseva.model.UserDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface UserDocumentRepository extends MongoRepository<UserDocument, String> {
    List<UserDocument> findByUserId(String userId);
    Optional<UserDocument> findByUserIdAndSchemeId(String userId, String schemeId);
}
