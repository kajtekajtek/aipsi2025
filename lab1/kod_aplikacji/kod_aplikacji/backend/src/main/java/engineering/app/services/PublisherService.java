package engineering.app.services;

import engineering.app.models.Publisher;
import engineering.app.repositories.PublisherRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Optional;

@Service
public class PublisherService {

    private final PublisherRepository publisherRepository;

    @Autowired
    public PublisherService(PublisherRepository publisherRepository) {
        this.publisherRepository = publisherRepository;
    }

    public List<Publisher> getAllPublishers(){
        return publisherRepository.findAll();
    }

    public ResponseEntity<Publisher> addPublisher(Publisher publisher) throws URISyntaxException {
        Optional<Publisher> publisherOptional = publisherRepository.findByName(publisher.getName());
        if (publisherOptional.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
        }
        Publisher savedPublisher = publisherRepository.save(publisher);
        return ResponseEntity.created(new URI("/publishers/" + savedPublisher.getId())).body(savedPublisher);

    }
}
