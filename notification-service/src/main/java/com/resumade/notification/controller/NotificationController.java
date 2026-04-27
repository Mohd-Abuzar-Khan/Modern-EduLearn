package com.resumade.notification.controller;

import com.resumade.notification.entity.Notification;
import com.resumade.notification.service.NotificationService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications(HttpServletRequest request) {
        Integer userId = (Integer) request.getAttribute("userId");
        return ResponseEntity.ok(notificationService.getUserNotifications(userId));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(HttpServletRequest request) {
        Integer userId = (Integer) request.getAttribute("userId");
        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllRead(HttpServletRequest request) {
        Integer userId = (Integer) request.getAttribute("userId");
        notificationService.markAllRead(userId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/broadcast")
    public ResponseEntity<Void> broadcast(
            @RequestParam String title,
            @RequestParam String message,
            @RequestParam(defaultValue = "ALL") String recipientType) {
        notificationService.broadcastNotification(title, message, recipientType);
        return ResponseEntity.ok().build();
    }
}
