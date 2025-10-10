package engineering.app.models.requests;

import engineering.app.models.Book;
import lombok.*;
import org.springframework.web.multipart.MultipartFile;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class BookRequest {
    private Book book;
    private MultipartFile file;
}
