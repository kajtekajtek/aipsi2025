package engineering.app.repositories;

import engineering.app.models.BookLoan;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookLoanRepository extends JpaRepository<BookLoan, Long> {

    List<BookLoan> findAllByUser_IdOrderByLoanDateDesc(Long userId);
    Page<BookLoan> findAllByUser_IdOrderByLoanDateDesc(Long userId, Pageable pageable);
    List<BookLoan> findAllByAcceptedTrueAndReturnedFalseAndReturnDateIsNull();

   

    List<BookLoan> findAllByBook_Id(Long bookId);
    Page<BookLoan> findAllByBook_Id(Long bookId, Pageable pageable);
    @Query("SELECT bl FROM BookLoan bl " +
                  "WHERE (:userId IS NULL OR bl.user.id = :userId) " +
                  "AND (:returned IS NULL OR bl.returned = :returned) " +
                  "AND (bl.book.isEbook = false) " +
                  "AND (:accepted IS NULL OR bl.accepted = :accepted)")
    Page<BookLoan> findAllByUserIdAndReturned(@Param("userId") Long userId,
                                               @Param("returned") Boolean returned,
                                               @Param("accepted") Boolean accepted,
                                               Pageable pageable);
}
