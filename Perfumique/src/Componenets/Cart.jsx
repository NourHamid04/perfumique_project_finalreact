import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { collection, getDocs, doc, deleteDoc, query, where, updateDoc, getDoc } from "firebase/firestore";
import { Button } from "@material-tailwind/react";
import { FaTrash, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import cart from './../assets/website/cart-bg.png';
import Bill from "./Bill";
const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showBill, setShowBill] = useState(false);
  const navigate = useNavigate();

  const [userDetails, setUserDetails] = useState(null);

const fetchUserDetails = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      setUserDetails(userSnap.data());
      console.log("userrrrrrrrrrr", userDetails)

    }
  } catch (error) {
    console.error("Error fetching user details:", error);
  }
};

// Update the auth state change effect
useEffect(() => {
  const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
    if (!currentUser) {
      navigate("/login");
    } else {
      setUser(currentUser);
      await fetchUserDetails(currentUser.uid); // Fetch user details
    }
  });
  return () => unsubscribe();
}, [navigate]);

  const clearCart = async () => {
    try {
      const q = query(collection(db, "cart_items"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const batchPromises = querySnapshot.docs.map((docSnap) => deleteDoc(doc(db, "cart_items", docSnap.id)));
  
      await Promise.all(batchPromises); // Delete all items
      setCartItems([]); // Clear local state
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (!currentUser) {
        navigate("/login");
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
        const q = query(collection(db, "cart_items"), where("userId", "==", user.uid));
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

  const updateQuantity = async (firestoreId, newQuantity) => {
    if (!firestoreId) {
        console.error("Error: Cart item Firestore ID is undefined.");
        return;
    }
    if (newQuantity < 1) return;

    try {
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
    } catch (error) {
        console.error("Error updating quantity:", error);
    }
  };

  const removeItem = async (firestoreId) => {
    try {
        await deleteDoc(doc(db, "cart_items", firestoreId));
        setCartItems(cartItems.filter((item) => item.firestoreId !== firestoreId));
    } catch (error) {
        console.error("Error removing item:", error);
    }
  };

  const totalPrice = cartItems.reduce((total, item) => total + item.price * item.quantity, 0).toFixed(2);

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    setShowBill(true);
  };

  const closeBill = () => {
    setShowBill(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#FFD700]">
        Loading cart...
      </div>
    );
  }

  const Bill = ({ cartItems, totalPrice, user, onClose, clearCart }) => {
    const handleConfirmOrder = async () => {
      alert("Order placed successfully!");
      await clearCart(); // Clear the cart
      onClose(); // Close the bill popup
    };
  
    return (
      <div className="relative">
        <button 
          onClick={onClose}
          className="absolute top-2 right-2 text-[#FFD700] hover:text-yellow-300"
        >
          <FaTimes size={24} />
        </button>
  
        <h2 className="text-2xl font-bold text-[#FFD700] border-b border-[#FFD700] pb-2 mb-4">
          Bill
        </h2>
  
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Customer Information</h3>
          <p>Name: {userDetails?.name || 'Guest'}</p>
          <p>Email: {user?.email || 'Not provided'}</p>
        </div>
  
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Order Details</h3>
          <div className="border-b border-[#FFD700] pb-2 mb-2">
            <div className="grid grid-cols-3 font-semibold">
              <div>Item</div>
              <div className="text-center">Qty</div>
              <div className="text-right">Price</div>
            </div>
          </div>
          
          {cartItems.map((item) => (
            <div key={item.firestoreId} className="grid grid-cols-3 py-2 border-b border-gray-700">
              <div>{item.name}</div>
              <div className="text-center">{item.quantity}</div>
              <div className="text-right">${(item.price * item.quantity).toFixed(2)}</div>
            </div>
          ))}
        </div>
  
        <div className="text-right text-xl font-bold border-t border-[#FFD700] pt-4">
          Total: ${totalPrice}
        </div>
  
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#FFD700] text-[#FFD700] rounded-md hover:bg-[#FFD700] hover:text-black transition-colors"
          >
            Back to Cart
          </button>
          <button
            className="px-4 py-2 bg-[#FFD700] text-black rounded-md font-semibold hover:bg-yellow-300 transition-colors"
            onClick={handleConfirmOrder}
          >
            Confirm Order
          </button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-black text-[#FFD700] p-8"  
      style={{ 
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 1) 20%, rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 100%), url(${cart})`,
        backgroundSize: "contain"
      }}>
      
      {showBill && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-black border-2 border-[#FFD700] rounded-lg p-6 max-w-2xl w-full mx-4">
            <Bill 
              cartItems={cartItems} 
              totalPrice={totalPrice} 
              user={user} 
              onClose={closeBill}
              clearCart={clearCart}

            />
          </div>
        </div>
      )}

      <h1 className="text-4xl font-bold text-center border-b border-[#FFD700] pb-4 mt-8">
        Your Shopping Cart
      </h1>

      {cartItems.length > 0 ? (
        <div className="max-w-4xl mx-auto mt-8">
          {cartItems.map((item) => (
            <div key={item.firestoreId} className="flex items-center border border-[#FFD700] p-4 mb-4 bg-black/60 backdrop-blur-md rounded-lg shadow-lg">
                <img
                    src={item.imageUrl || "https://via.placeholder.com/100"}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-md border border-[#FFD700]"
                />

                <div className="ml-4 flex-1">
                    <h2 className="text-xl font-bold">{item.name}</h2>
                    <p className="text-gray-300">${item.price}</p>

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

                <button className="text-red-500 hover:text-red-700 ml-4" onClick={() => removeItem(item.firestoreId)}>
                    <FaTrash size={20} />
                </button>
            </div>
          ))}

          <div className="mt-6 text-right">
            <h2 className="text-2xl font-semibold">Total: ${totalPrice}</h2>
            <Button
              variant="gradient"
              className="mt-4 bg-[#FFD700] text-black px-6 py-3 rounded-md font-semibold shadow-lg hover:scale-105 transition-transform"
              onClick={handleCheckout}
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