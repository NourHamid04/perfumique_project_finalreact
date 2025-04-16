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
    return <div className="min-h-screen flex bg-black items-center justify-center text-[#FFD700]">Loading product details...</div>;
  }

  
  return (
    <div className="min-h-screen bg-black text-[#FFD700] p-8 pt-32"  style={{ 
          backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 1) 20%, rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 100%), url(${ItemimgDetails})`,
          backgroundSize: "cover"
      }}>
      <div className="container mx-auto max-w-6xl flex flex-col md:flex-row items-center gap-12 bg-black/90 rounded-2xl p-8 shadow-xl border border-[#FFD700]/30 backdrop-blur-lg">
        {/* Product Image */}
        <div className="flex-1 relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FFD700]/20 to-transparent rounded-xl" />
          <img
            src={product.imageUrl || "https://via.placeholder.com/500"}
            alt={product.name}
            className="w-full h-[500px] object-cover rounded-xl border-2 border-[#FFD700]/30 group-hover:border-[#FFD700]/60 transition-all duration-300"
          />
        </div>
  
        {/* Product Details */}
        <div className="flex-1 space-y-6">
          <div className="border-b border-[#FFD700]/20 pb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FFD700] to-amber-200 bg-clip-text text-transparent">
              {product.name}
            </h1>
            <p className="mt-2 text-lg text-gray-300 font-light">{product.description}</p>
            
            <div className="mt-4 flex items-center gap-4">
              <span className="text-3xl font-bold bg-gradient-to-r from-[#FFD700] to-amber-200 bg-clip-text text-transparent">
                ${(product.price * quantity).toFixed(2)}
              </span>
              <div className="h-6 w-px bg-[#FFD700]/30" />
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`text-xl ${i < Math.round(averageRating) ? 'text-[#FFD700]' : 'text-gray-600'}`}>
                    ★
                  </span>
                ))}
                <span className="text-sm text-gray-400">({averageRating.toFixed(1)})</span>
              </div>
            </div>
          </div>
  
          {/* Quantity Controls */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-black/50 rounded-full p-1 border border-[#FFD700]/20">
                <button
                  onClick={() => handleQuantityChange(quantity - 1)}
                  className="h-10 w-10 rounded-full bg-[#FFD700]/10 hover:bg-[#FFD700]/20 transition-colors"
                >
                  -
                </button>
                <span className="w-8 text-center text-xl">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(quantity + 1)}
                  className="h-10 w-10 rounded-full bg-[#FFD700]/10 hover:bg-[#FFD700]/20 transition-colors"
                >
                  +
                </button>
              </div>
              <span className="text-sm text-gray-400">{product.stock} in stock</span>
            </div>
  
            {user && role === "customer" ? (
              <button
                onClick={addToCart}
                disabled={addingToCart}
                className="w-full py-4 bg-gradient-to-r from-[#FFD700] to-amber-500 rounded-xl text-black font-bold hover:shadow-lg hover:scale-[1.02] transition-transform duration-200"
              >
                {addingToCart ? "Adding..." : "Add to Cart"}
              </button>
            ) : (
              <p className="text-center text-red-400/80">Login as customer to purchase</p>
            )}
          </div>
  
          <button
            onClick={() => navigate("/shop")}
            className="flex items-center gap-2 text-[#FFD700]/80 hover:text-[#FFD700] transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Shop
          </button>
        </div>
      </div>
  
      {/* Reviews Section */}
      <div className="container mx-auto max-w-4xl mt-16">
        <div className="bg-black/90 rounded-2xl p-8 border border-[#FFD700]/20">
          <h2 className="text-2xl font-bold mb-6 bg-gradient-to-r from-[#FFD700] to-amber-200 bg-clip-text text-transparent">
            Customer Reviews
          </h2>
  
          {/* Review Form */}
          {user ? (
            <form onSubmit={handleReviewSubmit} className="mb-12">
              <div className="flex items-center gap-4 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-3xl transition-colors ${rating >= star ? 'text-[#FFD700]' : 'text-gray-600'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience..."
                className="w-full bg-black/30 border border-[#FFD700]/20 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700]/50"
                rows="4"
                required
              />
              <button
                type="submit"
                className="mt-4 px-8 py-3 bg-[#FFD700]/90 hover:bg-[#FFD700] text-black font-semibold rounded-lg transition-colors"
              >
                {userReview ? "Update Review" : "Submit Review"}
              </button>
            </form>
          ) : (
            <p className="text-center text-gray-400 py-6">Sign in to leave a review</p>
          )}
  
          {/* Reviews List */}
          {loadingReviews ? (
            <div className="text-center py-8 text-[#FFD700]/80">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <p className="text-center text-gray-400 py-6">No reviews yet. Be the first!</p>
          ) : (
            <div className="space-y-8">
              {reviews.map((review) => {
                const reviewDate = review.created_at?.toDate?.() || review.created_at;
                return (
                  <div key={review.id} className="border-b border-[#FFD700]/10 pb-6 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-[#FFD700]">{review.userName}</span>
                        <div className="flex text-[#FFD700]">
                          {'★'.repeat(review.rating).padEnd(5, '☆')}
                        </div>
                      </div>
                      <span className="text-sm text-gray-400">
                        {new Date(reviewDate).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric'
                        })}
                      </span>
                    </div>
                    <p className="text-gray-300 pl-1">{review.comment}</p>
                  </div>
                )}
              )}
            </div>
          )}
        </div>
      </div>
  
      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-black/90 border border-[#FFD700]/20 rounded-xl p-8 max-w-md w-full mx-4 shadow-xl">
            <p className="text-center text-xl text-[#FFD700] mb-6">{popupMessage}</p>
            <button
              onClick={() => setShowPopup(false)}
              className="w-full py-3 bg-[#FFD700]/90 hover:bg-[#FFD700] text-black font-semibold rounded-lg transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
  
  
};

export default ItemDetails;
