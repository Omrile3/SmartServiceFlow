import java.util.Date;

public class ServiceRequest {
    private String id;
    private String tableId;
    private String type;
    private String description;
    private Date timestamp;
    private String status;

    public ServiceRequest(String id, String tableId, String type, String description, Date timestamp) {
        this.id = id;
        this.tableId = tableId;
        this.type = type;
        this.description = description;
        this.timestamp = timestamp;
        this.status = "pending";
    }

    // Getters and setters
    public String getId() { return id; }
    public String getTableId() { return tableId; }
    public String getType() { return type; }
    public String getDescription() { return description; }
    public Date getTimestamp() { return timestamp; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}