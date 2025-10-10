package engineering.app.services;

import engineering.app.models.*;
import engineering.app.repositories.BookRepository;
import engineering.app.repositories.FileDataRepository;
import engineering.app.repositories.StorageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriUtils;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.Normalizer;
import java.util.*;

@SuppressWarnings({"CallToPrintStackTrace", "ResultOfMethodCallIgnored"})
@Service
@RequiredArgsConstructor
public class StorageService {

    private final StorageRepository storageRepository;
    private final FileDataRepository fileDataRepository;
    private final BookRepository bookRepository;

    private final static String FOLDER_PATH_STRING=System.getProperty("user.dir")+"/storage/";
    private static final String LABS_FOLDER_PATH = FOLDER_PATH_STRING + "Labs";
    public ImageData uploadImage(MultipartFile file, Long id) throws IOException {
        if (id != null) {
            var book = bookRepository.findById(id).orElseThrow();
            if (book.getImageData() != null) {
                storageRepository.deleteById(book.getImageData().getId());
            }
        }
        String fileExtension = Objects.requireNonNull(file.getOriginalFilename())
                .substring(file.getOriginalFilename().lastIndexOf(".") + 1);
        String base64Image = Base64.getEncoder().encodeToString(file.getBytes());
        String dbString = "data:image/" + fileExtension + ";base64," + base64Image;
        return storageRepository.save(ImageData.builder()
                .name(file.getOriginalFilename())
                .type(file.getContentType())
                .imageData(dbString).build());
    }

    public FileData uploadToFileSystem(MultipartFile file, Book book) throws IOException {
        if (file == null) {
            return null;
        }

        String title = book.getTitle();
        String isbn = book.getIsbn();

        String fileExtension = getFileExtension(file);

        ByteBuffer encodedTitleBuffer = StandardCharsets.UTF_8.encode(title);
        String encodedTitle = StandardCharsets.UTF_8.decode(encodedTitleBuffer).toString();

        String folderName = encodedTitle + "_" + isbn;
        folderName = folderName.replaceAll("\\s+", "_");

        Path folderPath = Paths.get(FOLDER_PATH_STRING).resolve(folderName);

        if (!Files.exists(folderPath)) {
            try {
                Files.createDirectories(folderPath);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        String fileName = UUID.randomUUID() + fileExtension;
        Path filePath = folderPath.resolve(fileName);

        FileData fileData = fileDataRepository.save(FileData.builder()
                .name(fileName)
                .type(file.getContentType())
                .filePath(filePath.toString()).build());

        file.transferTo(filePath.toFile());
        return fileData;
    }

    public ResponseEntity<List<Object>> getFolderStructure() {
        File folder = new File(FOLDER_PATH_STRING + "Labs");
        if (!folder.exists() || !folder.isDirectory()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        List<FileStructure> folderStructure = buildFolderStructure();

        List<Object> jsonArray = convertToJson(folderStructure);
        return ResponseEntity.ok(jsonArray);
    }

    private String getFileExtension(MultipartFile file) {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename != null) {
            int lastIndex = originalFilename.lastIndexOf('.');
            if (lastIndex > 0) {
                return originalFilename.substring(lastIndex);
            }
        }
        return "";
    }


    public ResponseEntity<Resource> downloadBookFile(Long id) {
        try {
            var book = bookRepository.findById(id).orElseThrow();

            File file = new File(book.getFileData().getFilePath());
            if (!file.exists()) {
                return ResponseEntity.notFound().build();
            }

            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + book.getFileData().getName());
            headers.add("Cache-Control", "no-cache, no-store, must-revalidate");
            headers.add("Pragma", "no-cache");
            headers.add("Expires", "0");

            Path path = Paths.get(file.getAbsolutePath());
            ByteArrayResource resource = new ByteArrayResource(Files.readAllBytes(path));

            return ResponseEntity.ok()
                    .headers(headers)
                    .contentLength(file.length())
                    .contentType(MediaType.parseMediaType("application/octet-stream"))
                    .body(resource);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        } catch (NoSuchElementException e) {
            return ResponseEntity.notFound().build();
        }
    }
    public ResponseEntity<Resource> downloadFile(String fileName, String path) throws IOException {
        String decodedFileName = UriUtils.decode(fileName, StandardCharsets.UTF_16);

        File file = searchFile(new File(path), decodedFileName);

        if (file == null) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new InputStreamResource(new FileInputStream(file));
        String normalizedText = normalizeToAscii(decodedFileName);


        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + normalizedText);

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

    private File searchFile(File directory, String fileName) {
        if (directory.isDirectory()) {
            File[] files = directory.listFiles();
            if (files != null) {
                for (File file : files) {
                    if (file.isDirectory()) {
                        File foundFile = searchFile(file, fileName);
                        if (foundFile != null) {
                            return foundFile;
                        }
                    } else if (file.getName().equals(fileName)) {
                        return file;
                    }
                }
            }
        }
        return null;
    }

    private static List<FileStructure> buildFolderStructure() {
        List<FileStructure> result = new ArrayList<>();
        File labsFolder = new File(LABS_FOLDER_PATH);
        if (!labsFolder.exists()) {
            labsFolder.mkdirs();
        }
        if (labsFolder.isDirectory()) {
            result.addAll(buildFolderStructureRecursive(labsFolder));
        }
        return result;
    }

    private static List<FileStructure> buildFolderStructureRecursive(File folder) {
        List<FileStructure> result = new ArrayList<>();
        FileStructure fileStructure = new FileStructure();
        fileStructure.setId(folder.getName());
        fileStructure.setLabel(folder.getName());
        fileStructure.setFullPath(folder.getAbsolutePath());
        List<FileStructure> children = new ArrayList<>();
        for (File file : Objects.requireNonNull(folder.listFiles())) {
            if (file.isDirectory()) {
                children.addAll(buildFolderStructureRecursive(file));
            } else {
                FileStructure childFileStructure = new FileStructure();
                childFileStructure.setId(file.getName() + UUID.randomUUID());
                childFileStructure.setLabel(file.getName());
                childFileStructure.setFullPath(file.getAbsolutePath());
                childFileStructure.setFileType(getFileType(file.getName()));
                children.add(childFileStructure);
            }
        }
        fileStructure.setChildren(children);
        result.add(fileStructure);
        return result;
    }

    private static String getFileType(String fileName) {
        String extension = getFileExtension(fileName);
        if (extension != null) {
            return switch (extension.toLowerCase()) {
                case "jpg", "jpeg", "png", "gif", "bmp" -> "image";
                case "mp4", "avi", "mkv", "mov", "wmv" -> "video";
                default -> extension;
            };
        }
        return "";
    }

    private static String getFileExtension(String fileName) {
        int lastDotIndex = fileName.lastIndexOf('.');
        if (lastDotIndex != -1 && lastDotIndex < fileName.length() - 1) {
            return fileName.substring(lastDotIndex + 1);
        }
        return null;
    }

    private static List<Object> convertToJson(List<FileStructure> folderStructure) {
        List<Object> jsonArray = new ArrayList<>();
        for (FileStructure fileStructure : folderStructure) {
            List<Object> childrenJson = new ArrayList<>();
            for (FileStructure child : fileStructure.getChildren()) {
                childrenJson.add(convertToJson(child));
            }
            jsonArray.add(new FolderJson(fileStructure.getId(), fileStructure.getLabel(), childrenJson, null, fileStructure.getFullPath()));
        }
        return jsonArray;
    }

    private static Object convertToJson(FileStructure fileStructure) {
        if (fileStructure.getChildren().isEmpty()) {
            return new FileJson(fileStructure.getId(), fileStructure.getLabel(), fileStructure.getFileType());
        } else {
            List<Object> childrenJson = new ArrayList<>();
            for (FileStructure child : fileStructure.getChildren()) {
                childrenJson.add(convertToJson(child));
            }
            return new FolderJson(fileStructure.getId(), fileStructure.getLabel(), childrenJson, null, fileStructure.getFullPath());
        }
    }
    private static String normalizeToAscii(String input) {
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        normalized = normalized.replaceAll("[^\\p{ASCII}]", "");
        return normalized;
    }

}


