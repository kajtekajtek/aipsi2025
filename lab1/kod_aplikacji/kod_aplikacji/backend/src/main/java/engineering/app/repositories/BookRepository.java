package engineering.app.repositories;

import engineering.app.models.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    Optional<Book> findByIsbn(String title);

    @Query("SELECT DISTINCT b FROM Book b " +
            "WHERE " +
            "(:title IS NULL OR b.title LIKE %:title%) AND " +
            "(:authorsId IS NULL OR EXISTS (SELECT 1 FROM b.authors a WHERE a.id IN :authorsId)) AND " +
            "(:publisherId IS NULL OR b.publisher.id = :publisherId) AND " +
            "(:isEbook IS NULL OR b.isEbook = :isEbook) AND " +
            "(:categoryId IS NULL OR b.category.id = :categoryId) AND " +
            "(:isAvailable IS NULL OR b.available = :isAvailable) AND " +
            "(:isPublished IS NULL OR b.isPublished = :isPublished) AND " +
            "b.isDeleted = false")
    Page<Book> findByParams(String title,
                            List<Long> authorsId,
                            Long publisherId,
                            Boolean isEbook,
                            Long categoryId,
                            Boolean isAvailable,
                            Boolean isPublished,
                            Pageable pageable);

}
