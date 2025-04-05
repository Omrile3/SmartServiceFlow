import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { QrCode, AlertCircle, Users, TableProperties, LucideUtensils, Clipboard } from "lucide-react";
import MenuDisplay from "../components/customer/MenuDisplay";
import ServiceRequestDisplay from "../components/customer/ServiceRequestDisplay";
import CameraScanner from "../components/customer/CameraScanner";
import { Button } from "@/components/ui/button";

export default function Customer() { //שומר את כל המידע של הלקוח, כולל תפריט, בקשות שירות והזמנות.
  const [menuItems, setMenuItems] = useState([ //שומר את כל המידע של המנות בתפריט
    {
      id: "item1",
      name: "Classic Burger",
      description: "Beef patty with lettuce, tomato, and special sauce",
      price: 12.99,
      category: "mains",
      available: true,
      image_url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "item2",
      name: "Caesar Salad",
      description: "Fresh romaine lettuce, croutons, parmesan cheese with Caesar dressing",
      price: 8.99,
      category: "starters",
      available: true,
      image_url: "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "item3",
      name: "Chocolate Cake",
      description: "Rich chocolate cake with ganache frosting",
      price: 6.99,
      category: "desserts",
      available: true,
      image_url: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "item4",
      name: "Iced Tea",
      description: "Fresh brewed tea with lemon",
      price: 3.99,
      category: "drinks",
      available: true,
      image_url: "https://images.unsplash.com/photo-1499638673689-79a0b5115d87?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    }
  ]);
  const [serviceRequests, setServiceRequests] = useState([]);//שומר רשימה של בקשות שירות מהסועד
  const [tableId, setTableId] = useState(null); // מגיע מפרמטר ב־URL או מסריקת QR. מזהה את מספר השולחן. 
  const [tableInfo, setTableInfo] = useState(null); //מידע נוסף על השולחן (כמו מספר מקומות ישיבה)
  const [showScanner, setShowScanner] = useState(false); //האם להציג את מסך סריקת QR או לא.
    //אם אין tableId בפרמטרים של URL – מפעיל את הסורק.
    //אם אתה לא מתכוון להשתמש ב־QR בפועל (למשל בדמו), אפשר להשאיר את זה תמיד false.
  const [orders, setOrders] = useState([]);//שומר את רשימת ההזמנות של הלקוח. מאפשר הצגה בטאב הזמנות.
  const [activeTab, setActiveTab] = useState("menu"); //שומר מהו ה־tab הפעיל: "menu", "service", או "orders"
  //בשינוי טאב מתעדכנת התצוגה.
  const [isLoading, setIsLoading] = useState(false); //אנימציית טעינה- אופציונלי. 

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const table = params.get('table');
    if (table) { //אם יש tableId בפרמטרים של URL
      setTableId(table);
      setTableInfo({
        id: table,
        seats: 4  // מוגדר כ־4 מקומות ישיבה לדמו
      });
    } else {
      setShowScanner(true); //אם אין tableId בפרמטרים של URL – מפעיל את הסורק.
    }
  }, []); //המערך הריק אומר תריץ את הקוד רק פעם אחת – כשנכנסים לעמוד 

  // פונקציה שמטפלת ביצירת בקשת שירות חדשה מצד הסועד
const handleServiceRequest = async (type, details) => {
  
  // יוצרת אובייקט חדש של בקשה (מדמה בקשה לשרת)
  const newRequest = {
    id: `req-${Date.now()}`,              // מזהה ייחודי (מבוסס זמן)
    table_id: tableId,                    // מזהה השולחן ששלח את הבקשה
    type,                                 // סוג הבקשה (למשל: "Water", "Bill", "Help")
    details,                              // תיאור מפורט יותר אם יש (למשל: "No fork")
    status: "pending",                    // סטטוס התחלתי של הבקשה (ממתינה)
    created_date: new Date().toISOString() // תאריך יצירה בפורמט ISO
  };

  // מוסיף את הבקשה החדשה לרשימת הבקשות הקיימות (סטייט של serviceRequests)
  setServiceRequests(prev => [...prev, newRequest]);

  // מחזיר true כדי לציין שהבקשה נשלחה בהצלחה (גם אם אין backend)
  return true;
};


  // פונקציה שמדמה שליחת הזמנה מהלקוח
const handleOrder = async (items) => {
  try {
    // מחשב את הסכום הכולל של ההזמנה לפי כמות ומחיר
    const total = items.reduce((sum, item) => {
      const menuItem = menuItems.find(mi => mi.id === item.menu_item_id); // מוצא את הפריט בתפריט לפי ID
      return sum + (menuItem?.price || 0) * item.quantity; // מכפיל מחיר בכמות ומוסיף לסכום
    }, 0);

    // יוצר אובייקט חדש של הזמנה (כמו שהיינו מקבלים מהשרת)
    const newOrder = {
      id: `order-${Date.now()}`,          // מזהה ייחודי להזמנה (מבוסס על הזמן)
      table_id: tableId,                  // מזהה השולחן שמבצע את ההזמנה
      items,                              // הפריטים שהוזמנו (רשימה עם כמות)
      status: "pending",                  // סטטוס התחלתי: ממתין
      payment_status: "unpaid",           // תשלום טרם בוצע
      total_amount: total,                // הסכום הכולל של ההזמנה
      created_date: new Date().toISOString() // תאריך יצירה בפורמט ISO
    };

    // מוסיף את ההזמנה החדשה למערך ההזמנות (state)
    setOrders(prev => [...prev, newOrder]);

    return true; // מציין שההזמנה בוצעה בהצלחה
  } catch (error) {
    // אם יש שגיאה (נדיר במצב הזה) – מדפיס ללוג ומחזיר false
    console.error("Error placing order:", error);
    return false;
  }
};


  // פונקציה שמופעלת כשהלקוח סורק QR קוד
// 'data' זה הטקסט שקיבלנו מהסריקה (למשל URL עם פרמטרים)
const handleQrCodeScanned = (data) => {
  try {
    // מנסה לפרש את הטקסט כ־URL כדי לחלץ ממנו פרמטרים
    const url = new URL(data);

    // מוציא את הפרמטרים מתוך ה־URL (למשל ?table=5)
    const params = new URLSearchParams(url.search);

    // מנסה לשלוף את מזהה השולחן מתוך ה־QR (table)
    const scannedTableId = params.get('table');

    if (scannedTableId) {
      // אם נמצא מזהה שולחן, שומר אותו
      setTableId(scannedTableId);

      // סוגר את הסורק כי כבר קיבלנו נתון
      setShowScanner(false);

      // שומר גם מידע מדומה על השולחן (כמות מקומות)
      setTableInfo({
        id: scannedTableId,
        seats: 4
      });
    }
  } catch (error) {
    // אם הנתון שנסרק לא תקף (לא URL) – מדפיס שגיאה
    console.error("Invalid QR code:", error);

    // שומר שולחן ברירת מחדל כדי לא להיתקע
    setTableId("table-1");
    setShowScanner(false);
    setTableInfo({
      id: "table-1",
      seats: 4
    });
  }
};


  // אם יש צורך להפעיל את סורק ה-QR (אין עדיין tableId)
if (showScanner) {
  return (
    <div className="container mx-auto px-4 py-12 pt-20">
      <div className="max-w-md mx-auto">
        {/* כותרת + הסבר */}
        <div className="text-center mb-8">
          <QrCode className="w-12 h-12 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold">Scan Table QR Code</h1>
          <p className="text-gray-600 mt-2">
            Please scan the QR code on your table to view the menu and place orders
          </p>
        </div>

        {/* סורק מצלמה */}
        <CameraScanner onScanSuccess={handleQrCodeScanned} />
        
        {/* כפתור דמו – אם לא רוצים לסרוק */}
        <div className="mt-8 text-center">
          <p className="text-gray-600 mb-4">For demo purposes:</p>
          <Button 
            variant="outline"
            onClick={() => {
              setTableId("table-demo");
              setShowScanner(false);
              setTableInfo({
                id: "table-demo",
                seats: 4
              });
            }}
          >
            Skip QR Scan (Demo Mode)
          </Button>
        </div>
      </div>
    </div>
  );
}

  if (isLoading) { // אם יש אנימציית טעינה – מציג אותה
    return (
      <div className="container mx-auto px-4 py-12 pt-20 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!tableId) { // אם אין מזהה שולחן בכלל – מציג שגיאה

    return (
      <div className="container mx-auto px-4 py-12 pt-20">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Invalid table. Please scan a valid QR code to access the menu.
          </AlertDescription>
        </Alert>
      </div>
    );
  }


//עד כאן היו תנאים מוקדמים.רק אם הכול תקין – נציג את התוכן עצמו
// התוכן הראשי של עמוד הלקוח

  return (
    <div className="container mx-auto px-4 py-6 pt-20">
      
      {/* כותרת ראשית */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">Restaurant Menu</h1>
      </div>
      
      {/* כרטיס מידע על השולחן */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <TableProperties className="w-5 h-5 text-blue-500" />
            Table Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            {/* מזהה שולחן */}
            <div>
              <p className="text-sm text-gray-500">Table ID</p>
              <p className="font-medium">{tableId}</p>
            </div>

            {/* מספר מקומות ישיבה */}
            {tableInfo && (
              <div>
                <p className="text-sm text-gray-500">Seats</p>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-gray-600" />
                  <p className="font-medium">{tableInfo.seats}</p>
                </div>
              </div>
            )}
            
            {/* מספר בקשות פעילות */}
            <div>
              <p className="text-sm text-gray-500">Active Requests</p>
              <p className="font-medium">{serviceRequests.length}</p>
            </div>
            
             {/* מספר הזמנות שבוצעו */}
            <div>
              <p className="text-sm text-gray-500">Orders Placed</p>
              <p className="font-medium">{orders.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* כרטיס טאב תפריט, בקשות שירות והזמנות */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3">

          {/* טאב תפריט */}
          <TabsTrigger value="menu" className="text-base flex items-center gap-2">
            <LucideUtensils className="w-4 h-4" />
            Menu
          </TabsTrigger>

          {/* טאב בקשות שירות */}
          <TabsTrigger value="service" className="text-base flex items-center gap-2">
            <Clipboard className="w-4 h-4" />
            Service
            {serviceRequests.length > 0 && (
              <span className="ml-1 bg-blue-100 text-blue-800 rounded-full px-2 py-0.5 text-xs">
                {serviceRequests.length}
              </span>
            )}
          </TabsTrigger>

          {/* טאב הזמנות */}
          <TabsTrigger value="orders" className="text-base flex items-center gap-2">
            <Clipboard className="w-4 h-4" />
            Orders
            {orders.length > 0 && (
              <span className="ml-1 bg-green-100 text-green-800 rounded-full px-2 py-0.5 text-xs">
                {orders.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        {/* תוכן של כל טאב */}
        {/* טאב תפריט */}
        <TabsContent value="menu">
          <MenuDisplay items={menuItems} onOrder={handleOrder} />
        </TabsContent>

        {/* טאב בקשות שירות */}
        <TabsContent value="service">
          <ServiceRequestDisplay 
            requests={serviceRequests} 
            onNewRequest={handleServiceRequest}
          />
        </TabsContent>

        {/* טאב הזמנות */}
        <TabsContent value="orders">
          <div className="py-4">
            <h2 className="text-xl font-bold mb-4">Your Orders</h2>
            
            {orders.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg border">
                <p className="text-gray-500">No orders placed yet</p>
              </div>
            ) : (

              // אם יש הזמנות, מציג אותן בכרטיסים
              <div className="space-y-4">
                {/* עובר על כל ההזמנות שבוצעו ע"י הלקוח */}
                {orders.map(order => (
                  
                  <Card key={order.id} className={`overflow-hidden border-l-4 ${
                    order.status === 'paid' 
                      ? 'border-l-green-500' // אם ההזמנה שולמה – פס ירוק בצד
                      : order.status === 'confirmed' || order.status === 'preparing'
                        ? 'border-l-blue-500' // אם היא מוכנה או בהכנה – פס כחול
                        : 'border-l-orange-500' // אחרת (pending) – פס כתום
                  }`}>

                    {/* כותרת הכרטיס עם מזהה ההזמנה וסטטוס */}
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        {/* שם ההזמנה (מופיע רק 4 הספרות האחרונות של ה-ID) */}
                        <CardTitle className="text-lg">
                          Order #{order.id.slice(-4)}
                        </CardTitle>
                        {/* סטטוס ההזמנה בצבע רקע תואם (ממתינה, בתהליך, הושלמה) */}
                        <div className={`px-2 py-1 rounded-full text-xs uppercase font-semibold ${
                          order.status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : order.status === 'confirmed' || order.status === 'preparing'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-orange-100 text-orange-800'
                        }`}>
                          {order.status}
                        </div>
                      </div>
                    </CardHeader>

                    {/*תוכן ההזמנה – פירוט פריטים: */}
                    <CardContent>
                      <div className="space-y-2 mb-4">
                        {/* עבור כל פריט שהוזמן בתוך ההזמנה הזו */}
                        {order.items?.map((item, idx) => {
                          const menuItem = menuItems.find(m => m.id === item.menu_item_id); // מוצא את הפריט לפי ID
                          return menuItem ? (
                            <div key={idx} className="flex justify-between">
                              <div>
                                <span className="font-medium">{menuItem.name}</span> {/* שם המנה */}
                                <div className="text-sm text-gray-600">
                                  {item.quantity} × ${menuItem.price?.toFixed(2)} {/* כמות × מחיר */}
                                </div>
                              </div>
                              <div className="font-medium">
                                ${(menuItem.price * item.quantity).toFixed(2)} {/* סכום כולל של המנה */}
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>
                      
                      {/* סיכום ההזמנה – סכום כולל */}
                      <div className="flex justify-between pt-2 border-t">
                        <span className="font-bold">Total</span>
                        <span className="font-bold">${order.total_amount?.toFixed(2)}</span>
                      </div>
                      
                      {/* תאריך ההזמנה */}
                      <div className="mt-4 text-sm text-gray-500">
                        Ordered at {new Date(order.created_date).toLocaleTimeString()}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}