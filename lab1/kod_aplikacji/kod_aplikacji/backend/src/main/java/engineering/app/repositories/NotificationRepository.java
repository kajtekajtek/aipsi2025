package engineering.app.repositories;

import engineering.app.models.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findAllByRecipient_IdAndReadIsFalseOrderByTimeStampDesc(Long recipientId);
}
