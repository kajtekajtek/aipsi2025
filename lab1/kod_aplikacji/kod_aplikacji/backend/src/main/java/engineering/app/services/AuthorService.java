package engineering.app.services;

import engineering.app.models.Author;
import engineering.app.repositories.AuthorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthorService {

    private final AuthorRepository authorRepository;

    public List<Author> getAllAuthors() {
        return authorRepository.findAll();
    }

    public ResponseEntity<Author> addAuthor(Author author) throws URISyntaxException {
        Optional<Author> authorOptional = authorRepository.findByLastNameAndFirstName(author.getLastName(), author.getFirstName());
        if (authorOptional.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
        }
        Author savedAuthor = authorRepository.save(author);
        return ResponseEntity.created(new URI("/authors/" + savedAuthor.getId())).body(savedAuthor);

    }
}
