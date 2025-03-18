import { useState, useEffect } from "react";
import { db } from "../firebase"; // Firestore
import { collection, getDocs } from "firebase/firestore";
import { Button } from "@material-tailwind/react";
import ReactPaginate from "react-paginate";

const Shop = () => {
  const [perfumes, setPerfumes] = useState([]);
  const [filteredPerfumes, setFilteredPerfumes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const perfumesPerPage = 6; // Number of items per page
  
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
    <div className="min-h-screen bg-black text-[#FFD700] p-8">
      <h1 className="text-4xl font-bold text-center border-b border-[#FFD700] pb-4 mt-8">
        Luxurious Perfume Collection
      </h1>

      {/* Filters & Search */}
      <div className="flex flex-wrap gap-4 justify-center mt-6">
        <input
          type="text"
          placeholder="Search Perfume..."
          className="p-2 rounded-md border border-[#FFD700] bg-black text-white focus:ring-2 focus:ring-[#FFD700]"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="p-2 rounded-md border border-[#FFD700] bg-black text-white focus:ring-2 focus:ring-[#FFD700]"
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
          className="p-2 rounded-md border border-[#FFD700] bg-black text-white focus:ring-2 focus:ring-[#FFD700]"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
      </div>

      {/* Product Grid */}
      <div className="grid md:grid-cols-3 gap-8 mt-8">
        {currentItems.length > 0 ? (
          currentItems.map((perfume) => (
            <div key={perfume.id} className="border border-[#FFD700] p-4 rounded-lg shadow-lg shadow-yellow-500/50">
              <img
                src={perfume.imageUrl || "https://via.placeholder.com/300"}
                alt={perfume.name}
                className="w-full h-64 object-cover rounded-md"
              />
              <h2 className="text-xl font-bold mt-3">{perfume.name}</h2>
              <p className="text-sm text-gray-300">{perfume.description || "No description available"}</p>
              <p className="mt-2 text-lg font-semibold">${perfume.price}</p>
              <Button
                variant="gradient"
                className="mt-4 bg-[#FFD700] text-black px-4 py-2 rounded-md hover:bg-yellow-500 transition duration-300"
              >
                Add to Cart
              </Button>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 col-span-3">No perfumes found...</p>
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
          containerClassName={"flex justify-center mt-6 space-x-4"}
          pageClassName={"px-4 py-2 border border-[#FFD700] text-[#FFD700] rounded-md cursor-pointer hover:bg-[#FFD700] hover:text-black transition"}
          previousClassName={"px-4 py-2 border border-[#FFD700] text-[#FFD700] rounded-md cursor-pointer hover:bg-[#FFD700] hover:text-black transition"}
          nextClassName={"px-4 py-2 border border-[#FFD700] text-[#FFD700] rounded-md cursor-pointer hover:bg-[#FFD700] hover:text-black transition"}
          activeClassName={"bg-[#FFD700] text-black"}
        />
      )}
    </div>
  );
};

export default Shop;
