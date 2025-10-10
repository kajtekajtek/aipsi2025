package engineering.app.controllers;

import engineering.app.services.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping(path="api/v1/storage")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
@RequiredArgsConstructor
public class StorageController {

    private final StorageService storageService;

    @GetMapping("/books/{id}/download")
    public ResponseEntity<Resource> downloadBookPDF(@PathVariable Long id) {
      return storageService.downloadBookFile(id);
    }
    @GetMapping("/labs")
    public ResponseEntity<List<Object>> getFolderStructure() {
        return storageService.getFolderStructure();
    }
    @GetMapping("labs/download/{fileName}")
    public ResponseEntity<Resource> downloadLabFile(@PathVariable String fileName, @RequestParam String filePath) throws IOException {
        return storageService.downloadFile(fileName, filePath);
    }
}
