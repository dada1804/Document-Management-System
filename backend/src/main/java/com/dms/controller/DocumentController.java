package com.dms.controller;

import com.dms.dto.DocumentResponse;
import com.dms.entity.Document;
import com.dms.security.JwtTokenUtil;
import com.dms.service.DocumentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.Base64;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    @Autowired
    private DocumentService documentService;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof com.dms.entity.User) {
            com.dms.entity.User user = (com.dms.entity.User) authentication.getPrincipal();
            return user.getId();
        }
        // Add debugging information
        if (authentication != null) {
            System.out.println("Authentication principal type: " + authentication.getPrincipal().getClass().getName());
            System.out.println("Authentication principal: " + authentication.getPrincipal());
        } else {
            System.out.println("No authentication found");
        }
        throw new RuntimeException("User not authenticated");
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "tags", required = false) List<String> tags,
            @RequestParam(value = "isPublic", defaultValue = "false") boolean isPublic,
            @RequestParam(value = "allowedUsers", required = false) List<Long> allowedUsers) {
        
        try {
            Long userId = getCurrentUserId();
            
            Document document = documentService.uploadDocument(file, userId, description, tags, isPublic, allowedUsers);
            
            DocumentResponse response = convertToDocumentResponse(document);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Upload failed: " + e.getMessage());
        }
    }

    @GetMapping("/{documentId}")
    public ResponseEntity<?> getDocument(@PathVariable String documentId) {
        try {
            Long userId = getCurrentUserId();
            
            Optional<Document> documentOpt = documentService.getDocumentByIdForUser(documentId, userId);
            if (documentOpt.isPresent()) {
                DocumentResponse response = convertToDocumentResponse(documentOpt.get());
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving document: " + e.getMessage());
        }
    }

    @GetMapping("/download/{documentId}")
    public ResponseEntity<?> downloadDocument(@PathVariable String documentId) {
        try {
            Long userId = getCurrentUserId();
            
            Optional<Document> documentOpt = documentService.getDocumentByIdForUser(documentId, userId);
            if (documentOpt.isPresent()) {
                Document document = documentOpt.get();
                
                // Increment download count
                documentService.incrementDownloadCount(documentId);
                
                // Decode base64 content
                if (document.getFileContent() != null && !document.getFileContent().isEmpty()) {
                    byte[] fileBytes = Base64.getDecoder().decode(document.getFileContent());
                    
                    return ResponseEntity.ok()
                            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + document.getOriginalFilename() + "\"")
                            .contentType(MediaType.parseMediaType(document.getContentType()))
                            .body(fileBytes);
                } else {
                    return ResponseEntity.notFound().build();
                }
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error downloading document: " + e.getMessage());
        }
    }

    @GetMapping("/{documentId}/content")
    public ResponseEntity<?> getDocumentContent(@PathVariable String documentId) {
        try {
            Long userId = getCurrentUserId();
            
            Optional<Document> documentOpt = documentService.getDocumentByIdForUser(documentId, userId);
            if (documentOpt.isPresent()) {
                Document document = documentOpt.get();
                
                if (document.getFileContent() != null && !document.getFileContent().isEmpty()) {
                    return ResponseEntity.ok()
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(new DocumentContentResponse(document.getFileContent()));
                } else {
                    return ResponseEntity.notFound().build();
                }
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving document content: " + e.getMessage());
        }
    }

    @GetMapping("/my-documents")
    public ResponseEntity<?> getMyDocuments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "uploadDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        try {
            Long userId = getCurrentUserId();
            
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                    Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<Document> documents = documentService.getUserDocuments(userId, pageable);
            Page<DocumentResponse> responses = documents.map(this::convertToDocumentResponse);
            
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving documents: " + e.getMessage());
        }
    }

    @GetMapping("/public")
    public ResponseEntity<?> getPublicDocuments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "uploadDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                    Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<Document> documents = documentService.getPublicDocuments(pageable);
            Page<DocumentResponse> responses = documents.map(this::convertToDocumentResponse);
            
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving public documents: " + e.getMessage());
        }
    }

    @GetMapping("/accessible")
    public ResponseEntity<?> getAccessibleDocuments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "uploadDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        try {
            Long userId = getCurrentUserId();
            
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                    Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            Pageable pageable = PageRequest.of(page, size, sort);
            
            Page<Document> documents = documentService.getAccessibleDocuments(userId, pageable);
            Page<DocumentResponse> responses = documents.map(this::convertToDocumentResponse);
            
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving accessible documents: " + e.getMessage());
        }
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchDocuments(
            @RequestParam String query,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        try {
            Long userId = getCurrentUserId();
            
            Pageable pageable = PageRequest.of(page, size);
            Page<Document> documents = documentService.searchDocuments(query, pageable);
            
            // Convert to responses
            Page<DocumentResponse> responses = documents.map(this::convertToDocumentResponse);
            
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error searching documents: " + e.getMessage());
        }
    }

    @PutMapping("/{documentId}")
    public ResponseEntity<?> updateDocument(
            @PathVariable String documentId,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "tags", required = false) List<String> tags,
            @RequestParam(value = "isPublic", required = false) Boolean isPublic,
            @RequestParam(value = "allowedUsers", required = false) List<Long> allowedUsers) {
        
        try {
            Long userId = getCurrentUserId();
            
            Document updatedDocument = documentService.updateDocument(
                    documentId, description, tags, isPublic != null ? isPublic : false, allowedUsers, userId);
            
            DocumentResponse response = convertToDocumentResponse(updatedDocument);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Update failed: " + e.getMessage());
        }
    }

    @DeleteMapping("/{documentId}")
    public ResponseEntity<?> deleteDocument(@PathVariable String documentId) {
        try {
            Long userId = getCurrentUserId();
            
            documentService.deleteDocument(documentId, userId);
            return ResponseEntity.ok("Document deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Delete failed: " + e.getMessage());
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getDocumentStats() {
        try {
            Long userId = getCurrentUserId();
            
            long userDocumentCount = documentService.getUserDocumentCount(userId);
            long publicDocumentCount = documentService.getPublicDocumentCount();
            
            return ResponseEntity.ok(new DocumentStats(userDocumentCount, publicDocumentCount));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving stats: " + e.getMessage());
        }
    }

    private DocumentResponse convertToDocumentResponse(Document document) {
        return new DocumentResponse(
                document.getId(),
                document.getFilename(),
                document.getOriginalFilename(),
                document.getContentType(),
                document.getFileSize(),
                document.getUploadedBy(),
                document.getUploadedByUsername(),
                document.getUploadDate(),
                document.isPublic(),
                document.getAllowedUsers(),
                document.getDescription(),
                document.getTags(),
                document.getVersion(),
                document.getLastModified(),
                document.getDownloadCount(),
                document.getThumbnailContent()
        );
    }

    // Inner class for stats
    private static class DocumentStats {
        private long userDocumentCount;
        private long publicDocumentCount;

        public DocumentStats(long userDocumentCount, long publicDocumentCount) {
            this.userDocumentCount = userDocumentCount;
            this.publicDocumentCount = publicDocumentCount;
        }

        public long getUserDocumentCount() {
            return userDocumentCount;
        }

        public long getPublicDocumentCount() {
            return publicDocumentCount;
        }
    }

    // Inner class for document content response
    private static class DocumentContentResponse {
        private String content;

        public DocumentContentResponse(String content) {
            this.content = content;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }
    }
} 