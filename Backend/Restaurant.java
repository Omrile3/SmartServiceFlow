import java.util.*;

public class Restaurant {
    private String id;
    private String name;
    private Layout layout;
    private List<MenuItem> menu;
    private List<Staff> staff;
    private List<ServiceRequest> serviceRequests;
    private List<Order> orders;

    // Inner classes
    public static class Layout {
        private int width;
        private int height;
        private List<Table> tables;

        public Layout(int width, int height) {
            this.width = width;
            this.height = height;
            this.tables = new ArrayList<>();
        }

        // Getters and setters
        public int getWidth() { return width; }
        public void setWidth(int width) { this.width = width; }
        public int getHeight() { return height; }
        public void setHeight(int height) { this.height = height; }
        public List<Table> getTables() { return tables; }
        public void setTables(List<Table> tables) { this.tables = tables; }
    }

    public static class Table {
        private String id;
        private int number;
        private int seats;
        private int x;
        private int y;
        private String status;

        public Table(String id, int number, int seats, int x, int y) {
            this.id = id;
            this.number = number;
            this.seats = seats;
            this.x = x;
            this.y = y;
            this.status = "available";
        }

        // Getters and setters
        public String getId() { return id; }
        public int getNumber() { return number; }
        public int getSeats() { return seats; }
        public void setSeats(int seats) { this.seats = seats; }
        public int getX() { return x; }
        public void setX(int x) { this.x = x; }
        public int getY() { return y; }
        public void setY(int y) { this.y = y; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
    }

    // Constructor
    public Restaurant(String id, String name) {
        this.id = id;
        this.name = name;
        this.layout = new Layout(800, 600);
        this.menu = new ArrayList<>();
        this.staff = new ArrayList<>();
        this.serviceRequests = new ArrayList<>();
        this.orders = new ArrayList<>();
    }

    // Table Management
    public Table addTable(int seats, int x, int y) {
        String tableId = "table-" + UUID.randomUUID().toString();
        int tableNumber = layout.getTables().size() + 1;
        Table table = new Table(tableId, tableNumber, seats, x, y);
        layout.getTables().add(table);
        return table;
    }

    public void removeTable(String tableId) {
        layout.setTables(
            layout.getTables().stream()
                .filter(table -> !table.getId().equals(tableId))
                .toList()
        );
    }

    public void updateTableStatus(String tableId, String status) {
        layout.getTables().stream()
            .filter(table -> table.getId().equals(tableId))
            .findFirst()
            .ifPresent(table -> table.setStatus(status));
    }

    // Menu Management
    public MenuItem addMenuItem(String name, double price, String category) {
        MenuItem item = new MenuItem(UUID.randomUUID().toString(), name, price, category);
        menu.add(item);
        return item;
    }

    public void removeMenuItem(String itemId) {
        menu.removeIf(item -> item.getId().equals(itemId));
    }

    // Service Requests
    public ServiceRequest createServiceRequest(String tableId, String type, String description) {
        ServiceRequest request = new ServiceRequest(
            UUID.randomUUID().toString(),
            tableId,
            type,
            description,
            new Date()
        );
        serviceRequests.add(request);
        return request;
    }

    // Orders
    public Order createOrder(String tableId, List<String> itemIds) {
        Order order = new Order(
            UUID.randomUUID().toString(),
            tableId,
            itemIds,
            "new",
            new Date()
        );
        orders.add(order);
        return order;
    }

    // Staff Management
    public Staff addStaffMember(String name, String role) {
        Staff member = new Staff(UUID.randomUUID().toString(), name, role);
        staff.add(member);
        return member;
    }

    public void removeStaffMember(String staffId) {
        staff.removeIf(member -> member.getId().equals(staffId));
    }

    // Getters
    public String getId() { return id; }
    public String getName() { return name; }
    public Layout getLayout() { return layout; }
    public List<MenuItem> getMenu() { return menu; }
    public List<Staff> getStaff() { return staff; }
    public List<ServiceRequest> getServiceRequests() { return serviceRequests; }
    public List<Order> getOrders() { return orders; }
}