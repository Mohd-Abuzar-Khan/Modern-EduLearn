package com.resumade.notification.service;

import com.resumade.notification.entity.Notification;
import com.resumade.notification.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class NotificationServiceImpl implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);

    private final NotificationRepository repository;
    private final JavaMailSender mailSender;
    private final RestTemplate restTemplate;

    public NotificationServiceImpl(NotificationRepository repository, JavaMailSender mailSender, RestTemplate restTemplate) {
        this.repository = repository;
        this.mailSender = mailSender;
        this.restTemplate = restTemplate;
    }

    @Override
    @Transactional
    public Notification createNotification(Integer userId, Notification.NotificationType type, String title, String message, Notification.NotificationChannel channel) {
        Notification notification = new Notification(userId, type, title, message, channel);
        repository.save(notification);

        if (channel == Notification.NotificationChannel.EMAIL || channel == Notification.NotificationChannel.BOTH) {
            sendEmail(userId, title, message);
        }

        log.info("Notification created for user {}: {}", userId, title);
        return notification;
    }

    @Override
    public List<Notification> getUserNotifications(Integer userId) {
        return repository.findByRecipientIdOrderBySentAtDesc(userId);
    }

    @Override
    public long getUnreadCount(Integer userId) {
        return repository.countByRecipientIdAndIsRead(userId, false);
    }

    @Override
    @Transactional
    public void markAsRead(Long id) {
        repository.findById(id).ifPresent(n -> {
            n.setRead(true);
            repository.save(n);
        });
    }

    @Override
    @Transactional
    public void markAllRead(Integer userId) {
        repository.markAllReadForUser(userId);
    }

    @Override
    @Transactional
    public void broadcastNotification(String title, String message, String recipientType) {
        log.info("Starting broadcast for type: {}", recipientType);
        
        List<Integer> userIds;
        try {
            // Fetch users from auth-service
            String token = getAuthToken();
            HttpHeaders headers = new HttpHeaders();
            if (token != null) {
                headers.set("Authorization", "Bearer " + token);
            }
            
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<Map[]> response = restTemplate.exchange(
                    "http://auth-service/api/v1/auth/admin/users",
                    HttpMethod.GET,
                    entity,
                    Map[].class
            );

            if (response.getBody() == null) {
                log.warn("Auth service returned empty user list");
                return;
            }

            userIds = Arrays.stream(response.getBody())
                    .filter(user -> {
                        if ("ALL".equalsIgnoreCase(recipientType)) return true;
                        String plan = (String) user.get("subscriptionPlan");
                        return recipientType.equalsIgnoreCase(plan);
                    })
                    .map(user -> (Integer) user.get("userId"))
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Failed to fetch users from auth-service: {}", e.getMessage());
            // Fallback to existing users in repository as a last resort
            userIds = repository.findAll().stream()
                    .map(Notification::getRecipientId)
                    .distinct()
                    .toList();
        }

        for (Integer userId : userIds) {
            createNotification(userId, Notification.NotificationType.SYSTEM, title, message, Notification.NotificationChannel.IN_APP);
        }
        
        log.info("Broadcast notification sent to {} users: {}", userIds.size(), title);
    }

    private String getAuthToken() {
        Object details = SecurityContextHolder.getContext().getAuthentication().getCredentials();
        if (details instanceof String) {
            return (String) details;
        }
        return null;
    }

    private void sendEmail(Integer userId, String title, String message) {
        try {
            // In a real app, you'd fetch the user's email from the User service/database.
            // For now, we'll log it and attempt sending if credentials are valid.
            log.info("Sending email to user {}: {}", userId, title);
            
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setTo("user-" + userId + "@example.com"); // Mock email
            mail.setSubject(title);
            mail.setText(message);
            // mailSender.send(mail); // Uncomment if SMTP settings are real
        } catch (Exception e) {
            log.error("Failed to send email: {}", e.getMessage());
        }
    }
}
