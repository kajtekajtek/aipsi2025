package engineering.app.models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookLoan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDate requestDate;
    private LocalDate loanDate;
    private LocalDate returnDate;
    private LocalDate dueDate;
    private boolean returned;
    private boolean accepted;
    private boolean rejected;
    @ManyToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")

    private User user;

    @ManyToOne
    @JoinColumn(name = "book_id", referencedColumnName = "id")
    private Book book;
}
