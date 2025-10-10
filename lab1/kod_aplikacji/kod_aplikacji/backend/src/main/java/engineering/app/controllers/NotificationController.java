package engineering.app.controllers;

import engineering.app.models.Notification;
import engineering.app.services.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping(path="api/v1/notifications")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/user/{userId}")
    public List<Notification> getUserNotifications(@PathVariable Long userId) {
        return notificationService.getUserNotifications(userId);
    }
    @PostMapping("/reminder/{bookLoanId}")
    public ResponseEntity<Notification> sendRemainderNotification(@PathVariable Long bookLoanId) {
        return notificationService.sendRemainderNotification(bookLoanId);
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Notification> markNotificationAsRead(@PathVariable Long notificationId) {
        return notificationService.markNotificationAsRead(notificationId);
    }
    @PutMapping("/user/{userId}/read")
    public ResponseEntity<List<Notification>> markAllNotificationsAsRead(@PathVariable Long userId) {
        return notificationService.markAllNotificationsAsRead(userId);
    }
    @PostMapping("/bookRejected/{bookId}")
    public ResponseEntity<Notification> sendBookRejectedNotification(@PathVariable Long bookId) {
        return notificationService.sendBookRejectedNotification(bookId);
    }
    @PostMapping("/bookAccepted/{bookId}")
    public ResponseEntity<Notification> sendBookAcceptedNotification(@PathVariable Long bookId) {
        return notificationService.sendBookAcceptedNotification(bookId);
    }
    @PostMapping("/bookReturned/{bookLoanId}")
    public ResponseEntity<Notification> sendBookReturnedNotification(@PathVariable Long bookLoanId) {
        return notificationService.sendBookReturnedNotification(bookLoanId);
    }
    @PostMapping("bookLoanAccepted/{bookLoanId}")
    public ResponseEntity<Notification> sendBookLoanAcceptedNotification(@PathVariable Long bookLoanId) {
        return notificationService.sendBookLoanAcceptedNotification(bookLoanId);
    }
    @PostMapping("bookLoanRejected/{bookLoanId}")
    public ResponseEntity<Notification> sendBookLoanRejectedNotification(@PathVariable Long bookLoanId) {
        return notificationService.sendBookLoanRejectedNotification(bookLoanId);
    }
    
}
