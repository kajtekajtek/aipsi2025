package engineering.app.services;

import engineering.app.enums.NotificationType;
import engineering.app.models.BookLoan;
import engineering.app.models.Notification;
import engineering.app.repositories.BookLoanRepository;
import engineering.app.repositories.BookRepository;
import engineering.app.repositories.NotificationRepository;
import engineering.app.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@SuppressWarnings("OptionalGetWithoutIsPresent")
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final BookLoanRepository bookLoanRepository;
    private final NotificationRepository notificationRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;


    public ResponseEntity<Notification> sendRemainderNotification(Long bookLoanId) {
        var bookLoan = bookLoanRepository.findById(bookLoanId);
        var user = userRepository.findById(bookLoan.get().getUser().getId());
        var notification = Notification.builder()
                .recipient(user.get())
                .notificationType(NotificationType.BOOK_LOAN_REMINDER)
                .bookLoan(bookLoan.get())
                .isRead(false)
                .build();
        var savedNotification = notificationRepository.save(notification);
        return ResponseEntity.ok(savedNotification);
    }

    public ResponseEntity<Notification> sendBookAcceptedNotification(Long bookId) {
        var book = bookRepository.findById(bookId);
        var user = userRepository.findById(book.get().getUser().getId());
        var notification = Notification.builder()
                .recipient(user.get())
                .notificationType(NotificationType.BOOK_ACCEPTED)
                .book(book.get())
                .isRead(false)
                .build();
        var savedNotification = notificationRepository.save(notification);
        return ResponseEntity.ok(savedNotification);
    }

    public ResponseEntity<Notification> sendBookRejectedNotification(Long bookId) {
        var book = bookRepository.findById(bookId);
        var user = userRepository.findById(book.get().getUser().getId());
        var notification = Notification.builder()
                .recipient(user.get())
                .notificationType(NotificationType.BOOK_REJECTED)
                .book(book.get())
                .isRead(false)
                .build();
        var savedNotification = notificationRepository.save(notification);
        return ResponseEntity.ok(savedNotification);
    }

    public ResponseEntity<Notification> sendBookReturnedNotification(Long bookLoanId) {
        var bookLoan = bookLoanRepository.findById(bookLoanId);
        var user = userRepository.findById(bookLoan.get().getUser().getId());
        var notification = Notification.builder()
                .recipient(user.get())
                .notificationType(NotificationType.BOOK_RETURN)
                .bookLoan(bookLoan.get())
                .isRead(false)
                .build();
        var savedNotification = notificationRepository.save(notification);
        return ResponseEntity.ok(savedNotification);
    }

    public void sendBookLoanExpiredNotification(Long bookLoanId) {
        var bookLoan = bookLoanRepository.findById(bookLoanId);
        var user = userRepository.findById(bookLoan.get().getUser().getId());
        var notification = Notification.builder()
                .recipient(user.get())
                .notificationType(NotificationType.BOOK_LOAN_EXPIRED)
                .bookLoan(bookLoan.get())
                .isRead(false)
                .build();
        var savedNotification = notificationRepository.save(notification);
        ResponseEntity.ok(savedNotification);
    }

    public ResponseEntity<Notification> sendBookLoanAcceptedNotification(Long bookLoanId) {
        var bookLoan = bookLoanRepository.findById(bookLoanId);
        var user = userRepository.findById(bookLoan.get().getUser().getId());
        var notification = Notification.builder()
                .recipient(user.get())
                .notificationType(NotificationType.BOOK_LOAN_REQUEST_ACCEPTED)
                .bookLoan(bookLoan.get())
                .isRead(false)
                .build();
        var savedNotification = notificationRepository.save(notification);
        return ResponseEntity.ok(savedNotification);
    }

    public ResponseEntity<Notification> sendBookLoanRejectedNotification(Long bookLoanId) {
        var bookLoan = bookLoanRepository.findById(bookLoanId);
        var user = userRepository.findById(bookLoan.get().getUser().getId());
        var notification = Notification.builder()
                .recipient(user.get())
                .notificationType(NotificationType.BOOK_LOAN_REQUEST_REJECTED)
                .bookLoan(bookLoan.get())
                .isRead(false)
                .build();
        var savedNotification = notificationRepository.save(notification);
        return ResponseEntity.ok(savedNotification);
    }


    public List<Notification> getUserNotifications(Long userId) {
        return notificationRepository.findAllByRecipient_IdAndIsReadIsFalseOrderByTimeStampDesc(userId);
    }

    public ResponseEntity<Notification> markNotificationAsRead(Long notificationId) {
        var notification = notificationRepository.findById(notificationId);
        if (notification.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        notification.get().setRead(true);
        var savedNotification = notificationRepository.save(notification.get());
        return ResponseEntity.ok(savedNotification);
    }

    public ResponseEntity<List<Notification>> markAllNotificationsAsRead(Long userId) {
        var notifications = notificationRepository.findAllByRecipient_IdAndIsReadIsFalseOrderByTimeStampDesc(userId);
        notifications.forEach(notification -> notification.setRead(true));
        var savedNotifications = notificationRepository.saveAll(notifications);
        return ResponseEntity.ok(savedNotifications);
    }

    @Scheduled(cron = "0 0 3 * * * ")
    public void sendRemainderNotifications() {

        var notReturnedBookLoans = bookLoanRepository.findAllByAcceptedTrueAndReturnedFalseAndReturnDateIsNull();
        List<BookLoan> filteredBookLoans = notReturnedBookLoans.stream()
                .filter(bookLoan -> {
                    long daysDifference = ChronoUnit.DAYS.between(LocalDate.now(), bookLoan.getDueDate());
                    return daysDifference <= 7 && daysDifference >= 0;
                })
                .toList();
        filteredBookLoans.forEach(bookLoan -> sendRemainderNotification(bookLoan.getId()));
    }

    @Scheduled(cron = "0 0 3 * * * ")
    public void sendExpirationNotifications() {
        var notReturnedBookLoans = bookLoanRepository.findAllByAcceptedTrueAndReturnedFalseAndReturnDateIsNull();
        List<BookLoan> filteredBookLoans = notReturnedBookLoans.stream()
                .filter(bookLoan -> LocalDate.now().isAfter(bookLoan.getDueDate()))
                .toList();
        filteredBookLoans.forEach(bookLoan -> sendBookLoanExpiredNotification(bookLoan.getId()));
    }

}
