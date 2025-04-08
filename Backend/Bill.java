import java.util.*;

public class Bill {
    private String id;
    private String tableId;
    private List<MenuItem> items;
    private double total;
    private Date timestamp;
    private String status; // PENDING, PAID, CANCELLED

    public Bill(String tableId) {
        this.id = UUID.randomUUID().toString();
        this.tableId = tableId;
        this.items = new ArrayList<>();
        this.total = 0.0;
        this.timestamp = new Date();
        this.status = "PENDING";
    }

    public void addItem(MenuItem item) {
        items.add(item);
        calculateTotal();
    }

    public void removeItem(MenuItem item) {
        items.remove(item);
        calculateTotal();
    }

    private void calculateTotal() {
        this.total = items.stream()
                         .mapToDouble(MenuItem::getPrice)
                         .sum();
    }

    // Getters
    public String getId() { return id; }
    public String getTableId() { return tableId; }
    public List<MenuItem> getItems() { return items; }
    public double getTotal() { return total; }
    public Date getTimestamp() { return timestamp; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}