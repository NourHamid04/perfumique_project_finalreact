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
  const [searchQuery, setSearchQuery] = useState("");
  const [brandSearchQuery, setBrandSearchQuery] = useState("");
  const [nameSortOrder, setNameSortOrder] = useState("");
  const [priceSortOrder, setPriceSortOrder] = useState("");
  const [selectedPerfumesForDeletion, setSelectedPerfumesForDeletion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletePerfumeId, setDeletePerfumeId] = useState(null);


  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");




  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
      const perfumeList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPerfumes(perfumeList);
      setLoading(false);
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
    setDeletePerfumeId(id);
    setPopupMessage("Are you sure you want to delete this perfume?");
    setShowPopup(true);
  };

  const handleDeleteSelectedPerfumes = async () => {
    setPopupMessage("Are you sure you want to delete the selected perfumes?");
    setShowPopup(true);
  };

  const confirmDelete = async () => {
    try {
      console.log("deletePerfumeId", deletePerfumeId)
      if (deletePerfumeId) {
        await deleteDoc(doc(db, "products", deletePerfumeId));
        setPopupMessage("Perfume deleted successfully!");
      } else {
        for (const id of selectedPerfumesForDeletion) {
          await deleteDoc(doc(db, "products", id));
        }
        setPopupMessage("Selected perfumes deleted successfully!");
        setSelectedPerfumesForDeletion([]);
      }
    } catch (error) {
      setPopupMessage("Failed to delete perfume(s).");
      console.error("Error deleting perfume:", error);
    }
    setShowPopup(true);
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

  // Filter perfumes based on search queries
  const filteredPerfumes = perfumes.filter((perfume) => {
    const nameMatch = perfume.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const brandMatch = perfume.brand?.toLowerCase().includes(brandSearchQuery.toLowerCase());
    return (searchQuery === '' || nameMatch) && (brandSearchQuery === '' || brandMatch);
  });

  // Sort perfumes
  const sortedPerfumes = [...filteredPerfumes].sort((a, b) => {
    if (nameSortOrder === "asc") {
      return (a.name || '').localeCompare(b.name || '');
    } else if (nameSortOrder === "desc") {
      return (b.name || '').localeCompare(a.name || '');
    }
    if (priceSortOrder === "asc") {
      return (a.price || 0) - (b.price || 0);
    } else if (priceSortOrder === "desc") {
      return (b.price || 0) - (a.price || 0);
    }
    return 0;
  });

  // Pagination
  const indexOfLastPerfume = currentPage * perfumesPerPage;
  const indexOfFirstPerfume = indexOfLastPerfume - perfumesPerPage;
  const currentPerfumes = sortedPerfumes.slice(indexOfFirstPerfume, indexOfLastPerfume);
  const totalPages = Math.ceil(sortedPerfumes.length / perfumesPerPage);

  const nextPage = () => setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
  const prevPage = () => setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));

  return (
    <div className="p-4 relative min-h-screen text-[#FFD700]">
      <h2 className="text-2xl font-bold mb-4 border-b border-[#FFD700] pb-2 tracking-wide">
        Manage Perfumes
      </h2>

      {/* Search and Sort Controls */}
      <div className="flex gap-4 mb-6 items-center">
        <input
          type="text"
          placeholder="Search by Name"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="w-1/3 p-2 rounded-md border border-[#FFD700] bg-black text-[#FFD700] placeholder-[#FFD700] focus:outline-none focus:ring-2 focus:ring-[#FFD700] transition duration-300"
        />

        <input
          type="text"
          placeholder="Search by Brand"
          value={brandSearchQuery}
          onChange={(e) => {
            setBrandSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="w-1/3 p-2 rounded-md border border-[#FFD700] bg-black text-[#FFD700] placeholder-[#FFD700] focus:outline-none focus:ring-2 focus:ring-[#FFD700] transition duration-300"
        />

        <select
          onChange={(e) => {
            setNameSortOrder(e.target.value);
            setCurrentPage(1);
          }}
          value={nameSortOrder}
          className="w-1/3 p-2 rounded-md border border-[#FFD700] bg-black text-[#FFD700] focus:outline-none focus:ring-2 focus:ring-[#FFD700] transition duration-300"
        >
          <option value="">Sort By Name</option>
          <option value="asc">A - Z</option>
          <option value="desc">Z - A</option>
        </select>

        <select
          onChange={(e) => {
            setPriceSortOrder(e.target.value);
            setCurrentPage(1);
          }}
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
            {loading ? (
              <tr>
                <td colSpan="6" className="text-center p-4 text-[#FFD700]">
                  Loading perfumes...
                </td>
              </tr>
            ) : currentPerfumes.length > 0 ? (
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
                      className="w-4 h-4"
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
                      onClick={() => openEditModal(perfume.id)}
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
      {sortedPerfumes.length > perfumesPerPage && (
        <div className="flex items-center gap-4 mt-4 justify-center">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md shadow-lg transition duration-300 ${currentPage === 1
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-yellow-500 text-black hover:bg-yellow-400 hover:shadow-xl"
              }`}
          >
            Prev
          </button>

          <span className="text-[#FFD700] font-medium">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-md shadow-lg transition duration-300 ${currentPage === totalPages
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-yellow-500 text-black hover:bg-yellow-400 hover:shadow-xl"
              }`}
          >
            Next
          </button>
        </div>
      )}


      {/* Bottom Right Buttons */}
      <div className="absolute bottom-6 right-3 flex gap-4">
        <button
          onClick={handleDeleteSelectedPerfumes}
          disabled={selectedPerfumesForDeletion.length === 0}
          className={`px-4 py-2 rounded-md text-white shadow-md transition duration-300 ${selectedPerfumesForDeletion.length === 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-500 hover:bg-red-700"
            }`}        >
          Delete Selected
        </button>
        <button
          onClick={handleOpen}
          className="bg-[#FFD700] text-black font-semibold px-4 py-2 rounded-md hover:bg-yellow-500 transition duration-300"
        >
          Add Perfume
        </button>
      </div>

      {/* Modals */}
      {isEditModalOpen && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <AdminEditPerfume
            perfumeId={selectedPerfumeId}
            closeModal={closeEditModal}
          />
        </div>
      )}

      {open && (
        <div className=" inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <AddPerfumesForm isOpen={open} onClose={handleOpen} />
        </div>
      )}

      {selectedPerfume && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 text-center">
            <h3 className="text-lg font-semibold text-black mb-3">{selectedPerfume.name}</h3>
            <img
              src={selectedPerfume.imageUrl || "https://via.placeholder.com/300"}
              alt={selectedPerfume.name}
              className="w-full h-64 object-cover rounded-md"
            />
            <p className="text-gray-700 mt-3">
              {selectedPerfume.description || "No description available."}
            </p>
            <button
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300"
              onClick={closeModal}
            >
              Close
            </button>
          </div>
        </div>
      )}
     {showPopup && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
    <div className="bg-[#222222] text-white p-6 rounded-md shadow-lg max-w-sm w-full text-center">
      <p className="mb-4 text-[#FFD700] text-lg">{popupMessage}</p>
      {popupMessage.includes("Are you sure") ? (
        <div className="flex justify-around">
          <button
            onClick={() => {
              confirmDelete();
              setShowPopup(false);
              setDeletePerfumeId(null);
            }}
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
          >
            Yes
          </button>
          <button
            onClick={() => {
              setShowPopup(false);
              setDeletePerfumeId(null);
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="flex justify-center">
          <button
            onClick={() => setShowPopup(false)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            OK
          </button>
        </div>
      )}
    </div>
  </div>
)}


    </div>
  );
};

export default AdminPerfumes;