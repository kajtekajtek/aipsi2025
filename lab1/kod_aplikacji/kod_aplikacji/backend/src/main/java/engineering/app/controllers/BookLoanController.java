package engineering.app.controllers;

import engineering.app.models.BookLoan;
import engineering.app.services.BookLoanService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequestMapping(path = "api/v1/book-loans")
@RequiredArgsConstructor
public class BookLoanController {

    private final BookLoanService bookLoanService;

    @GetMapping(value = "/{offset}/{pageSize}")
    public Page<BookLoan> getBookLoans(@PathVariable int offset, @PathVariable int pageSize, @RequestParam(required = false) Long userId, @RequestParam(required = false) boolean returned, @RequestParam(required = false) boolean accepted) {
        return bookLoanService.getBookLoans(offset, pageSize, userId, returned, accepted);
    }
    @GetMapping(value = "/{id}")
    public BookLoan getBookLoan(@PathVariable Long id) {
        return bookLoanService.getBookLoan(id);
    }
    @PutMapping(value = "/{id}")
    public ResponseEntity<BookLoan> returnBookLoan(@PathVariable Long id) {
        return bookLoanService.returnBookLoan(id);
    }

    @PutMapping(value = "/{id}/accept")
    public ResponseEntity<BookLoan> acceptBookLoan(@PathVariable Long id) {
        return bookLoanService.acceptLoan(id);
    }
    @PutMapping(value = "/{id}/reject")
    public ResponseEntity<BookLoan> rejectBookLoan(@PathVariable Long id) {
        return bookLoanService.rejectLoan(id);
    }

    @PutMapping(value = "/{id}/prolong")
    public ResponseEntity<BookLoan> prolongBookLoan(@PathVariable Long id) {
        return bookLoanService.prolongLoan(id);
    }

}
