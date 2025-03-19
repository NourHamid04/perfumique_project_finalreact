import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { collection, getDocs, addDoc, doc, deleteDoc, query, where, getDoc, onSnapshot } from "firebase/firestore";
import { Button } from "@material-tailwind/react";
import checkout from './../assets/website/checkout-bg.png';
const Checkout = () => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("credit_card"); // Default payment method
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  // ✅ Check if the user is authenticated & fetch their role
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        navigate("/login"); // 🚀 Redirect guests to login
      } else {
        setUser(currentUser);
        await fetchUserRole(currentUser.uid);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // ✅ Fetch User Role from Firestore
  const fetchUserRole = async (userId) => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setRole(userSnap.data().role);
      } else {
        setRole(null);
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
  };

  // ✅ Fetch Cart Items for Logged-in User
  useEffect(() => {
    if (!user) return;

    const cartRef = query(collection(db, "cart_items"), where("userId", "==", user.uid));

    // ✅ Real-time updates when items change
    const unsubscribe = onSnapshot(cartRef, (snapshot) => {
      const items = snapshot.docs.map((doc) => ({
        firestoreId: doc.id,
        ...doc.data(),
      }));
      setCartItems(items);
      setTotalPrice(items.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2));
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup listener
  }, [user]);

  // ✅ Handle Order Submission
  const handleOrder = async () => {
    if (!user || role !== "customer") {
      alert("Only customers can place orders!");
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    try {
      // ✅ Add order to Firestore (Orders collection)
      const orderRef = await addDoc(collection(db, "orders"), {
        user_id: user.uid,
        order_date: new Date(),
        total_price: totalPrice,
        status: "pending",
      });

      const orderId = orderRef.id; // Get the generated order ID

      // ✅ Add each cart item to the Order Items collection
      for (const item of cartItems) {
        await addDoc(collection(db, "order_items"), {
          order_id: orderId,
          product_id: item.productId,
          quantity: item.quantity,
          price: item.price,
        });
      }

      // ✅ Add payment details
      await addDoc(collection(db, "payments"), {
        order_id: orderId,
        payment_date: new Date(),
        amount: totalPrice,
        payment_method: paymentMethod,
        payment_status: "pending",
      });

      // ✅ Clear the user's cart after order is placed
      for (const item of cartItems) {
        await deleteDoc(doc(db, "cart_items", item.firestoreId));
      }

      alert("Order placed successfully!");
      navigate("/shop"); // 🚀 Redirect to Shop after order
    } catch (error) {
      console.error("Error placing order:", error);
      alert("Failed to place order.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#FFD700]">
        Loading checkout...
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-black text-[#FFD700] flex flex-col items-center p-8"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 1) 20%, rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 100%), url(${checkout})`,
        backgroundSize: "contain",
      }}
    >
        
      {/* Sticky Header */}
      <h1 className="text-4xl mt-20 font-bold text-center border-b border-[#FFD700] pb-4 uppercase tracking-wide w-full">
        Checkout
      </h1>
  
      {/* Scrollable Order Summary & Form */}
      <div className="max-w-4xl w-full bg-black/70 backdrop-blur-md p-6 rounded-lg border border-[#FFD700] shadow-lg mt-6 max-h-[75vh] overflow-y-auto">
        {/* Order Summary */}
        <h2 className="text-2xl font-semibold mb-4 border-b border-[#FFD700] pb-2">Order Summary</h2>
        {cartItems.map((item) => (
          <div key={item.firestoreId} className="flex items-center border border-[#FFD700] p-4 mb-4 rounded-lg bg-black/60">
            <img
              src={item.imageUrl || "https://via.placeholder.com/100"}
              alt={item.name}
              className="w-20 h-20 object-cover rounded-md border border-[#FFD700]"
            />
            <div className="ml-4 flex-1">
              <h2 className="text-lg font-bold">{item.name}</h2>
              <p className="text-gray-300">${item.price} x {item.quantity}</p>
            </div>
          </div>
        ))}
        <h2 className="text-2xl font-semibold mt-6">Total: <span className="text-[#FFD700]">${totalPrice}</span></h2>
  
   
  
    
  
        {/* Payment Method Selection */}
        <div className="mt-6">
          <h2 className="text-2xl font-semibold mb-4 border-b border-[#FFD700] pb-2">Payment Method</h2>
          <label className="block text-lg text-[#FFD700] mb-2">Select Payment Method:</label>
          <select
            className="w-full p-3 rounded-md border border-[#FFD700] bg-black text-white focus:ring-2 focus:ring-[#FFD700]"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
          >
            <option value="credit_card">Credit Card</option>
            <option value="paypal">PayPal</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
        </div>
      </div>
  
      {/* Sticky Footer Buttons */}
      <div className="w-full max-w-4xl flex flex-col mt-6">
        <Button
          variant="gradient"
          className="bg-[#FFD700] text-black px-6 py-3 rounded-md font-semibold shadow-lg hover:scale-105 transition-transform w-full"
          onClick={handleOrder}
        >
          Place Order
        </Button>
        <button
          className="mt-4 block text-[#FFD700] underline hover:text-yellow-400 transition w-full text-center"
          onClick={() => navigate("/cart")}
        >
          ← Back to Cart
        </button>
      </div>
    </div>
  );
  
  
};

export default Checkout;
