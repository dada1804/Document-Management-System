package com.dms.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@org.springframework.data.mongodb.core.mapping.Document(collection = "documents")
public class Document {

    @Id
    private String id;

    @Field("filename")
    private String filename;

    @Field("original_filename")
    private String originalFilename;

    @Field("content_type")
    private String contentType;

    @Field("file_size")
    private Long fileSize;

    @Field("file_path")
    private String filePath;

    @Field("file_content")
    private String fileContent; // Base64 encoded file content

    @Field("uploaded_by")
    private Long uploadedBy;

    @Field("uploaded_by_username")
    private String uploadedByUsername;

    @Field("upload_date")
    private LocalDateTime uploadDate;

    @Field("is_public")
    private boolean isPublic = false;

    @Field("allowed_users")
    private List<Long> allowedUsers;

    @Field("description")
    private String description;

    @Field("tags")
    private List<String> tags;

    @Field("version")
    private Integer version = 1;

    @Field("last_modified")
    private LocalDateTime lastModified;

    @Field("download_count")
    private Long downloadCount = 0L;

    @Field("is_deleted")
    private boolean isDeleted = false;

    // Constructors
    public Document() {}

    public Document(String filename, String originalFilename, String contentType, Long fileSize, 
                   String filePath, String fileContent, Long uploadedBy, String uploadedByUsername) {
        this.filename = filename;
        this.originalFilename = originalFilename;
        this.contentType = contentType;
        this.fileSize = fileSize;
        this.filePath = filePath;
        this.fileContent = fileContent;
        this.uploadedBy = uploadedBy;
        this.uploadedByUsername = uploadedByUsername;
        this.uploadDate = LocalDateTime.now();
        this.lastModified = LocalDateTime.now();
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

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getFileContent() {
        return fileContent;
    }

    public void setFileContent(String fileContent) {
        this.fileContent = fileContent;
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

    public boolean isDeleted() {
        return isDeleted;
    }

    public void setDeleted(boolean deleted) {
        isDeleted = deleted;
    }

    // Helper methods
    public void incrementDownloadCount() {
        this.downloadCount++;
    }

    public void updateLastModified() {
        this.lastModified = LocalDateTime.now();
    }

    public boolean canAccess(Long userId) {
        if (isPublic) {
            return true;
        }
        if (uploadedBy.equals(userId)) {
            return true;
        }
        return allowedUsers != null && allowedUsers.contains(userId);
    }

    @Override
    public String toString() {
        return "Document{" +
                "id='" + id + '\'' +
                ", filename='" + filename + '\'' +
                ", originalFilename='" + originalFilename + '\'' +
                ", contentType='" + contentType + '\'' +
                ", fileSize=" + fileSize +
                ", uploadedBy=" + uploadedBy +
                ", uploadedByUsername='" + uploadedByUsername + '\'' +
                ", uploadDate=" + uploadDate +
                ", isPublic=" + isPublic +
                ", version=" + version +
                ", downloadCount=" + downloadCount +
                '}';
    }
} 