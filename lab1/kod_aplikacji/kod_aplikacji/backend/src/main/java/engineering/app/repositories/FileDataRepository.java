package engineering.app.repositories;


import engineering.app.models.FileData;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FileDataRepository extends JpaRepository<FileData,Integer> {

}
