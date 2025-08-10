package com.dms.service;

import com.dms.entity.Notification;
import com.dms.repository.mongo.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    // Store SSE emitters for real-time notifications
    private final Map<Long, SseEmitter> userEmitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(Long userId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        
        emitter.onCompletion(() -> userEmitters.remove(userId));
        emitter.onTimeout(() -> userEmitters.remove(userId));
        emitter.onError((e) -> userEmitters.remove(userId));
        
        userEmitters.put(userId, emitter);
        
        try {
            emitter.send(SseEmitter.event()
                .name("connected")
                .data("Connected to notification stream"));
        } catch (IOException e) {
            userEmitters.remove(userId);
        }
        
        return emitter;
    }

    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(userId);
    }

    public Page<Notification> getUserNotifications(Long userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return notificationRepository.findByRecipientUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    public Long getUnreadCount(Long userId) {
        return notificationRepository.countByRecipientUserIdAndReadFalse(userId);
    }

    public void markAsRead(String notificationId, Long userId) {
        Optional<Notification> optionalNotification = notificationRepository.findById(notificationId);
        if (optionalNotification.isPresent()) {
            Notification notification = optionalNotification.get();
            if (notification.getRecipientUserId().equals(userId)) {
                notification.setRead(true);
                notificationRepository.save(notification);
            }
        }
    }

    public Notification createNotification(Long recipientUserId, Long senderUserId, String message, String documentId) {
        Notification notification = new Notification(recipientUserId, senderUserId, message, documentId);
        notification = notificationRepository.save(notification);
        
        // Send real-time notification via SSE
        sendRealTimeNotification(recipientUserId, notification);
        
        return notification;
    }

    public void sendRealTimeNotification(Long userId, Notification notification) {
        SseEmitter emitter = userEmitters.get(userId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event()
                    .name("notification")
                    .data(notification));
            } catch (IOException e) {
                userEmitters.remove(userId);
            }
        }
    }

    public List<Notification> getUnreadNotifications(Long userId) {
        return notificationRepository.findUnreadByRecipientUserId(userId);
    }

    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = getUnreadNotifications(userId);
        for (Notification notification : unreadNotifications) {
            notification.setRead(true);
        }
        notificationRepository.saveAll(unreadNotifications);
    }

    public void deleteNotification(String notificationId, Long userId) {
        Optional<Notification> optionalNotification = notificationRepository.findById(notificationId);
        if (optionalNotification.isPresent()) {
            Notification notification = optionalNotification.get();
            if (notification.getRecipientUserId().equals(userId)) {
                notificationRepository.delete(notification);
            }
        }
    }
} 