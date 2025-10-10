package engineering.app.controllers;

import engineering.app.models.Publisher;
import engineering.app.services.PublisherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URISyntaxException;
import java.util.List;

@RestController
@RequestMapping(path = "api/v1/publishers")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")

public class PublisherController {

    private final PublisherService publisherService;

    @Autowired
    public PublisherController(PublisherService publisherService) {
        this.publisherService = publisherService;
    }

    @GetMapping
    public List<Publisher> getAllPublishers() {
        return publisherService.getAllPublishers();
    }

    @PostMapping
    public ResponseEntity<Publisher> addAuthor(@RequestBody Publisher publisher) throws URISyntaxException {
        return publisherService.addPublisher(publisher);
    }

}
