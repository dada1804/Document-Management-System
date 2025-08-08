package com.dms.repository.mongo;

import com.dms.entity.Document;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository extends MongoRepository<Document, String> {

    List<Document> findByUploadedByAndIsDeletedFalse(Long uploadedBy);
    
    List<Document> findByIsPublicTrueAndIsDeletedFalse();
    
    List<Document> findByIsDeletedFalse();
    
    Page<Document> findByIsDeletedFalse(Pageable pageable);
    
    @Query("{'uploadedBy': ?0, 'isDeleted': false}")
    Page<Document> findUserDocuments(Long userId, Pageable pageable);
    
    @Query("{'isPublic': true, 'isDeleted': false}")
    Page<Document> findPublicDocuments(Pageable pageable);
    
    @Query("{'allowedUsers': ?0, 'isDeleted': false}")
    List<Document> findDocumentsSharedWithUser(Long userId);
    
    @Query("{'$or': [{'isPublic': true}, {'uploadedBy': ?0}, {'allowedUsers': ?0}], 'isDeleted': false}")
    List<Document> findAccessibleDocuments(Long userId);
    
    @Query("{'$or': [{'isPublic': true}, {'uploadedBy': ?0}, {'allowedUsers': ?0}], 'isDeleted': false}")
    Page<Document> findAccessibleDocuments(Long userId, Pageable pageable);
    
    @Query("{'originalFilename': {$regex: ?0, $options: 'i'}, 'isDeleted': false}")
    List<Document> findByOriginalFilenameContainingIgnoreCase(String filename);
    
    @Query("{'contentType': ?0, 'isDeleted': false}")
    List<Document> findByContentType(String contentType);
    
    @Query("{'uploadDate': {$gte: ?0, $lte: ?1}, 'isDeleted': false}")
    List<Document> findByUploadDateBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("{'tags': {$in: ?0}, 'isDeleted': false}")
    List<Document> findByTagsIn(List<String> tags);
    
    @Query("{'$or': [{'originalFilename': {$regex: ?0, $options: 'i'}}, {'description': {$regex: ?0, $options: 'i'}}, {'tags': {$regex: ?0, $options: 'i'}}], 'isDeleted': false}")
    List<Document> searchDocuments(String searchTerm);
    
    @Query("{'$or': [{'originalFilename': {$regex: ?0, $options: 'i'}}, {'description': {$regex: ?0, $options: 'i'}}, {'tags': {$regex: ?0, $options: 'i'}}], 'isDeleted': false}")
    Page<Document> searchDocuments(String searchTerm, Pageable pageable);
    
    Optional<Document> findByIdAndIsDeletedFalse(String id);
    
    long countByUploadedByAndIsDeletedFalse(Long uploadedBy);
    
    long countByIsPublicTrueAndIsDeletedFalse();
} 