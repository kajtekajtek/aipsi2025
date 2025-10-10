package engineering.app.models;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class FileStructure {
    private String id;
    private String label;
    private List<FileStructure> children = new ArrayList<>();
    private String fileType;
    private String fullPath;

}
