package engineering.app.repositories;

import engineering.app.models.DeletedBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DeletedBookRepository extends JpaRepository<DeletedBook, Long> {

}
