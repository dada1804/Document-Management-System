package com.dms.dto;

import java.time.LocalDateTime;
import java.util.List;

public class DocumentResponse {

    private String id;
    private String filename;
    private String originalFilename;
    private String contentType;
    private Long fileSize;
    private Long uploadedBy;
    private String uploadedByUsername;
    private LocalDateTime uploadDate;
    private boolean isPublic;
    private List<Long> allowedUsers;
    private String description;
    private List<String> tags;
    private Integer version;
    private LocalDateTime lastModified;
    private Long downloadCount;
    private String thumbnailContent;

    // Constructors
    public DocumentResponse() {}

    public DocumentResponse(String id, String filename, String originalFilename, String contentType, 
                          Long fileSize, Long uploadedBy, String uploadedByUsername, LocalDateTime uploadDate, 
                          boolean isPublic, List<Long> allowedUsers, String description, List<String> tags, 
                          Integer version, LocalDateTime lastModified, Long downloadCount, String thumbnailContent) {
        this.id = id;
        this.filename = filename;
        this.originalFilename = originalFilename;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.uploadedBy = uploadedBy;
        this.uploadedByUsername = uploadedByUsername;
        this.uploadDate = uploadDate;
        this.isPublic = isPublic;
        this.allowedUsers = allowedUsers;
        this.description = description;
        this.tags = tags;
        this.version = version;
        this.lastModified = lastModified;
        this.downloadCount = downloadCount;
        this.thumbnailContent = thumbnailContent;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFilename() {
        return filename;
    }

    public void setFilename(String filename) {
        this.filename = filename;
    }

    public String getOriginalFilename() {
        return originalFilename;
    }

    public void setOriginalFilename(String originalFilename) {
        this.originalFilename = originalFilename;
    }

    public String getContentType() {
        return contentType;
    }

    public void setContentType(String contentType) {
        this.contentType = contentType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public Long getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(Long uploadedBy) {
        this.uploadedBy = uploadedBy;
    }

    public String getUploadedByUsername() {
        return uploadedByUsername;
    }

    public void setUploadedByUsername(String uploadedByUsername) {
        this.uploadedByUsername = uploadedByUsername;
    }

    public LocalDateTime getUploadDate() {
        return uploadDate;
    }

    public void setUploadDate(LocalDateTime uploadDate) {
        this.uploadDate = uploadDate;
    }

    public boolean isPublic() {
        return isPublic;
    }

    public void setPublic(boolean aPublic) {
        isPublic = aPublic;
    }

    public List<Long> getAllowedUsers() {
        return allowedUsers;
    }

    public void setAllowedUsers(List<Long> allowedUsers) {
        this.allowedUsers = allowedUsers;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    public LocalDateTime getLastModified() {
        return lastModified;
    }

    public void setLastModified(LocalDateTime lastModified) {
        this.lastModified = lastModified;
    }

    public Long getDownloadCount() {
        return downloadCount;
    }

    public void setDownloadCount(Long downloadCount) {
        this.downloadCount = downloadCount;
    }

    public String getThumbnailContent() {
        return thumbnailContent;
    }

    public void setThumbnailContent(String thumbnailContent) {
        this.thumbnailContent = thumbnailContent;
    }
} 