import { useState, useEffect } from "react";
import { Button } from "@material-tailwind/react";
import { db } from "../firebase";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import AddPerfumesForm from "./AddPerfumeForm";
import AdminEditPerfume from "./AdminEditPerfume";
const AdminPerfumes = () => {
  const [open, setOpen] = useState(false);
  const [perfumes, setPerfumes] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPerfumeId, setSelectedPerfumeId] = useState(null);

  const [selectedPerfume, setSelectedPerfume] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const perfumesPerPage = 5;
  const [searchQuery, setSearchQuery] = useState(""); // State for name search input
  const [brandSearchQuery, setBrandSearchQuery] = useState(""); // State for brand search input
  const [nameSortOrder, setNameSortOrder] = useState(""); // State for sorting name (ascending or descending)
  const [priceSortOrder, setPriceSortOrder] = useState(""); // State for sorting price (low to high or high to low)
  const [selectedPerfumesForDeletion, setSelectedPerfumesForDeletion] = useState([]); // State for selected perfumes

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const perfumeList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPerfumes(perfumeList);
    });

    return () => unsubscribe();
  }, []);

  const handleOpen = () => {
    setOpen(!open);
  };


  const openEditModal = (id) => {
    setSelectedPerfumeId(id);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedPerfumeId(null);
  };


  const handleDeletePerfume = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this perfume?");
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, "products", id));
        alert("Perfume deleted successfully!");
      } catch (error) {
        console.error("Error deleting perfume:", error);
        alert("Failed to delete perfume.");
      }
    }
  };

  const handleDeleteSelectedPerfumes = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete the selected perfumes?"
    );
    if (confirmDelete) {
      try {
        for (const id of selectedPerfumesForDeletion) {
          await deleteDoc(doc(db, "products", id));
        }
        alert("Selected perfumes deleted successfully!");
        setSelectedPerfumesForDeletion([]); // Clear selection
      } catch (error) {
        console.error("Error deleting selected perfumes:", error);
        alert("Failed to delete selected perfumes.");
      }
    }
  };

  const handleCheckboxChange = (id) => {
    if (selectedPerfumesForDeletion.includes(id)) {
      setSelectedPerfumesForDeletion(
        selectedPerfumesForDeletion.filter((itemId) => itemId !== id)
      );
    } else {
      setSelectedPerfumesForDeletion([...selectedPerfumesForDeletion, id]);
    }
  };

  const handleView = (perfume) => {
    setSelectedPerfume(perfume);
  };

  const closeModal = () => {
    setSelectedPerfume(null);
  };

  // Pagination
  const indexOfLastPerfume = currentPage * perfumesPerPage;
  const indexOfFirstPerfume = indexOfLastPerfume - perfumesPerPage;

  // Filter perfumes based on search query
  const filteredPerfumes = perfumes.filter((perfume) =>
    (perfume.name && perfume.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (perfume.brand && perfume.brand.toLowerCase().includes(brandSearchQuery.toLowerCase()))
  );

  // Sort perfumes
  const sortedPerfumes = filteredPerfumes.sort((a, b) => {
    // Sort by name
    if (nameSortOrder === "asc") {
      return a.name.localeCompare(b.name);
    } else if (nameSortOrder === "desc") {
      return b.name.localeCompare(a.name);
    }

    // Sort by price
    if (priceSortOrder === "asc") {
      return a.price - b.price;
    } else if (priceSortOrder === "desc") {
      return b.price - a.price;
    }
    return 0;
  });

  const currentPerfumes = sortedPerfumes.slice(indexOfFirstPerfume, indexOfLastPerfume);
  const totalPages = Math.ceil(filteredPerfumes.length / perfumesPerPage);

  const nextPage = () => setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
  const prevPage = () => setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));

  return (
    <div className="p-4 relative min-h-screen text-[#FFD700] mt-12">
      <h2 className="text-2xl font-bold mb-4 border-b border-[#FFD700] pb-2 tracking-wide">
        Manage Perfumes
      </h2>

      {/* Search and Sort Controls */}
      <div className="flex gap-4 mb-6 items-center">
        {/* Search Input for Name */}
        <input
          type="text"
          placeholder="Search by Name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-1/3 p-2 rounded-md border border-[#FFD700] bg-black text-[#FFD700] placeholder-[#FFD700] focus:outline-none focus:ring-2 focus:ring-[#FFD700] transition duration-300"
        />

        {/* Search Input for Brand */}
        <input
          type="text"
          placeholder="Search by Brand"
          value={brandSearchQuery}
          onChange={(e) => setBrandSearchQuery(e.target.value)}
          className="w-1/3 p-2 rounded-md border border-[#FFD700] bg-black text-[#FFD700] placeholder-[#FFD700] focus:outline-none focus:ring-2 focus:ring-[#FFD700] transition duration-300"
        />

        {/* Sort by Name Dropdown */}
        <select
          onChange={(e) => setNameSortOrder(e.target.value)}
          value={nameSortOrder}
          className="w-1/3 p-2 rounded-md border border-[#FFD700] bg-black text-[#FFD700] focus:outline-none focus:ring-2 focus:ring-[#FFD700] transition duration-300"
        >
          <option value="">Sort By Name</option>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>

        {/* Sort by Price Dropdown */}
        <select
          onChange={(e) => setPriceSortOrder(e.target.value)}
          value={priceSortOrder}
          className="w-1/3 p-2 rounded-md border border-[#FFD700] bg-black text-[#FFD700] focus:outline-none focus:ring-2 focus:ring-[#FFD700] transition duration-300"
        >
          <option value="">Sort By Price</option>
          <option value="asc">Low to High</option>
          <option value="desc">High to Low</option>
        </select>
      </div>

      {/* Perfume Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse border border-[#FFD700] shadow-md bg-black text-[#FFD700] text-sm">
          <thead>
            <tr className="bg-[#FFD700] text-black text-md">
              <th className="p-2 border border-[#FFD700]">Select</th>
              <th className="p-2 border border-[#FFD700]">Name</th>
              <th className="p-2 border border-[#FFD700]">Brand</th>
              <th className="p-2 border border-[#FFD700]">Price</th>
              <th className="p-2 border border-[#FFD700]">Stock</th>
              <th className="p-2 border border-[#FFD700]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentPerfumes.length > 0 ? (
              currentPerfumes.map((perfume, index) => (
                <tr
                  key={perfume.id}
                  className={`hover:bg-[#FFD700] hover:text-black transition duration-300 ${index % 2 === 0 ? "bg-[#222222]" : "bg-black"} ${selectedPerfumesForDeletion.includes(perfume.id) ? "bg-[none]" : ""}`}
                >
                  <td className="p-2 border border-[#FFD700] text-center w-10">
                    <input
                      type="checkbox"
                      checked={selectedPerfumesForDeletion.includes(perfume.id)}
                      onChange={() => handleCheckboxChange(perfume.id)}
                      className="w-4 h-4" // Smaller checkbox
                    />
                  </td>
                  <td className="p-2 border border-[#FFD700] text-center">{perfume.name}</td>
                  <td className="p-2 border border-[#FFD700] text-center">{perfume.brand}</td>
                  <td className="p-2 border border-[#FFD700] text-center">${perfume.price}</td>
                  <td className="p-2 border border-[#FFD700] text-center">{perfume.stock}</td>
                  <td className="p-2 border border-[#FFD700] text-center flex gap-2 justify-center">
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded-md shadow-md hover:bg-blue-700 transition duration-300"
                      onClick={() => handleView(perfume)}
                    >
                      View
                    </button>
                    <Button
                      variant="gradient"
                      className="bg-[#FFD700] text-black font-semibold px-4 py-1.5 rounded-md hover:bg-yellow-500 transition duration-300"
                      onClick={() => openEditModal(perfume.id)} // handleEdit should open the AdminEditPerfume modal
                    >
                      Edit
                    </Button>
                    <button
                      className="bg-red-500 text-white px-2 py-1 rounded-md shadow-md hover:bg-red-700 transition duration-300"
                      onClick={() => handleDeletePerfume(perfume.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center p-4 text-[#FFD700]">
                  No perfumes found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredPerfumes.length > perfumesPerPage && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={prevPage}
            className="bg-yellow-500 text-black px-4 py-2 rounded-md shadow-lg hover:bg-yellow-400 hover:shadow-xl transition duration-300"
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <button
            onClick={nextPage}
            className="bg-yellow-500 text-black px-4 py-2 rounded-md shadow-lg hover:bg-yellow-400 hover:shadow-xl transition duration-300"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

      {/* Bottom Right Delete Button */}
      <div className="absolute bottom-14 right-6 flex gap-4">
        <button
          onClick={handleDeleteSelectedPerfumes}
          disabled={selectedPerfumesForDeletion.length === 0}
          className="bg-red-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-700 transition duration-300"
        >
          Delete Selected
        </button>
        <button
          onClick={handleOpen}
          className="bg-yellow-500 text-black px-4 py-2 rounded-md shadow-lg hover:bg-yellow-400 hover:shadow-xl transition duration-300"
        >
          Add Perfume
        </button>
      </div>
      {/* Edit Perfume Modal */}
      {isEditModalOpen && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">

          <AdminEditPerfume
            perfumeId={selectedPerfumeId}
            closeModal={closeEditModal}
          />
        </div>
      )}
      {open && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <AddPerfumesForm isOpen={open} onClose={handleOpen} />
        </div>
      )}
      {selectedPerfume && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 text-center">
            <h3 className="text-lg font-semibold text-black mb-3">{selectedPerfume.name}</h3>

            {/* Perfume Image */}
            <img
              src={selectedPerfume.imageUrl || "https://via.placeholder.com/300"}
              alt={selectedPerfume.name}
              className="w-full h-64 object-cover rounded-md"
            />

            {/* Perfume Description */}
            <p className="text-gray-700 mt-3">
              {selectedPerfume.description ? selectedPerfume.description : "No description available."}
            </p>

            {/* Close Button */}
            <button
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div >
  );
};

export default AdminPerfumes;
