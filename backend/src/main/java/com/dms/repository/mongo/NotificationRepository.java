package com.dms.repository.mongo;

import com.dms.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {

    List<Notification> findByRecipientUserIdOrderByCreatedAtDesc(Long recipientUserId);
    
    Page<Notification> findByRecipientUserIdOrderByCreatedAtDesc(Long recipientUserId, Pageable pageable);
    
    long countByRecipientUserIdAndReadFalse(Long recipientUserId);
    
    @Query("{'recipientUserId': ?0, 'read': false}")
    List<Notification> findUnreadByRecipientUserId(Long recipientUserId);
    
    @Query("{'recipientUserId': ?0}")
    List<Notification> findByRecipientUserId(Long recipientUserId);
    
    @Query("{'recipientUserId': ?0}")
    Page<Notification> findByRecipientUserId(Long recipientUserId, Pageable pageable);
} 