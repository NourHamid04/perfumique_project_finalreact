import { useState, useEffect } from "react";
import { db } from "../firebase";
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs ,
  onSnapshot,
  orderBy,
  limit
} from "firebase/firestore";
import { ShoppingCart, Users, Package, DollarSign } from "lucide-react";
import OrderDetailPopup from "./OrderDetails";
const AdminDashboard = () => {
  const [totalPerfumes, setTotalPerfumes] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [recentActivities, setRecentActivities] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null); // To manage selected order for popup
  const [isPopupOpen, setIsPopupOpen] = useState(false); // To control popup visibility



  const handleOrderClick = async (orderId) => {
    try {
      console.log('Fetching order:', orderId);
      const orderDoc = doc(db, "orders", orderId);
      const orderSnapshot = await getDoc(orderDoc);
  
      if (!orderSnapshot.exists()) {
        console.error('Order not found');
        return;
      }
  
      const orderData = orderSnapshot.data();
      console.log('Order data:', orderData);
  
      // Default order object
      const defaultOrder = {
        id: orderId,
        customer: "Unknown Customer",
        totalPrice: orderData.total_price || 0,
        items: [], // Initialize empty array (will be populated later)
        status: orderData.status || "unknown"
      };
  
      // 1. Fetch customer name (if user_id exists)
      if (orderData.user_id) {
        console.log('Fetching user:', orderData.user_id);
        const userRef = doc(db, "users", orderData.user_id);
        const userSnapshot = await getDoc(userRef);
  
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          defaultOrder.customer = userData.name || userData.email || `User (${orderData.user_id.slice(0, 6)})`;
        }
      }
  
      // 2. Fetch order items with product names
      console.log('Fetching order items for order:', orderId);
      const orderItemsQuery = query(
        collection(db, "order_items"),
        where("order_id", "==", orderId)
      );
      
      const orderItemsSnapshot = await getDocs(orderItemsQuery);
      const itemsWithProducts = [];
  
      // Process each order item
      for (const itemDoc of orderItemsSnapshot.docs) {
        const itemData = itemDoc.data();
        console.log('Order item:', itemData);
  
        // Initialize item object with basic data
        const item = {
          id: itemDoc.id,
          productId: itemData.product_id,
          price: parseFloat(itemData.price) || 0,
          quantity: parseInt(itemData.quantity) || 1
        };
  
        // Fetch product details if product_id exists
        if (itemData.product_id) {
          console.log('Fetching product:', itemData.product_id);
          const productRef = doc(db, "products", itemData.product_id);
          const productSnapshot = await getDoc(productRef);
  
          if (productSnapshot.exists()) {
            const productData = productSnapshot.data();
            item.name = productData.name || "Unknown Product";
            // Add any other product fields you want to display
            item.image = productData.image || null;
            item.description = productData.description || null;
          } else {
            item.name = "Product Not Found";
          }
        } else {
          item.name = "No Product ID";
        }
  
        itemsWithProducts.push(item);
      }
  
      // Update order with the complete items list
      defaultOrder.items = itemsWithProducts;
      setSelectedOrder(defaultOrder);
  
    } catch (error) {
      console.error('Error fetching order details:', error);
      setSelectedOrder({
        id: orderId,
        customer: "Error loading details",
        totalPrice: 0,
        items: [],
        status: "error"
      });
    } finally {
      setIsPopupOpen(true);
    }
  };
  useEffect(() => {
    // Total Perfumes
    const unsubscribePerfumes = onSnapshot(collection(db, "products"), (snapshot) => {
      setTotalPerfumes(snapshot.size);
    });

    // Total Users
    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      setTotalUsers(snapshot.size);
    });

    // Total Orders & Sales
    const unsubscribeOrders = onSnapshot(collection(db, "orders"), (snapshot) => {
      let orderCount = 0;
      let sales = 0;

      snapshot.forEach((doc) => {
        const data = doc.data();
        orderCount += 1;
        sales += parseFloat(data.total_price);
      });

      setTotalOrders(orderCount);
      setTotalSales(sales.toFixed(2));
    });

    // Listen to ALL recent activity types
    const activities = [];

    const listenToRecentActivities = () => {
      // Orders
      const ordersQuery = query(collection(db, "orders"), orderBy("order_date", "desc"), limit(10));
      const unsubscribeOrderActivity = onSnapshot(ordersQuery, (snapshot) => {
        const newActivities = snapshot.docs.map((doc) => ({
          type: "order",
          message: `🛒 Order #${doc.id}`,
          timestamp: doc.data().order_date.toDate(),
          orderId: doc.id, // Pass order ID for future lookup
        }));
        setRecentActivities((prev) =>
          mergeAndSortActivities(prev, newActivities, "order")
        );
      });

      // Products
      const productsQuery = query(collection(db, "products"), orderBy("created_at", "desc"), limit(10));
      const unsubscribeProductActivity = onSnapshot(productsQuery, (snapshot) => {
        const newActivities = snapshot.docs.map((doc) => ({
          type: "product",
          message: `🧴 New Perfume Added: ${doc.data().name}`,
          timestamp: doc.data().created_at.toDate(),
        }));
        setRecentActivities((prev) =>
          mergeAndSortActivities(prev, newActivities, "product")
        );
      });

      // Users
      const usersQuery = query(collection(db, "users"), orderBy("created_at", "desc"), limit(10));
      const unsubscribeUserActivity = onSnapshot(usersQuery, (snapshot) => {
        const newActivities = snapshot.docs.map((doc) => ({
          type: "user",
          message: `👤 New User: ${doc.data().email}`,
          timestamp: doc.data().created_at.toDate(),
        }));
        setRecentActivities((prev) =>
          mergeAndSortActivities(prev, newActivities, "user")
        );
      });

      return () => {
        unsubscribeOrderActivity();
        unsubscribeProductActivity();
        unsubscribeUserActivity();
      };
    };

    listenToRecentActivities();

    return () => {
      unsubscribePerfumes();
      unsubscribeUsers();
      unsubscribeOrders();
    };
  }, []);

  const mergeAndSortActivities = (prev, newItems, type) => {
    const filtered = prev.filter((item) => item.type !== type);
    const merged = [...filtered, ...newItems];
    return merged.sort((a, b) => b.timestamp - a.timestamp).slice(0, 15);
  };


 

  return (
    <div className="p-6 relative min-h-screen text-[#FFD700]">
      <h2 className="text-3xl font-bold mb-6 border-b border-[#FFD700] pb-2 tracking-wide">
        Admin Dashboard
      </h2>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Perfumes" value={totalPerfumes} icon={<Package size={40} />} />
        <StatCard title="Total Customers" value={totalUsers} icon={<Users size={40} />} />
        <StatCard title="Total Orders" value={totalOrders} icon={<ShoppingCart size={40} />} />
        <StatCard title="Total Sales" value={`$${totalSales}`} icon={<DollarSign size={40} />} />
      </div>

      {/* Recent Activities */}
      <div className="mt-8">
        <h3 className="text-2xl font-semibold mb-4 border-b border-[#FFD700] pb-2">
          Recent Orders
        </h3>
        <ul className="bg-black border border-[#FFD700] rounded-lg p-4 shadow-lg space-y-3 text-sm">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity, index) => (
              <li
                key={index}
                className="flex justify-between cursor-pointer"
                onClick={() => handleOrderClick(activity.orderId)}
              >
                <span>{activity.message}</span>
                <span className="text-gray-400">
                  {activity.timestamp.toLocaleString()}
                </span>
              </li>
            ))
          ) : (
            <li className="text-center text-gray-500">No recent activities</li>
          )}
        </ul>
      </div>

      {/* Order Detail Popup */}
      {isPopupOpen && selectedOrder && (
        <OrderDetailPopup order={selectedOrder} closePopup={() => setIsPopupOpen(false)} />
      )}
    </div>
  );
};

// Small reusable stat card
const StatCard = ({ title, value, icon }) => (
  <div className="bg-black border border-[#FFD700] rounded-lg shadow-lg p-6 flex items-center space-x-4">
    <div className="text-[#FFD700]">{icon}</div>
    <div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
);

export default AdminDashboard;
