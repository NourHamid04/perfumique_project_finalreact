import { useState, useEffect } from "react";
import { db,auth } from "../firebase"; // Firestore
import { collection, getDocs,query,where,addDoc } from "firebase/firestore";
import { Button } from "@material-tailwind/react";
import ReactPaginate from "react-paginate";
import { Link } from "react-router-dom";
import shop from "../assets/website/shop-bg2.png"
import { doc, updateDoc } from "firebase/firestore"; // Add to existing imports
const Shop = () => {
  const [perfumes, setPerfumes] = useState([]);
  const [filteredPerfumes, setFilteredPerfumes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const perfumesPerPage = 6; // Number of items per page

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  // Reviews product
  const [productReviews, setProductReviews] = useState({});
  const [minRating, setMinRating] = useState(0);
  useEffect(() => {
    const fetchReviews = async () => {
      const reviewsRef = collection(db, "reviews");
      const querySnapshot = await getDocs(reviewsRef);
      
      const reviewsByProduct = {};
      querySnapshot.forEach((doc) => {
        const review = doc.data();
        if (!reviewsByProduct[review.product_id]) {
          reviewsByProduct[review.product_id] = [];
        }
        reviewsByProduct[review.product_id].push(review);
      });
      
      setProductReviews(reviewsByProduct);
    };
    
    fetchReviews();
  }, []);
  useEffect(() => {
    const fetchPerfumes = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      const perfumeList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPerfumes(perfumeList);
      setFilteredPerfumes(perfumeList);
    };
    fetchPerfumes();
  }, []);

  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => setShowPopup(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showPopup]);

  const addToCart = async (perfume) => {
    const user = auth.currentUser; // Get current user

    if (!user) {
      setPopupMessage("you must logg in in order to be able to add to cart!");
      setShowPopup(true);
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
        setPopupMessage("Item aleardy added to cart! ");
        setShowPopup(true);
    }
};

  // Filtering Logic
  useEffect(() => {
    let updatedPerfumes = perfumes;

    if (searchQuery) {
      updatedPerfumes = updatedPerfumes.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedBrand) {
      updatedPerfumes = updatedPerfumes.filter((p) => p.brand === selectedBrand);
    }

    if (maxPrice) {
      updatedPerfumes = updatedPerfumes.filter((p) => parseFloat(p.price) <= parseFloat(maxPrice));
    }

    if (minRating > 0) {
      updatedPerfumes = updatedPerfumes.filter(p => {
        const reviews = productReviews[p.id] || [];
        const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length || 0;
        return avgRating >= minRating;
      });
    }
    setFilteredPerfumes(updatedPerfumes);
    setCurrentPage(0); // Reset to first page after filtering
  }, [searchQuery, selectedBrand, maxPrice, minRating,perfumes]);

  // Pagination Logic
  const offset = currentPage * perfumesPerPage;
  const currentItems = filteredPerfumes.slice(offset, offset + perfumesPerPage);
  const pageCount = Math.ceil(filteredPerfumes.length / perfumesPerPage);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  return (
    <div className="min-h-screen bg-black text-[#BFA100] p-8 "   
    style={{ 
      backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 1) 20%, rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0) 0%, rgb(0, 0, 0) 100%), url(${shop})`,
      backgroundSize: "cover"
  }}>
        <div className="mt-24">
        <h1 className=" text-5xl font-bold text-center border-b border-[#BFA100] pb-4 mt-8 uppercase tracking-wide">
            Luxurious Perfume Collection
        </h1>

        {/* Filters & Search */}
        <div className="flex flex-wrap gap-6 justify-center mt-10">
            <input
                type="text"
                placeholder="Search Perfume..."
                className="p-3 rounded-md border border-[#FFD700] bg-black text-white focus:ring-2 focus:ring-[#FFD700] w-64 text-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
                className="p-3 rounded-md border border-[#FFD700] bg-black text-white focus:ring-2 focus:ring-[#FFD700] text-lg"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
            >
                <option value="">All Brands</option>
                <option value="Versace">Versace</option>
                <option value="Dior">Dior</option>
                <option value="Chanel">Chanel</option>
                <option value="Gucci">Gucci</option>
                <option value="Armani">Armani</option>
               <option value="Hugo Boss">Hugo Boss</option>
            </select>
            <select
              className="p-3 rounded-md border border-[#FFD700] bg-black text-white focus:ring-2 focus:ring-[#FFD700] text-lg"
              value={minRating}
              onChange={(e) => setMinRating(Number(e.target.value))}
            >
              <option value={0}>All Ratings</option>
              <option value={1}>1+ Stars</option>
              <option value={2}>2+ Stars</option>
              <option value={3}>3+ Stars</option>
              <option value={4}>4+ Stars</option>
              <option value={5}>5 Stars</option>
            </select>
            <input
                type="number"
                placeholder="Max Price"
                className="p-3 rounded-md border border-[#FFD700] bg-black text-white focus:ring-2 focus:ring-[#FFD700] w-40 text-lg"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
            />
        </div>

        {/* Product Grid */}
        <div className="grid md:grid-cols-3 gap-12 mt-12">
          {currentItems.length > 0 ? (
            currentItems.map((perfume) => (
              <div
                key={perfume.id}
                className="flex flex-col justify-between h-[700px] border border-[#FFD700] p-8 rounded-lg bg-black/60 backdrop-blur-md transition-transform duration-300 hover:scale-105"
                >
                <Link to={`/shop/${perfume.id}`}>
                <div className="w-full h-[350px] flex items-center justify-center bg-black">
          <img
            src={perfume.imageUrl || "https://via.placeholder.com/300"}
            alt={perfume.name}
            className="max-w-full max-h-full object-contain rounded-lg border border-[#FFD700]"
          />
        </div>

        </Link>
        <div className="flex flex-col justify-between flex-grow mt-4">
          <h2 className="text-2xl font-bold text-center tracking-wide">{perfume.name}</h2>
          <p className="text-md text-gray-300 mt-1 text-center">
            {perfume.description || "No description available"}
          </p>
           {/* Add Rating Display */}
  <div className="flex items-center justify-center gap-2 mt-2">
  <div className="flex text-[#FFD700]">
  {[...Array(5)].map((_, index) => {
    const avgRating =
      productReviews[perfume.id]?.reduce((sum, r) => sum + r.rating, 0) /
        productReviews[perfume.id]?.length || 0;

    return (
      <span
        key={index}
        className={`text-4xl  drop-shadow ${
          index < Math.round(avgRating)
            ? 'text-[#FFD700]'
            : 'text-gray-400'
        }`}
      >
        ★
      </span>
    );
  })}
</div>

    <span className="text-sm text-[#FFD700]">
      ({productReviews[perfume.id]?.length || 0} reviews)
    </span>
  </div>
          <p className="mt-1 text-xl font-semibold text-center">${perfume.price}</p>
        </div>

        <Button
  variant="gradient"
  className="mt-2 bg-gradient-to-r from-yellow-500 to-yellow-300 text-black px-8 py-4 rounded-xl shadow-lg font-semibold w-full overflow-hidden focus:outline-none active:scale-95 transition-transform duration-100 tracking-wide flex items-center justify-center"
  onClick={(e) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling if needed
    addToCart(perfume);
  }}
>
  Add to Cart
</Button>


      </div>
    ))
  ) : (
    <p className="text-center text-gray-400 col-span-3 text-xl">No perfumes found...</p>
  )}
</div>


        {/* Pagination */}
        {pageCount > 1 && (
            <ReactPaginate
                previousLabel={"Previous"}
                nextLabel={"Next"}
                breakLabel={"..."}
                pageCount={pageCount}
                marginPagesDisplayed={2}
                pageRangeDisplayed={3}
                onPageChange={handlePageClick}
                containerClassName={"flex justify-center mt-10 space-x-6"}
                pageClassName={"px-5 py-3 border border-[#FFD700] text-[#FFD700] rounded-md cursor-pointer hover:bg-[#FFD700] hover:text-black transition text-lg"}
                previousClassName={"px-5 py-3 border border-[#FFD700] text-[#FFD700] rounded-md cursor-pointer hover:bg-[#FFD700] hover:text-black transition text-lg"}
                nextClassName={"px-5 py-3 border border-[#FFD700] text-[#FFD700] rounded-md cursor-pointer hover:bg-[#FFD700] hover:text-black transition text-lg"}
                activeClassName={"bg-[#FFD700] text-black"}
            />
        )}
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
    </div>
);

};

export default Shop;
