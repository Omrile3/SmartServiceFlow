import java.util.Date;
import java.util.List;

public class Order {
    private String id;
    private String tableId;
    private List<String> itemIds;
    private String status;
    private Date timestamp;

    public Order(String id, String tableId, List<String> itemIds, String status, Date timestamp) {
        this.id = id;
        this.tableId = tableId;
        this.itemIds = itemIds;
        this.status = status;
        this.timestamp = timestamp;
    }

    // Getters and setters
    public String getId() { return id; }
    public String getTableId() { return tableId; }
    public List<String> getItemIds() { return itemIds; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Date getTimestamp() { return timestamp; }
}