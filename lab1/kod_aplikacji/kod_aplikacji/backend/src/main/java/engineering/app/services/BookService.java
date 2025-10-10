package engineering.app.services;

import engineering.app.exceptions.BookNotFoundException;
import engineering.app.models.*;
import engineering.app.repositories.BookLoanRepository;
import engineering.app.repositories.BookRepository;
import engineering.app.repositories.DeletedBookRepository;
import engineering.app.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;
    private final UserRepository userRepository;
    private final BookLoanRepository bookLoanRepository;
    private final StorageService storageService;
    private final DeletedBookRepository deletedBookRepository;
    private final NotificationService notificationService;


    public List<Book> getAllBooks() {
        return bookRepository.findAll();
    }

    public Book getBook(Long id) {
        var book = bookRepository.findById(id)
                .orElseThrow(() -> new BookNotFoundException("Book not found with id: " + id));
        book.setBookLoans(book.getBookLoans());
        return book;
    }

    public ResponseEntity<Book> addBook(Long userId, Book book, MultipartFile file, MultipartFile pdfFile) throws URISyntaxException, IOException {
        var user = userRepository.findById(userId).orElseThrow();
        Optional<Book> bookByIsbn = bookRepository.findByIsbn(book.getIsbn());
        if (bookByIsbn.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
        }
        if (file !=null) {
            ImageData bookFileData = storageService.uploadImage(file, null);
            book.setImageData(bookFileData);
        }

        if (pdfFile != null && book.isEbook()){
            FileData pdfFileData = storageService.uploadToFileSystem(pdfFile, book);
            book.setFileData(pdfFileData);
        } else if (pdfFile == null && book.isEbook()) {
            return ResponseEntity.badRequest().body(null);
        }
        book.setUser(user);
        Book savedBook = bookRepository.save(book);
        return ResponseEntity.created(new URI("/api/v1/books/" + savedBook.getId())).body(savedBook);
    }

    public ResponseEntity<Book> editBook(Long id, Book book, MultipartFile file, MultipartFile pdfFile) throws IOException {
        Book currentBook = getBook(id);
        BeanUtils.copyProperties(book, currentBook, "id", "bookLoans", "imageData", "fileData", "available", "isPublished", "user");
        if (file != null) {
            ImageData bookFileData = storageService.uploadImage(file, id);
            currentBook.setImageData(bookFileData);
        }

        if (pdfFile != null && book.isEbook()){
            FileData pdfFileData = storageService.uploadToFileSystem(pdfFile, currentBook);
            currentBook.setFileData(pdfFileData);
        } else if (pdfFile == null && book.isEbook()) {
            return ResponseEntity.badRequest().body(null);
        }
        currentBook = bookRepository.save(currentBook);
        return ResponseEntity.ok(currentBook);
    }

    public ResponseEntity<Book> deleteBook(Long id, boolean pending) {
        Book book = getBook(id);
        book.setDeleted(true);
        DeletedBook deletedBook = DeletedBook.builder()
                        .deletedBook(book)
                        .build();
        deletedBookRepository.save(deletedBook);
        bookRepository.save(book);
        if(pending){
            notificationService.sendBookRejectedNotification(book.getId());
        }

        return ResponseEntity.ok().build();
    }

    public Page<Book> getBooksWithPagination(int offset, int pageSize, String title, Long categoryId, List<Long> authorsId, Boolean isEbook, Long publisherId, Boolean isAvailable, Boolean isPublished) {
        return bookRepository.findByParams(title, authorsId, publisherId, isEbook, categoryId, isAvailable, isPublished, PageRequest.of(offset, pageSize));
    }

    public Page<BookLoan> getUserBookLoans(Long userId, int offset, int pageSize) {
        return bookLoanRepository.findAllByUser_IdOrderByLoanDateDesc(userId, PageRequest.of(offset, pageSize));
    }
    public Page<BookLoan> getBookLoans(Long bookId, int offset, int pageSize) {
        return bookLoanRepository.findAllByBook_Id(bookId, PageRequest.of(offset, pageSize));
    }

    public ResponseEntity<BookLoan> loanBook(Long bookId, Long userId) {
        var book = getBook(bookId);
        if(book.isEbook() || !book.isAvailable() || book.isDeleted() || !book.isPublished()){
            return ResponseEntity.badRequest().build();
        }
        book.setAvailable(false);
        var user = userRepository.findById(userId).orElseThrow();
        var bookLoan = BookLoan.builder()
                .book(book)
                .user(user)
                .requestDate(LocalDate.now())
                .returned(false)
                .accepted(false)
                .build();
        bookLoanRepository.save(bookLoan);
        bookRepository.save(book);
        return ResponseEntity.ok(bookLoan);
    }

    public ResponseEntity<BookLoan> returnBook(Long loanId) {
        var bookLean = bookLoanRepository.findById(loanId).orElseThrow();
        bookLean.setReturned(true);
        bookLean.setReturnDate(LocalDate.now());
        bookLean.getBook().setAvailable(true);
        bookLoanRepository.save(bookLean);
        return ResponseEntity.ok(bookLean);
    }

    public List<BookLoan> getUsersLoans(Long userId) {
        var userLoans =  bookLoanRepository.findAllByUser_IdOrderByLoanDateDesc(userId);
        for (BookLoan bookLoan : userLoans) {
            bookLoan.setUser(null);
        }
        return userLoans;
    }

    public List<BookLoan> getBooksLoans(Long bookId) {
        var bookLoans = bookLoanRepository.findAllByBook_Id(bookId);
        for (BookLoan bookLoan : bookLoans) {
            bookLoan.setBook(null);
        }
        return bookLoans;
    }

    public ResponseEntity<Book> acceptBook(Long id) {
        Book book = getBook(id);
        book.setPublished(true);
        book = bookRepository.save(book);
        notificationService.sendBookAcceptedNotification(id);
        return ResponseEntity.ok(book);
    }
}
