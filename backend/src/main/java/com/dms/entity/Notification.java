package com.dms.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    @Field("recipient_user_id")
    private Long recipientUserId;

    @Field("sender_user_id")
    private Long senderUserId;

    @Field("message")
    private String message;

    @Field("document_id")
    private String documentId;

    @Field("created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @Field("is_read")
    private boolean read = false;

    public Notification() {}

    public Notification(Long recipientUserId, Long senderUserId, String message, String documentId) {
        this.recipientUserId = recipientUserId;
        this.senderUserId = senderUserId;
        this.message = message;
        this.documentId = documentId;
        this.createdAt = LocalDateTime.now();
        this.read = false;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Long getRecipientUserId() {
        return recipientUserId;
    }

    public void setRecipientUserId(Long recipientUserId) {
        this.recipientUserId = recipientUserId;
    }

    public Long getSenderUserId() {
        return senderUserId;
    }

    public void setSenderUserId(Long senderUserId) {
        this.senderUserId = senderUserId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getDocumentId() {
        return documentId;
    }

    public void setDocumentId(String documentId) {
        this.documentId = documentId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }
} 