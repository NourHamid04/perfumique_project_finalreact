import React, { useState, useEffect } from "react";
import { db ,auth} from "../firebase"; // Firestore
import { collection, getDocs, query, where,addDoc } from "firebase/firestore";
import { FaStar, FaQuoteLeft } from "react-icons/fa";
import { IoCloseOutline } from "react-icons/io5";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import Header from "../assets/Hero/Header.jpg";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [products, setProducts] = useState([]);
  const [orderPopup, setOrderPopup] = useState(false);
  const navigate = useNavigate();
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

        alert("Added to cart!");
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
          {products.length > 0 ? (
            products.map((product) => (
              <div
                key={product.id}
                className="border border-[#FFD700] rounded-lg shadow-lg p-6 hover:scale-105 transition"
                onClick={() => navigate(`/shop/${product.id}`)}
                
              >
                <img
                  src={product.imageUrl || "https://via.placeholder.com/300"}
                  alt={product.name}
                  className="h-[250px] w-full object-cover rounded-md border border-[#FFD700]"
                />
                <h3 className="text-xl font-semibold text-[#FFD700] mt-4">{product.name}</h3>
                <p className="text-sm text-gray-300">{product.description}</p>
                <div className="flex justify-center mt-2">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="text-yellow-400" />
                  ))}
                </div>
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
        <button className="mt-6 bg-[#FFD700] text-black py-3 px-6 rounded-full font-semibold shadow-lg hover:scale-105 transition-transform">
          Shop Collection
        </button>
      </div>

      {/* Testimonials Section */}
      <div className="py-16 bg-black text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-6">What Our Customers Say</h2>
          <Slider dots infinite speed={500} autoplay autoplaySpeed={3000} slidesToShow={1} slidesToScroll={1}>
            {[
              { id: 1, name: "Victor", text: "Best perfume ever!" },
              { id: 2, name: "Emily", text: "Amazing fragrance!" },
              { id: 3, name: "Daniel", text: "Fast delivery!" },
            ].map((testimonial) => (
              <div key={testimonial.id} className="p-6 bg-black/90 border border-[#FFD700] rounded-md">
                <FaQuoteLeft className="text-4xl text-[#FFD700] mx-auto mb-3" />
                <p className="text-lg text-gray-300">{testimonial.text}</p>
                <h3 className="text-xl font-semibold text-[#FFD700] mt-4">- {testimonial.name}</h3>
              </div>
            ))}
          </Slider>
        </div>
      </div>

      {/* Luxury Brands Section */}
      <div className="py-16 text-center">
        <h2 className="text-3xl font-bold mb-8">Our Luxury Brands</h2>
        <div className="flex justify-center gap-8 flex-wrap">
          {["Versace", "Dior", "Chanel", "Gucci", "Armani"].map((brand, index) => (
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
    </div>
  );
};

export default Home;
