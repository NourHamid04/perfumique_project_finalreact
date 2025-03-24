import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, getDocs, query, where, addDoc, updateDoc } from "firebase/firestore";
import { Button } from "@material-tailwind/react";
import { FaStar } from "react-icons/fa";
import ItemimgDetails from './../assets/website/itemDetails-bg.png';
import checkout from './../assets/website/checkout-bg.png';
import ContactBg from "../assets/website/contact-bg.png"; // Background Image

const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  // ✅ Check if User is Logged In and Fetch Role
  useEffect(() => {
    const checkUser = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setUser(null);
        setRole(null);
        return;
      }
      setUser(currentUser);
      
      // Fetch user role from Firestore
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setRole(userSnap.data().role);
      }
    };

    checkUser();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProduct(docSnap.data());
        } else {
          navigate("/shop");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  // Handle Quantity Change
  const handleQuantityChange = (newQuantity) => {
    if (newQuantity >= 1 && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  // ✅ Add to Cart (Only for `customer` role)
  const addToCart = async () => {
    if (!user || role !== "customer") {
      alert("You must be logged in as a customer to add items to the cart.");
      navigate("/login");
      return;
    }

    setAddingToCart(true);
    try {
      const cartRef = collection(db, "cart_items");

      // ✅ Check if the item already exists in the user's cart
      const q = query(cartRef, where("userId", "==", user.uid), where("productId", "==", id));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const cartItem = querySnapshot.docs[0];
        const cartItemRef = doc(db, "cart_items", cartItem.id);
        await updateDoc(cartItemRef, {
          quantity: cartItem.data().quantity + quantity,
        });
      } else {
        await addDoc(cartRef, {
          userId: user.uid, // ✅ Store user ID
          productId: id, 
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl || "https://via.placeholder.com/100",
          quantity: quantity,
        });
      }

      alert("Added to cart!");
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add item.");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-[#FFD700]">Loading product details...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-[#FFD700] p-8 pt-32" 
      style={{ 
        backgroundImage: `url(${ItemimgDetails}`,
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}>
  
      <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center gap-12 bg-black/60 border border-[#FFD700] rounded-xl p-8 shadow-lg backdrop-blur-md">
        
        {/* Product Image */}
        <div className="flex-1">
          <img
            src={product.imageUrl || "https://via.placeholder.com/500"}
            alt={product.name}
            className="w-full h-[450px] object-cover rounded-lg border border-[#FFD700]"
          />
        </div>
  
        {/* Product Details */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-5xl font-serif font-bold uppercase tracking-wide">{product.name}</h1>
          <h2 className="text-lg mt-2 text-gray-300 italic">Brand: {product.brand || "Unknown"}</h2>
          <p className="mt-4 text-lg text-gray-300">{product.description}</p>
  
          <div className="flex justify-center md:justify-start gap-1 mt-3">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className="text-yellow-400" />
            ))}
          </div>
  
          <p className="text-3xl font-semibold mt-4 text-[#FFD700]">
            ${ (product.price * quantity).toFixed(2) }
          </p>
  
          {/* Quantity Selector */}
          <div className="flex justify-center md:justify-start items-center gap-4 mt-4">
            <button
              className="bg-gray-800 px-3 py-1 rounded-md border border-[#FFD700] hover:bg-[#FFD700] hover:text-black transition"
              onClick={() => handleQuantityChange(quantity - 1)}
            >
              -
            </button>
            <span className="text-lg">{quantity}</span>
            <button
              className="bg-gray-800 px-3 py-1 rounded-md border border-[#FFD700] hover:bg-[#FFD700] hover:text-black transition"
              onClick={() => handleQuantityChange(quantity + 1)}
            >
              +
            </button>
            <span className="text-sm text-gray-400">({product.stock} available)</span>
          </div>
  
          {/* Add to Cart or Login Prompt */}
          {user && role === "customer" ? (
            <Button
              variant="gradient"
              className="mt-6 bg-gradient-to-r from-yellow-500 to-yellow-300 text-black px-6 py-3 rounded-full font-semibold shadow-lg hover:scale-105 transition-transform w-full md:w-auto"
              onClick={addToCart}
              disabled={addingToCart}
            >
              {addingToCart ? "Adding..." : "Add to Cart"}
            </Button>
          ) : (
            <p className="mt-6 text-red-400">Login as a customer to add items to cart.</p>
          )}
  
          {/* Back to Shop */}
          <button
            className="mt-4 text-[#FFD700] underline hover:text-yellow-400 transition"
            onClick={() => navigate("/shop")}
          >
            ← Back to Shop
          </button>
        </div>
      </div>
    </div>
  );
  
};

export default ItemDetails;
