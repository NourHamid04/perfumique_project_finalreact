import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc, collection, getDocs, query, where, addDoc, updateDoc } from "firebase/firestore";
import { Button } from "@material-tailwind/react";

import ItemimgDetails from './../assets/website/itemDetails-bg.png';
import checkout from './../assets/website/checkout-bg.png';
import ContactBg from "../assets/website/contact-bg.png"; // Background Image

const ItemDetails = () => {
  
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);

  //for reviews
  // Add these new state variables at the top of the component
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loadingReviews, setLoadingReviews] = useState(true);

  //average rating
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    if (reviews.length > 0) {
      const total = reviews.reduce((sum, review) => sum + review.rating, 0);
      setAverageRating(total / reviews.length);
    } else {
      setAverageRating(0);
    }
  }, [reviews]);


  //  fetching reviews
useEffect(() => {

// Update the fetchReviews function
const fetchReviews = async () => {
  try {
    const reviewsRef = collection(db, "reviews");
    const q = query(reviewsRef, where("product_id", "==", id));
    const querySnapshot = await getDocs(q);
    
    const reviewsData = [];
    let userReviewData = null;
    
    // Use Promise.all to fetch user data in parallel
    const reviewsWithUsers = await Promise.all(
      querySnapshot.docs.map(async (reviewDoc) => { // Changed parameter name to reviewDoc
        const review = { id: reviewDoc.id, ...reviewDoc.data() };
        // Fetch user data
        const userDoc = await getDoc(doc(db, "users", review.user_id));
        review.userName = userDoc.exists() ? userDoc.data().name : "Anonymous";
        return review;
      })
    );

    reviewsWithUsers.forEach((review) => {
      if (user && review.user_id === user.uid) {
        userReviewData = review;
      }
      reviewsData.push(review);
    });

    setReviews(reviewsData);
    setUserReview(userReviewData);
  } catch (error) {
    console.error("Error fetching reviews:", error);
  } finally {
    setLoadingReviews(false);
  }
};

  if (id) fetchReviews();
}, [id, user]);
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
  // Add the review submission handler
const handleReviewSubmit = async (e) => {
  e.preventDefault();
  if (!user) {
    alert("Please login to submit a review");
    return;
  }

  try {
    const reviewData = {
      user_id: user.uid,
      product_id: id,
      rating,
      comment,
      created_at: new Date(),
    };

    if (userReview) {
      // Update existing review
      const reviewRef = doc(db, "reviews", userReview.id);
      await updateDoc(reviewRef, reviewData);
      

        // Update both userReview and reviews state
      const updatedReviews = reviews.map(review => 
        review.id === userReview.id ? { ...review, ...reviewData } : review
      );
      setReviews(updatedReviews);
      setUserReview({ ...userReview, ...reviewData });

    } else {
      // Add new review
      const docRef = await addDoc(collection(db, "reviews"), reviewData);
      setReviews([...reviews, { id: docRef.id, ...reviewData }]);
      setUserReview({ id: docRef.id, ...reviewData });
    }

    setRating(0);
    setComment("");
    setPopupMessage("Review submitted successfully!");
    setShowPopup(true);
  } catch (error) {
    console.error("Error submitting review:", error);
    alert("Error submitting review");
  }
};

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
  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => setShowPopup(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showPopup]);
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

      setPopupMessage("Added to cart!");
      setShowPopup(true);
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
  
          {/* Add this after the brand display */}
<div className="mt-2 flex items-center gap-2">
  <span className="text-lg">Average Rating:</span>
  <div className="flex text-[#FFD700]">
    {[...Array(5)].map((_, index) => (
      <span
        key={index}
        className={`text-xl ${
          index < Math.round(averageRating)
            ? 'text-[#FFD700]'
            : 'text-gray-400'
        }`}
      >
        ★
      </span>
    ))}
  </div>
  <span className="text-[#FFD700]">({averageRating.toFixed(1)})</span>
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

<div className="mt-12 border-t border-[#FFD700] pt-4 bg-black m-20 p-20 rounded-xl">
  <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>

  {/* Review Form */}
  {user ? (
    <form onSubmit={handleReviewSubmit} className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">Rating:</span>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            className={`text-2xl ${rating >= star ? 'text-[#FFD700]' : 'text-gray-400'}`}
          >
            ★
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write your review..."
        className="w-full bg-gray-800 border border-[#FFD700] rounded-md p-4 text-white mb-4"
        rows="4"
        required
      />
      <Button
        type="submit"
        className="bg-[#FFD700] text-black px-6 py-2 rounded-md hover:bg-yellow-600 transition"
      >
        {userReview ? "Update Review" : "Submit Review"}
      </Button>
    </form>
  ) : (
    <p className="text-gray-400 mb-8">Please login to leave a review</p>
  )}

  {/* Reviews List */}
{/* Reviews List */}
{loadingReviews ? (
  <div className="text-center text-[#FFD700]">Loading reviews...</div>
) : reviews.length === 0 ? (
  <p className="text-gray-400">No reviews yet. Be the first to write one!</p>
) : (
  <div className="space-y-6">
    {reviews.map((review) => {
      // Convert Firestore Timestamp to Date if needed
      const reviewDate = review.created_at?.toDate 
        ? review.created_at.toDate()
        : review.created_at;
      
      return (
        <div key={review.id} className="border-b border-[#FFD700]/30 pb-4">
          <div className="flex items-center gap-4 mb-2">
            <span className="font-bold text-[#FFD700]">
            {review.userName}
            </span>
            <div className="flex text-[#FFD700]">
              {'★'.repeat(review.rating).padEnd(5, '☆')}
            </div>
            <span className="text-sm text-gray-400 ml-auto">
              {new Date(reviewDate).toLocaleDateString()}
            </span>
          </div>
          <p className="text-gray-300">{review.comment}</p>
        </div>
      )}
    )}
  </div>
)}
</div>
    </div>
  );
  
};

export default ItemDetails;
