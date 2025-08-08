package com.dms.service;

import com.dms.entity.Document;
import com.dms.entity.User;
import com.dms.repository.mongo.DocumentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.Base64;

@Service
public class DocumentService {

    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private UserService userService;

    @Value("${app.file.allowed-extensions}")
    private String allowedExtensions;

    @Value("${app.file.max-file-size}")
    private Long maxFileSize;

    public Document uploadDocument(MultipartFile file, Long userId, String description, 
                                 List<String> tags, boolean isPublic, List<Long> allowedUsers) throws IOException {
        
        // Validate file
        validateFile(file);
        
        // Get user
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFilename);
        String uniqueFilename = UUID.randomUUID().toString() + "." + fileExtension;
        
        // Convert file to base64
        byte[] fileBytes = file.getBytes();
        String base64Content = Base64.getEncoder().encodeToString(fileBytes);
        
        // Create document entity
        Document document = new Document(
                uniqueFilename,
                originalFilename,
                file.getContentType(),
                file.getSize(),
                uniqueFilename, // Use filename as filePath for reference
                base64Content,
                userId,
                user.getUsername()
        );
        
        document.setDescription(description);
        document.setTags(tags);
        document.setPublic(isPublic);
        document.setAllowedUsers(allowedUsers);
        
        return documentRepository.save(document);
    }

    public Optional<Document> getDocumentById(String documentId) {
        return documentRepository.findByIdAndIsDeletedFalse(documentId);
    }

    public Optional<Document> getDocumentByIdForUser(String documentId, Long userId) {
        Optional<Document> documentOpt = getDocumentById(documentId);
        if (documentOpt.isPresent()) {
            Document document = documentOpt.get();
            if (document.canAccess(userId)) {
                return documentOpt;
            }
        }
        return Optional.empty();
    }

    public Page<Document> getUserDocuments(Long userId, Pageable pageable) {
        return documentRepository.findUserDocuments(userId, pageable);
    }

    public Page<Document> getPublicDocuments(Pageable pageable) {
        return documentRepository.findPublicDocuments(pageable);
    }

    public Page<Document> getAccessibleDocuments(Long userId, Pageable pageable) {
        return documentRepository.findAccessibleDocuments(userId, pageable);
    }

    public List<Document> searchDocuments(String searchTerm) {
        return documentRepository.searchDocuments(searchTerm);
    }

    public Page<Document> searchDocuments(String searchTerm, Pageable pageable) {
        return documentRepository.searchDocuments(searchTerm, pageable);
    }

    public Document updateDocument(String documentId, String description, List<String> tags, 
                                 boolean isPublic, List<Long> allowedUsers, Long userId) {
        Document document = documentRepository.findByIdAndIsDeletedFalse(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        
        // Check if user can modify the document
        if (!document.getUploadedBy().equals(userId)) {
            throw new RuntimeException("You can only modify your own documents");
        }
        
        document.setDescription(description);
        document.setTags(tags);
        document.setPublic(isPublic);
        document.setAllowedUsers(allowedUsers);
        document.updateLastModified();
        
        return documentRepository.save(document);
    }

    public void deleteDocument(String documentId, Long userId) {
        Document document = documentRepository.findByIdAndIsDeletedFalse(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        
        // Check if user can delete the document
        if (!document.getUploadedBy().equals(userId)) {
            throw new RuntimeException("You can only delete your own documents");
        }
        
        document.setDeleted(true);
        documentRepository.save(document);
    }

    public void incrementDownloadCount(String documentId) {
        Optional<Document> documentOpt = getDocumentById(documentId);
        if (documentOpt.isPresent()) {
            Document document = documentOpt.get();
            document.incrementDownloadCount();
            documentRepository.save(document);
        }
    }

    public List<Document> getDocumentsByContentType(String contentType) {
        return documentRepository.findByContentType(contentType);
    }

    public List<Document> getDocumentsByTags(List<String> tags) {
        return documentRepository.findByTagsIn(tags);
    }

    public List<Document> getDocumentsByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return documentRepository.findByUploadDateBetween(startDate, endDate);
    }

    public long getUserDocumentCount(Long userId) {
        return documentRepository.countByUploadedByAndIsDeletedFalse(userId);
    }

    public long getPublicDocumentCount() {
        return documentRepository.countByIsPublicTrueAndIsDeletedFalse();
    }

    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }
        
        if (file.getSize() > maxFileSize) {
            throw new RuntimeException("File size exceeds maximum allowed size");
        }
        
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            throw new RuntimeException("Invalid filename");
        }
        
        String fileExtension = getFileExtension(originalFilename).toLowerCase();
        if (!allowedExtensions.contains(fileExtension)) {
            throw new RuntimeException("File type not allowed. Allowed types: " + allowedExtensions);
        }
    }

    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex > 0) {
            return filename.substring(lastDotIndex + 1);
        }
        return "";
    }
} 