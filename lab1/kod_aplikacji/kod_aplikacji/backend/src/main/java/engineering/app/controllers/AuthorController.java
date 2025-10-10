package engineering.app.controllers;

import engineering.app.models.Author;
import engineering.app.services.AuthorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URISyntaxException;
import java.util.List;

@RestController
@RequestMapping(path="api/v1/authors")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AuthorController {

    private final AuthorService authorService;

    public AuthorController(AuthorService authorService) {
        this.authorService = authorService;
    }

    @GetMapping
    public List<Author> getAuthors() {
        return authorService.getAllAuthors();
    }

    @PostMapping
    public ResponseEntity<Author> addAuthor(@RequestBody Author author) throws URISyntaxException {
        return authorService.addAuthor(author);
    }

}
