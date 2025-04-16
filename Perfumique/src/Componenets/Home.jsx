import React, { useState, useEffect } from "react";
import { db ,auth} from "../firebase"; // Firestore
import { collection, getDocs, query, where,addDoc } from "firebase/firestore";
import { IoCloseOutline } from "react-icons/io5";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import Header from "../assets/Hero/Header.jpg";
import { useNavigate } from "react-router-dom";
// Add these imports at the top
import { doc, updateDoc } from "firebase/firestore";

const Home = () => {
  
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [products, setProducts] = useState([]);
  const [orderPopup, setOrderPopup] = useState(false);
  const navigate = useNavigate();
  // Add this state variable
const [productsWithRatings, setProductsWithRatings] = useState([]);

// Update the useEffect for fetching products
useEffect(() => {
  const fetchProductsWithRatings = async () => {
    const productsSnapshot = await getDocs(collection(db, "products"));
    const productsList = productsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Fetch ratings for all products
    const productsWithRatings = await Promise.all(
      productsList.map(async (product) => {
        const reviewsSnapshot = await getDocs(
          query(collection(db, "reviews"), where("product_id", "==", product.id))
        );
        
        const ratings = reviewsSnapshot.docs.map(doc => doc.data().rating);
        const average = ratings.length > 0 
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
          : 0;

        return {
          ...product,
          averageRating: average,
          reviewCount: reviewsSnapshot.size
        };
      })
    );

    // Sort by average rating and get top 3
    const topRated = productsWithRatings
      .sort((a, b) => b.averageRating - a.averageRating)
      .slice(0, 3);

    setProductsWithRatings(topRated);
  };

  fetchProductsWithRatings();
}, []);
  const handleOrderPopup = () => setOrderPopup(true);

  const addToCart = async (perfume) => {
    const user = auth.currentUser; // Get current user

    if (!user) {
        alert("You must be logged in as a customer to add items to the cart.");
        return;
    }

    try {
        const cartRef = collection(db, "cart_items");

        // ✅ Check if item already exists in the logged-in user's cart
        const q = query(cartRef, where("userId", "==", user.uid), where("productId", "==", perfume.id));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            // ✅ Item exists, update quantity
            const cartItem = querySnapshot.docs[0];
            const cartItemRef = doc(db, "cart_items", cartItem.id);
            await updateDoc(cartItemRef, {
                quantity: cartItem.data().quantity + 1, // Increment quantity
            });
        } else {
            // ✅ Item doesn't exist, add new entry
            await addDoc(cartRef, {
                userId: user.uid, // ✅ Store user ID
                productId: perfume.id,
                name: perfume.name,
                price: perfume.price,
                imageUrl: perfume.imageUrl || "https://via.placeholder.com/100",
                quantity: 1, // Initial quantity
            });
        }
        setPopupMessage("Added to cart!");
        setShowPopup(true);
       
    } catch (error) {
        console.error("Error adding to cart:", error);
        alert("Failed to add item.");
    }
};


  useEffect(() => {
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productList.slice(0, 3)); // Display only 3 featured products
    };
    fetchProducts();
  }, []);
  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => setShowPopup(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showPopup]);
  return (
    <div className="overflow-y bg-black text-[#FFD700]">
      {/* Hero Section */}
      <div
        className="relative min-h-screen flex items-center justify-center text-center"
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, 1)), url(${Header})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10">
          <h1 className="text-5xl font-bold">Discover Luxury Fragrances</h1>
          <p className="text-lg text-gray-300 max-w-xl mx-auto mt-4">
            Indulge in scents that define elegance and sophistication.
          </p>
          <button
          className="mt-6 bg-[#FFD700] text-black py-2 px-10 text-xl rounded-full font-semibold shadow-lg hover:scale-110 transition-transform"
          onClick={() => window.location.href = "/shop"} 
        >
          Shop Now
          </button>

        </div>
      </div>

      {/* Featured Products Section */}
      <div className="pt-1 pb-2 container mx-auto px-8">


        <h2 className="text-3xl font-bold text-center mb-8">Featured Perfumes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {productsWithRatings.length > 0 ? (
    productsWithRatings.map((product) => (
      <div key={product.id} className="border border-[#FFD700] rounded-lg shadow-lg p-6 hover:scale-105 transition">
        {/* Add rating display */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex text-[#FFD700]">
            {[...Array(5)].map((_, index) => (
              <span
                key={index}
                className={`text-lg ${
                  index < Math.round(product.averageRating)
                    ? 'text-[#FFD700]'
                    : 'text-gray-400'
                }`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-sm text-[#FFD700]">
            ({product.reviewCount} reviews)
          </span>
        </div>

        <img
          src={product.imageUrl || "https://via.placeholder.com/300"}
          alt={product.name}
          className="h-[250px] w-full object-cover rounded-md border border-[#FFD700]"
          onClick={() => navigate(`/shop/${product.id}`)}
        />
        <h3 className="text-xl font-semibold text-[#FFD700] mt-4">{product.name}</h3>
        <p className="text-sm text-gray-300">{product.description}</p>
        <p className="mt-2 text-lg font-semibold">${product.price}</p>
        <button
          className="mt-4 bg-[#FFD700] text-black py-2 px-6 rounded-full font-semibold hover:scale-105 transition-transform"
          onClick={() => addToCart(product)}
        >
          Add to Cart
        </button>

              </div>
            ))
          ) : (
            <p className="text-center text-gray-400 col-span-3">Loading products...</p>
          )}
        </div>
      </div>

      {/* Call-to-Action Section */}
      <div className="py-16 bg-[#222] text-center">
        <h2 className="text-4xl font-bold">Luxury at Your Fingertips</h2>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto mt-4">
          Experience elegance with our exclusive perfume collection. Get special discounts for first-time buyers!
        </p>
        <button className="mt-6 bg-[#FFD700] text-black py-3 px-6 rounded-full font-semibold shadow-lg hover:scale-105 transition-transform" onClick={()=>{navigate("/shop")}}>
          Shop Collection
        </button>
      </div>

     

      {/* Luxury Brands Section */}
      <div className="py-16 text-center">
        <h2 className="text-3xl font-bold mb-8">Our Luxury Brands</h2>
        <div className="flex justify-center gap-8 flex-wrap">
          {["Versace", "Dior", "Chanel",].map((brand, index) => (
            <span
              key={index}
              className="text-lg font-semibold border border-[#FFD700] py-3 px-6 rounded-full hover:bg-[#FFD700] hover:text-black transition"
            >
              {brand}
            </span>
          ))}
        </div>
      </div>

      {/* Newsletter Subscription */}
      <div className="py-16 bg-[#222] text-center">
        <h2 className="text-3xl font-bold">Stay Updated</h2>
        <p className="text-lg text-gray-300 max-w-xl mx-auto mt-4">
          Subscribe to our newsletter for exclusive discounts and latest arrivals.
        </p>
        <div className="mt-6 flex justify-center">
          <input
            type="email"
            placeholder="Enter your email"
            className="p-3 border border-[#FFD700] bg-black text-white rounded-l-md w-72"
          />
          <button className="bg-[#FFD700] text-black px-6 py-3 rounded-r-md font-semibold hover:scale-105 transition-transform">
            Subscribe
          </button>
        </div>
      </div>

      {/* Order Popup */}
      {orderPopup && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 flex justify-center items-center">
          <div className="bg-black border border-[#FFD700] p-6 rounded-md relative w-80">
            <IoCloseOutline className="text-2xl text-[#FFD700] cursor-pointer absolute top-2 right-2" onClick={() => setOrderPopup(false)} />
            <h1 className="text-xl font-bold">Order Now</h1>
            <button className="mt-4 bg-[#FFD700] text-black py-2 px-6 rounded-full w-full font-semibold hover:scale-105 transition-transform">
              Order Now
            </button>
          </div>
        </div>
      )}

{showPopup && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-[6000] flex items-center justify-center">
    <div className="bg-[#222222] text-white p-6 rounded-md shadow-lg max-w-sm w-full text-center">
      <p className="mb-4 text-[#FFD700] text-lg">{popupMessage}</p>
      <div className="flex justify-center">
 
<button
  onClick={() => setShowPopup(false)}
  className="bg-[#FFD700] text-black px-4 py-2 rounded-md hover:scale-105 transition-transform"
>
  OK
</button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default Home;
