//לאחסון ערכים משתנים (כמו רשימת פריטים בתפריט).
//ביצוע פעולות כשמרכיב נטען (למשל: שליפת נתונים מהשרת).
import React, { useState, useEffect } from "react"; 

import { MenuItem } from "@/api/entities"; // ייבוא רכיבים מהפרויקט שלך

//מודול שמכיל פעולות API לתפריט
//רכיבי UI שנבנו במיוחד לעיצוב מסודר, מודרני ומודולרי (כנראה מבוססים על Tailwind).

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"; // רכיבי כרטיסים
import { Button } from "@/components/ui/button"; // רכיב כפתור מעוצב
import { Input } from "@/components/ui/input"; // רכיב קלט
import { Textarea } from "@/components/ui/textarea";// רכיב טקסט
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";//חלונית קופצת לעריכה או הוספה
import { Plus, Pencil, Trash2, Image } from "lucide-react";// אייקונים
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; //כפתורי הקטגוריות
import { UploadFile } from "@/api/integrations"; // פונקציה להעלאת קבצים לשרת
import { Badge } from "@/components/ui/badge"; //תגית קטנה למצב זמין/לא זמין.

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]); //כל הפריטים בתפריט שנשלפים מהשרת.
  const [showAddEdit, setShowAddEdit] = useState(false); //האם לפתוח את חלונית ההוספה/עריכה.
  const [editItem, setEditItem] = useState(null); //האובייקט הנוכחי שנערך/נוסף.
  const [activeCategory, setActiveCategory] = useState("all");//הקטגוריה שבחרנו (למשל mains, drinks).
  const [loading, setLoading] = useState(false); //האם לטעון את הנתונים מהשרת.
  const [imageLoading, setImageLoading] = useState(false);//האם לטעון את התמונה מהשרת.

  useEffect(() => { //הפעלת פונקציה לטעינת פריטים מהשרת כשמרכיב נטען.
    loadMenuItems(); //הפעלת הפונקציה לטעינת פריטים מהשרת רק בפעם הראשונה שהרכיב נטען.
  }, []);


  //פונקציות עזר:
  const loadMenuItems = async () => { //טעינת פריטים מהשרת.שליפת התפריט מהשרת
    setLoading(true);
    const items = await MenuItem.list();
    setMenuItems(items);
    setLoading(false);
  };

  const handleAddItem = () => { //הוספת פריט חדש
    setEditItem({
      name: "",
      description: "",
      price: 0,
      category: "mains",
      available: true
    });
    setShowAddEdit(true);
  };

  const handleEditItem = (item) => {//עריכת פריט קיים
    setEditItem(item);
    setShowAddEdit(true);
  };

  const handleSaveItem = async () => { //שמירה של פריט חדש או עריכה של פריט קיים
    try {
      if (editItem.id) {
        await MenuItem.update(editItem.id, editItem);
      } else {
        await MenuItem.create(editItem);
      }
      setShowAddEdit(false);
      loadMenuItems();
    } catch (error) {
      console.error("Error saving menu item:", error);
    }
  };

  const handleDeleteItem = async (id) => { //מחיקת פריט מהתפריט
    if (confirm("Are you sure you want to delete this item?")) {
      await MenuItem.delete(id);
      loadMenuItems();
    }
  };

  const handleImageUpload = async (e) => { //העלאת תמונה לשרת
    const file = e.target.files[0];
    if (file) {
      setImageLoading(true);
      try {
        const { file_url } = await UploadFile({ file });
        setEditItem(prev => ({ ...prev, image_url: file_url }));
      } catch (error) {
        console.error("Error uploading image:", error);
      }
      setImageLoading(false);
    }
  };

  const filteredItems = activeCategory === "all" //סינון לפי קטגוריה
    ? menuItems 
    : menuItems.filter(item => item.category === activeCategory);

  const categories = ["all", "starters", "mains", "desserts", "drinks"];

  //--------------------------------------------------------------------------------------
  // עד כה בנינו את הלוגיקה והתפעול ומכאן העיצוב והתצוגה: בניית המסך המוצג למשתמש 
  //עטיפה כללית + כותרת וכפתור
  return (
    <div className="p-6"> {/* Padding חיצוני לכל הדף */}
      <div className="max-w-7xl mx-auto"> {/* מגביל את הרוחב ומרכז את התוכן באמצע המסך */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4"> {/* שורת כותרת וכפתור "הוסף פריט" */}
          {/* flex-col במסכים קטנים → אחד מתחת לשני
            sm:flex-row במסכים גדולים → באותה שורה */}
          <h1 className="text-3xl font-bold">Menu Management</h1>
          <Button onClick={handleAddItem}>  {/* כפתור להוספת פריט חדש – פותח את הטופס */}
            <Plus className="w-4 h-4 mr-2" />
            Add Menu Item
          </Button>
        </div>

        {/* טאב בחירת קטגוריה: All, Starters, Mains וכו' */}
        <Tabs 
          defaultValue="all" 
          value={activeCategory}
          onValueChange={setActiveCategory}
          className="mb-6"
        >
          <TabsList>
            {categories.map(category => (
              <TabsTrigger key={category} value={category} className="capitalize">
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* אם הנתונים עדיין נטענים – מציגים skeleton של טעינה */}
        {/*Skeleton Loading הוא אפקט שבו מוצגים "שלדים" אפורים במקום תכנים אמיתיים */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => ( //מייצר 6 כרטיסי טעינה אפורים ריקים
              <Card key={i} className="animate-pulse"> {/* עושה "הבהוב" עדין שמראה כאילו הן נושמות – זה האפקט של הטעינה.*/}
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded-md w-2/3"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-gray-200 rounded-md mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded-md w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded-md w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
           // הצגת הפריטים בתפריט לפי הקטגוריה המסוננת
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <Card key={item.id} className="overflow-hidden">

                {/* תצוגת תמונה + תגית זמינות בפינה */}
                {item.image_url && (
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={item.image_url} 
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <Badge 
                      className={`absolute top-2 right-2 ${
                        item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.available ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                )}

                {/* כותרת: שם + מחיר */}
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>{item.name}</span>
                    <span className="text-green-600">${item.price.toFixed(2)}</span>
                  </CardTitle>
                </CardHeader>

                {/* תוכן: תיאור + קטגוריה */}
                <CardContent>
                  <p className="text-gray-600">{item.description}</p>
                  <Badge className="mt-2 capitalize">{item.category}</Badge>
                </CardContent>

                {/* כפתורי עריכה ומחיקה */}
                <CardFooter className="flex justify-end gap-2 bg-gray-50 border-t p-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1"
                    onClick={() => handleEditItem(item)}
                  >
                    <Pencil className="w-3 h-3" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1 text-red-600 hover:text-red-700"
                    onClick={() => handleDeleteItem(item.id)}
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}

            {/* אם אין פריטים בקטגוריה הנוכחית – מציגים הודעה מתאימה */}
            {filteredItems.length === 0 && (
              <div className="col-span-full text-center py-12 bg-white rounded-lg border">
                <p className="text-gray-500">No menu items in this category</p>
                <Button onClick={handleAddItem} className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* חלונית קופצת להוספה/עריכה של פריט */}
      <Dialog open={showAddEdit} onOpenChange={setShowAddEdit}> {/*אם נכון- מוצגת חלונית. ה change מאפשר לפתוח ולסוגר , למשל אם לוחצים מחוץ לחלון.  */}
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editItem?.id ? 'Edit Menu Item' : 'Add Menu Item'} {/*אם editItem קיים ויש לו id → מצב עריכה. */} {/*אם לא – מצב הוספה. */}
            </DialogTitle>
          </DialogHeader>

          {/* תוכן חלונית ההוספה/עריכה */}
          <div className="space-y-4 py-4"> 
            {editItem?.image_url && ( //אם יש תמונה קיימת – מציגים אותה
              <div className="mb-4">
                <img 
                  src={editItem.image_url} 
                  alt={editItem.name}
                  className="w-full h-48 object-cover rounded-md"
                />
              </div>
            )}

            {/* שדות טופס: שם, תיאור, מחיר, קטגוריה, זמינות */}
            <div>
              <label className="block text-sm font-medium mb-1">Name</label> {/* תווית לשדה (label) – מופיעה מעל שדה הקלט */}
              <Input {/* שדה הקלט עבור שם הפריט */}
                value={editItem?.name || ''}  // מציג את שם הפריט אם קיים, אחרת מחרוזת ריקה (למצב "הוספה")

                onChange={e => setEditItem(prev => ({ ...prev, name: e.target.value }))}  // מעדכן את שדה name בתוך האובייקט editItem בכל הקלדה
                placeholder="Item name"  // טקסט שמופיע כשאין תוכן בשדה
              />
            </div>

            
            <div>
              <label className="block text-sm font-medium mb-1">Description</label> {/* תווית לשדה התיאור */}
              <Textarea  {/* שדה טקסט מרובה שורות */}
                value={editItem?.description || ''} // מציג את תיאור הפריט או ריק
                onChange={e => setEditItem(prev => ({ ...prev, description: e.target.value }))}  // מעדכן את שדה description באובייקט
                placeholder="Item description"  // טקסט דיפולטי ריק
              />
            </div>

            {/* שדות נוספים: מחיר וקטגוריה */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Price ($)</label>  {/* שדה מחיר */}
                <Input
                  type="number" // רק מספרים
                  step="0.01" // מאפשר עיגול לשתי ספרות אחרי הנקודה
                  value={editItem?.price || ''}
                  onChange={e => setEditItem(prev => ({ ...prev, price: parseFloat(e.target.value) }))} // המרה ממחרוזת למספר עשרוני
                  placeholder="0.00"
                />
              </div>

              {/* בחירת קטגוריה */}
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select 
                  className="w-full rounded-md border border-gray-300 p-2"
                  value={editItem?.category || ''}
                  onChange={e => setEditItem(prev => ({ ...prev, category: e.target.value }))}  // מעדכן את הקטגוריה לפי הבחירה
                >
                  <option value="starters">Starters</option>
                  <option value="mains">Mains</option>
                  <option value="desserts">Desserts</option>
                  <option value="drinks">Drinks</option>
                </select>
              </div>
            </div>

            {/* תיבת סימון זמינות */}
            <div className="flex items-center gap-2">
              <input {/* תיבת סימון האם הפריט זמין */}
                type="checkbox"
                id="available"
                checked={editItem?.available} // true/false
                onChange={e => setEditItem(prev => ({ ...prev, available: e.target.checked }))} // ערך הבדיקה מתוך checkbox
              />
              <label htmlFor="available">Item is available</label>
            </div>

              
            {/* העלאת תמונה */}
            <div>
              <label className="block text-sm font-medium mb-1">Image</label>
              <div className="flex items-center gap-2">
                <Input   {/* שדה קובץ – מקבל רק תמונות */}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload} // פונקציה שמטפלת בהעלאה לשרת
                  disabled={imageLoading}  // אם קובץ עולה – מבטל זמנית את השדה
                />

                {/* הודעה שמופיעה בזמן העלאה */}
                {imageLoading && <span className="text-sm">Uploading...</span>}
              </div>
            </div>
          </div>

          {/* כפתורי שמירה וביטול */}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddEdit(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveItem}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}