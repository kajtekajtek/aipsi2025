package engineering.app.controllers;

import engineering.app.models.Book;
import engineering.app.models.BookLoan;
import engineering.app.services.BookService;
import jakarta.annotation.Nullable;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URISyntaxException;
import java.util.List;

@RestController
@RequestMapping(path = "api/v1/books")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class BookController {

    private final BookService bookService;

    @Autowired
    public BookController(BookService bookService) {
        this.bookService = bookService;
    }

    @GetMapping
    public List<Book> getBooks() {
        return bookService.getAllBooks();
    }

    @GetMapping(value = "/{id}")
    public Book getBookById(@PathVariable Long id) {
        return bookService.getBook(id);
    }

    @PostMapping(consumes = {"multipart/form-data"})
    @ResponseBody
    public ResponseEntity<Book> addBook(@RequestPart("book") Book book, @RequestPart("file") @Nullable MultipartFile file, @RequestPart("pdfFile") @Nullable MultipartFile pdfFile, @RequestParam("userId") Long userId) throws URISyntaxException, IOException {
        return bookService.addBook(userId, book, file, pdfFile);
    }

    @PutMapping(value = "/{id}")
    public ResponseEntity<Book> editBook(@PathVariable Long id, @RequestPart("book") Book book, @RequestPart("file") @Nullable MultipartFile file, @RequestPart("pdfFile") @Nullable MultipartFile pdfFile) throws IOException {
        return bookService.editBook(id, book, file, pdfFile);
    }

    @DeleteMapping(value = "/{id}")
    public ResponseEntity<Book> deleteBook(@PathVariable Long id, @RequestParam(required = false) boolean pending) {
        return bookService.deleteBook(id, pending);
    }

    @GetMapping(value = "/pagination/{offset}/{pageSize}")
    public Page<Book> getBooksWithPagination(
            @PathVariable int offset,
            @PathVariable int pageSize,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) List<Long> authorsId,
            @RequestParam(required = false) Boolean isEbook,
            @RequestParam(required = false) Long publisherId,
            @RequestParam(required = false) Boolean isAvailable,
            @RequestParam(required = false) Boolean isPublished
    ) {
        return bookService.getBooksWithPagination(offset, pageSize, title, categoryId, authorsId, isEbook, publisherId, isAvailable, isPublished);
    }

    @PostMapping(value = "/{bookId}/loan/{userId}")
    public ResponseEntity<BookLoan> loanBook(@PathVariable Long bookId, @PathVariable Long userId) {
        return bookService.loanBook(bookId, userId);
    }

    @GetMapping(value = "/loan/user/{userId}")
    public List<BookLoan> getUsersLoans(@PathVariable Long userId) {
        return bookService.getUsersLoans(userId);
    }

    @GetMapping(value = "/loan/user/{userId}/pagination/{offset}/{pageSize}")
    public Page<BookLoan> getUserLoansWithPagination(@PathVariable int offset, @PathVariable int pageSize, @PathVariable Long userId) {
        return bookService.getUserBookLoans(userId, offset, pageSize);
    }

    @GetMapping(value = "/loan/book/{bookId}")
    public List<BookLoan> getBookLoans(@PathVariable Long bookId) {
        return bookService.getBooksLoans(bookId);
    }

    @GetMapping(value = "/loan/book/{bookId}/pagination/{offset}/{pageSize}")
    public Page<BookLoan> getBookLoansWithPagination(@PathVariable int offset, @PathVariable int pageSize, @PathVariable Long bookId) {
        return bookService.getBookLoans(bookId, offset, pageSize);
    }

    @PostMapping(value = "/loan/return/{loanId}")
    public ResponseEntity<BookLoan> returnBook(@PathVariable Long loanId) {
        return bookService.returnBook(loanId);
    }

    @PutMapping(value = "/{id}/accept")
    public ResponseEntity<Book> acceptBook(@PathVariable Long id) {
        return bookService.acceptBook(id);
    }
}
