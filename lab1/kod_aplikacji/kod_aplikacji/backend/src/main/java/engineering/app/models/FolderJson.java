package engineering.app.models;

import lombok.Data;

import java.util.List;

@Data
public class FolderJson {
    private String id;
    private String label;
    private String fileType;
    private String fullPath;
    private List<Object> children;

    public FolderJson(String id, String label, List<Object> children, String fileType, String fullPath) {
        this.id = id;
        this.label = label;
        this.children = children;
        this.fileType = fileType;
        this.fullPath = fullPath;
    }
}
