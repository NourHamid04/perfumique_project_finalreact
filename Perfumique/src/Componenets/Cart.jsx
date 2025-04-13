import { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { 
  collection, getDocs, doc, deleteDoc, query, where, 
  updateDoc, getDoc, addDoc, writeBatch, serverTimestamp 
} from "firebase/firestore";
import { Button } from "@material-tailwind/react";
import { FaTrash, FaTimes, FaCheckCircle, FaPrint, FaDownload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import cart from './../assets/website/Admin_new_bg.jpg';

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showBill, setShowBill] = useState(false);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const fetchUserDetails = async (userId) => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserDetails(userSnap.data());
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      if (!currentUser) {
        navigate("/login");
      } else {
        setUser(currentUser);
        await fetchUserDetails(currentUser.uid);
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  const clearCart = async () => {
    try {
      const q = query(collection(db, "cart_items"), where("userId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      
      querySnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      setCartItems([]);
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  useEffect(() => {
    const fetchCartItems = async () => {
      if (!user) return;
      
      try {
        const q = query(collection(db, "cart_items"), where("userId", "==", user.uid));
        const querySnapshot = await getDocs(q);
        const items = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            firestoreId: doc.id,
            ...data,
            // Ensure price is always a number
            price: typeof data.price === 'string' ? parseFloat(data.price) : data.price
          };
        });
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
    if (!firestoreId || newQuantity < 1) return;

    try {
      const itemRef = doc(db, "cart_items", firestoreId);
      await updateDoc(itemRef, { quantity: newQuantity });
      setCartItems(prevItems =>
        prevItems.map(item => 
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
      setCartItems(prevItems => prevItems.filter(item => item.firestoreId !== firestoreId));
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  // Calculate total price as number first, then format for display
  const calculateTotalPrice = () => {
    const total = cartItems.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    );
    return {
      numeric: total,
      formatted: total.toFixed(2)
    };
  };

  const { numeric: totalPriceValue, formatted: totalPriceFormatted } = calculateTotalPrice();

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    setShowBill(true);
  };

  const handleOrderConfirmation = async () => {
    setIsProcessing(true);
    try {
      // Prepare items with validated prices
      const orderItems = cartItems.map(item => ({
        ...item,
        formattedPrice: item.price.toFixed(2), // String with 2 decimals
        product_id: item.productId || item.product_id // Handle both cases
      }));

      // Create order document
      const orderRef = await addDoc(collection(db, "orders"), {
        order_date: serverTimestamp(),
        status: "pending",
        total_price: totalPriceFormatted,
        total_price_value: totalPriceValue,
        user_id: user.uid,
        items: orderItems.map(item => ({
          product_id: item.product_id,
          name: item.name,
          price: item.formattedPrice,
          quantity: item.quantity,
          imageUrl: item.imageUrl
        }))
      });

      // Create order items in batch
      const batch = writeBatch(db);
      orderItems.forEach(item => {
        const orderItemRef = doc(collection(db, "order_items"));
        batch.set(orderItemRef, {
          order_id: orderRef.id,
          price: item.formattedPrice,
          product_id: item.product_id,
          quantity: item.quantity,
          created_at: serverTimestamp()
        });
      });

      await batch.commit();
      setOrderConfirmed(true);
      
    } catch (error) {
      console.error("Order confirmation failed:", error);
      alert(`Order failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const closeBill = () => {
    setShowBill(false);
    clearCart();
    setOrderConfirmed(false);

  };

  const Bill = ({ cartItems, totalPrice, user, userDetails, onClose, isConfirmed }) => {
    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    const orderDate = new Date().toLocaleString();
    const customerName = userDetails?.name || user?.email?.split('@')[0] || 'Customer';

    // Calculate total from items to ensure consistency
    const calculatedTotal = cartItems.reduce(
      (total, item) => total + (item.price * item.quantity),
      0
    ).toFixed(2);

    // Use either the prop totalPrice or our calculated total
    const displayTotal = totalPrice || calculatedTotal;

    return (
      <div className="bg-black text-[#FFD700] border-2 border-[#FFD700] rounded-lg p-6 w-full max-w-2xl relative">
        {!isConfirmed ? (
          <>
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-[#FFD700] hover:text-yellow-300"
            >
              <FaTimes size={24} />
            </button>

            <h2 className="text-2xl font-bold text-center mb-6">Order Summary</h2>

            <div className="mb-4 p-3 border border-[#FFD700] rounded-md">
              <h3 className="font-semibold mb-1">Customer:</h3>
              <p>{customerName}</p>
              <p className="text-gray-400">{user?.email}</p>
            </div>

            <div className="mb-6 max-h-96 overflow-y-auto pr-2">
              {cartItems.map((item) => {
                const itemTotal = (item.price * item.quantity).toFixed(2);
                return (
                  <div key={item.firestoreId} className="flex justify-between items-center py-3 border-b border-gray-700">
                    <div className="flex items-center">
                      <img
                        src={item.imageUrl || "https://via.placeholder.com/60"}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-md mr-3 border border-[#FFD700]"
                      />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-400">${item.price.toFixed(2)} × {item.quantity}</p>
                      </div>
                    </div>
                    <p className="text-[#FFD700]">${itemTotal}</p>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-[#FFD700] pt-4 mb-6">
              <div className="flex justify-between text-xl font-bold">
                <span>Total:</span>
                <span>${displayTotal}</span>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-[#FFD700] rounded-md hover:bg-[#FFD700] hover:text-black transition-colors"
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                onClick={handleOrderConfirmation}
                className="px-6 py-2 bg-[#FFD700] text-black rounded-md font-semibold hover:bg-yellow-300 transition-colors"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Confirm Order'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-6">
              <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-3" />
              <h2 className="text-3xl font-bold mb-1">Order Placed Successfully!</h2>
              <p className="text-gray-400">Your order #{orderNumber} has been confirmed</p>
            </div>

            <div className="border border-[#FFD700] rounded-md p-4 mb-6">
              <div className="flex justify-between items-center mb-4 border-b border-[#FFD700] pb-2">
                <div>
                  <h3 className="text-xl font-bold">INVOICE</h3>
                  <p className="text-sm text-gray-400">#{orderNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">Date: {orderDate}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="font-semibold mb-1">BILLED TO:</h4>
                  <p>{customerName}</p>
                  <p>{user?.email || 'No email provided'}</p>
                  {userDetails?.phone && <p>Phone: {userDetails.phone}</p>}
                  {userDetails?.address && <p>Address: {userDetails.address}</p>}
                </div>
                <div className="text-right">
                  <h4 className="font-semibold mb-1">PERFUME STORE</h4>
                  <p>123 Fragrance Avenue</p>
                  <p>Beirut, Lebanon</p>
                  <p>+961 1 234 567</p>
                </div>
              </div>

              <div className="mb-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#FFD700]">
                      <th className="text-left pb-2">Item</th>
                      <th className="text-right pb-2">Price</th>
                      <th className="text-right pb-2">Qty</th>
                      <th className="text-right pb-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item) => {
                      const itemTotal = (item.price * item.quantity).toFixed(2);
                      return (
                        <tr key={item.firestoreId} className="border-b border-gray-700">
                          <td className="py-3">
                            <div className="flex items-center">
                              {item.imageUrl && (
                                <img 
                                  src={item.imageUrl} 
                                  alt={item.name}
                                  className="w-10 h-10 object-cover rounded-md mr-3 border border-[#FFD700]"
                                />
                              )}
                              <span>{item.name}</span>
                            </div>
                          </td>
                          <td className="text-right">${item.price.toFixed(2)}</td>
                          <td className="text-right">{item.quantity}</td>
                          <td className="text-right">${itemTotal}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="border-t border-[#FFD700] pt-3">
                <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-[#FFD700]">
                  <span>TOTAL:</span>
                  <span>${displayTotal}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button 
                className="flex items-center px-4 py-2 border border-[#FFD700] rounded-md hover:bg-[#FFD700] hover:text-black transition-colors"
                onClick={() => window.print()}
              >
                <FaPrint className="mr-2" /> Print Receipt
              </button>
              <button 
                className="flex items-center px-4 py-2 bg-[#FFD700] text-black rounded-md font-semibold hover:bg-yellow-300 transition-colors"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

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
        backgroundSize: "cover"
      }}>
      
      {showBill && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <Bill 
            cartItems={cartItems} 
            totalPrice={totalPriceFormatted} 
            user={user}
            userDetails={userDetails}
            onClose={closeBill}
            isConfirmed={orderConfirmed}
          />
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
                <p className="text-gray-300">${item.price.toFixed(2)}</p>

                <div className="flex items-center gap-3 mt-2">
                  <button 
                    className="bg-gray-600 px-3 py-1 rounded-md"
                    onClick={() => updateQuantity(item.firestoreId, (item.quantity || 1) - 1)}
                  >
                    -
                  </button>
                  <span className="text-lg">{item.quantity}</span>
                  <button 
                    className="bg-gray-600 px-3 py-1 rounded-md"
                    onClick={() => updateQuantity(item.firestoreId, (item.quantity || 1) + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <button 
                className="text-red-500 hover:text-red-700 ml-4" 
                onClick={() => removeItem(item.firestoreId)}
              >
                <FaTrash size={20} />
              </button>
            </div>
          ))}

          <div className="mt-6 text-right">
            <h2 className="text-2xl font-semibold">Total: ${totalPriceFormatted}</h2>
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
        <div className="text-center mt-10">
          <p className="text-gray-400 text-xl mb-4">
            {orderConfirmed ? "Your order has been placed successfully!" : "Your cart is empty."}
          </p>
          <Button
            variant="gradient"
            className="bg-[#FFD700] text-black px-6 py-3 rounded-md font-semibold shadow-lg hover:scale-105 transition-transform"
            onClick={() => navigate('/shop')}
          >
            Browse Products
          </Button>
        </div>
      )}
    </div>
  );
};

export default Cart;