package engineering.app.repositories;

import engineering.app.models.ImageData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface StorageRepository extends JpaRepository<ImageData, Long> {

}
