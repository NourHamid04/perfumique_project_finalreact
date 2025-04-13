import { useState, useEffect } from "react";
import { db,auth } from "../firebase"; // Firestore
import { collection, getDocs,query,where,addDoc } from "firebase/firestore";
import { Button } from "@material-tailwind/react";
import ReactPaginate from "react-paginate";
import { Link } from "react-router-dom";
import shop from "../assets/website/shop-bg2.png"
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

    setFilteredPerfumes(updatedPerfumes);
    setCurrentPage(0); // Reset to first page after filtering
  }, [searchQuery, selectedBrand, maxPrice, perfumes]);

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
                    <div key={perfume.id} className="border border-[#FFD700] p-6 rounded-lg  bg-black/60 backdrop-blur-md transition-transform duration-300 hover:scale-105">
                        <Link to={`/shop/${perfume.id}`}>
                            <img
                                src={perfume.imageUrl || "https://via.placeholder.com/300"}
                                alt={perfume.name}
                                className="w-full h-72 object-cover rounded-lg border border-[#FFD700] "
                            />
                        </Link>
                        <h2 className="text-2xl font-bold mt-4 text-center tracking-wide">{perfume.name}</h2>
                        <p className="text-md text-gray-300 mt-2 text-center">{perfume.description || "No description available"}</p>
                        <p className="mt-4 text-xl font-semibold text-center">${perfume.price}</p>

                        {/* Add to Cart Button */}
                        <Button
                            variant="gradient"
                            className="mt-6 bg-gradient-to-r from-yellow-500 to-yellow-300 text-black px-5 py-3 rounded-md shadow-md font-semibold  w-full"
                            onClick={(e) => {
                                e.preventDefault();
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
