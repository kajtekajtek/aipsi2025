package engineering.app.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder

public class DeletedBook {
    @Id
    @SequenceGenerator(
            name="deleted_book_sequence",
            sequenceName = "deleted_book_sequence",
            allocationSize = 1
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "deleted_book_sequence"
    )
    private Long id;
    @OneToOne
    private Book deletedBook;




}
