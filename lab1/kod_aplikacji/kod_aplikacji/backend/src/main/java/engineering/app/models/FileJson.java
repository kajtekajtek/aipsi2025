package engineering.app.models;

import lombok.Data;

@Data
public class FileJson {
    private String id;
    private String label;
    private String fileType;

    public FileJson(String id, String label, String fileType) {
        this.id = id;
        this.label = label;
        this.fileType = fileType;
    }
}