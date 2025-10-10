package engineering.app.services;

import engineering.app.models.BookLoan;
import engineering.app.repositories.BookLoanRepository;
import engineering.app.repositories.BookRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class BookLoanService {
    private final BookLoanRepository bookLoanRepository;
    private final BookRepository bookRepository;
    private final NotificationService notificationService;


    public Page<BookLoan> getBookLoans(int offset, int pageSize, Long userId, boolean returned, boolean accepted) {
        return bookLoanRepository.findAllByUserIdAndReturned(userId, returned, accepted, PageRequest.of(offset, pageSize, Sort.by("loanDate").descending()));
    }

    public BookLoan getBookLoan(Long id) {
        return bookLoanRepository.findById(id).orElse(null);
    }

    public ResponseEntity<BookLoan> returnBookLoan(Long id) {
        BookLoan bookLoan = bookLoanRepository.findById(id).orElse(null);
        if (bookLoan == null) {
            return ResponseEntity.notFound().build();
        }
        bookLoan.setReturned(true);
        bookLoan.getBook().setAvailable(true);
        bookLoan.setReturnDate(LocalDate.now());
        bookLoanRepository.save(bookLoan);
        bookRepository.save(bookLoan.getBook());
        return ResponseEntity.ok(bookLoan);
    }

    public ResponseEntity<BookLoan> acceptLoan(Long loanId) {
        try {
            var bookLoan = bookLoanRepository.findById(loanId)
                    .orElseThrow(() -> new EntityNotFoundException("No bookloan found with id: " + loanId));
            bookLoan.setAccepted(true);
            bookLoan.setLoanDate(LocalDate.now());
            bookLoan.setDueDate(bookLoan.getLoanDate().plusMonths(1));
            bookLoanRepository.save(bookLoan);
            notificationService.sendBookLoanAcceptedNotification(bookLoan.getId());
            return ResponseEntity.ok(bookLoan);
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    public ResponseEntity<BookLoan> rejectLoan(Long loanId) {
        var bookLean = bookLoanRepository.findById(loanId).orElseThrow();
        var book = bookLean.getBook();
        bookLean.setRejected(true);
        book.setAvailable(true);
        bookRepository.save(book);
        bookLoanRepository.save(bookLean);
        notificationService.sendBookLoanRejectedNotification(bookLean.getId());
        return ResponseEntity.ok(bookLean);
    }

    public ResponseEntity<BookLoan> prolongLoan(Long loanId) {
        var bookLean = bookLoanRepository.findById(loanId).orElseThrow();
        bookLean.setDueDate(bookLean.getDueDate().plusMonths(1));
        bookLoanRepository.save(bookLean);
        return ResponseEntity.ok(bookLean);
    }
}
