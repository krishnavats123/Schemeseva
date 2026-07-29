package com.schemeseva.repository;

import com.schemeseva.model.Scheme;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;

public interface SchemeRepository extends MongoRepository<Scheme, String> {

    List<Scheme> findByActiveTrue();

    // Full-text search by name, description, or tags
    @Query("{ 'active': true, $or: [ " +
           "{ 'schemeName': { $regex: ?0, $options: 'i' } }, " +
           "{ 'description': { $regex: ?0, $options: 'i' } }, " +
           "{ 'tags': { $regex: ?0, $options: 'i' } } ] }")
    Page<Scheme> searchSchemes(String keyword, Pageable pageable);

    // Find schemes by tag
    @Query("{ 'active': true, 'tags': { $in: [?0] } }")
    List<Scheme> findByTag(String tag);

    // Find recently added active schemes
    List<Scheme> findTop10ByActiveTrueOrderByCreatedAtDesc();
}
