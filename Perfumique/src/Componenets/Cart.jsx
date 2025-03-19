import { useState, useEffect } from "react";
import { auth,db } from "../firebase";
import { collection, getDocs, doc, deleteDoc, query,where,updateDoc, getDoc } from "firebase/firestore";
import { Button } from "@material-tailwind/react";
import { FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import cart from './../assets/website/cart-bg.png';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        navigate("/login"); // 🚀 Redirect guests to login
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchCartItems = async () => {
      if (!user) return;
      
      try {
        const q = query(collection(db, "cart_items"), where("userId", "==", user.uid)); // ✅ Only fetch logged-in user cart
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map((doc) => ({
          firestoreId: doc.id,
          ...doc.data(),
        }));
        setCartItems(items);
      } catch (error) {
        console.error("Error fetching cart items:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchCartItems();
  }, [user]);
  

  // ✅ Update Quantity in Firestore and UI
  const updateQuantity = async (firestoreId, newQuantity) => {
    if (!firestoreId) {
        console.error("Error: Cart item Firestore ID is undefined.");
        return;
    }
    if (newQuantity < 1) return; // Prevent negative quantity

    try {
        console.log("Updating quantity for Firestore ID:", firestoreId);

        const itemRef = doc(db, "cart_items", firestoreId);
        const itemSnap = await getDoc(itemRef);

        if (!itemSnap.exists()) {
            console.error(`Error: Document with ID ${firestoreId} does not exist in Firestore.`);
            return;
        }

        await updateDoc(itemRef, { quantity: newQuantity });

        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.firestoreId === firestoreId ? { ...item, quantity: newQuantity } : item
            )
        );

        console.log(`✅ Quantity updated to ${newQuantity} for Firestore ID: ${firestoreId}`);
    } catch (error) {
        console.error("Error updating quantity:", error);
    }
};

  


  // ✅ Remove Item from Cart
  const removeItem = async (firestoreId) => {
    try {
        console.log("Removing cart item with Firestore ID:", firestoreId);
        await deleteDoc(doc(db, "cart_items", firestoreId));
        setCartItems(cartItems.filter((item) => item.firestoreId !== firestoreId));
    } catch (error) {
        console.error("Error removing item:", error);
    }
};


  // ✅ Calculate Total Price
  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#FFD700]">
        Loading cart...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-[#FFD700] p-8"  
    style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 1) 20%, rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 100%), url(${cart})`,
          backgroundSize: "contain"
      }}>
      <h1 className="text-4xl font-bold text-center border-b border-[#FFD700] pb-4 mt-8">
        Your Shopping Cart
      </h1>

      {cartItems.length > 0 ? (
        <div className="max-w-4xl mx-auto mt-8">
         {cartItems.map((item) => (
    <div key={item.firestoreId} className="flex items-center border border-[#FFD700] p-4 mb-4 bg-black/60 backdrop-blur-md rounded-lg shadow-lg">
        {/* Image */}
        <img
            src={item.imageUrl || "https://via.placeholder.com/100"}
            alt={item.name}
            className="w-24 h-24 object-cover rounded-md border border-[#FFD700]"
        />

        {/* Details */}
        <div className="ml-4 flex-1">
            <h2 className="text-xl font-bold">{item.name}</h2>
            <p className="text-gray-300">${item.price}</p>

            {/* Quantity Controls */}
            <div className="flex items-center gap-3 mt-2">
                <button className="bg-gray-600 px-3 py-1 rounded-md"
                    onClick={() => updateQuantity(item.firestoreId, (item.quantity || 1) - 1)}>
                    -
                </button>
                <span className="text-lg">{item.quantity}</span>
                <button className="bg-gray-600 px-3 py-1 rounded-md"
                    onClick={() => updateQuantity(item.firestoreId, (item.quantity || 1) + 1)}>
                    +
                </button>
            </div>
        </div>

        {/* Remove Button */}
        <button className="text-red-500 hover:text-red-700 ml-4" onClick={() => removeItem(item.firestoreId)}>
            <FaTrash size={20} />
        </button>
    </div>
))}


          {/* ✅ Total & Checkout */}
          <div className="mt-6 text-right">
            <h2 className="text-2xl font-semibold">Total: ${totalPrice}</h2>
            <Button
              variant="gradient"
              className="mt-4 bg-[#FFD700] text-black px-6 py-3 rounded-md font-semibold shadow-lg hover:scale-105 transition-transform"
              onClick={() => navigate("/checkout")}
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-center text-gray-400 mt-10">Your cart is empty.</p>
      )}
    </div>
  );
};

export default Cart;
