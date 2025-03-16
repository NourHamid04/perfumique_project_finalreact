import { useState, useEffect } from "react";
import { Button } from "@material-tailwind/react";
import AddPerfumesForm from "./AddPerfumeForm";
import { db } from "../firebase";
import { collection, onSnapshot, doc, deleteDoc } from "firebase/firestore";

const AdminPerfumes = () => {
  const [open, setOpen] = useState(false);
  const [perfumes, setPerfumes] = useState([]);
  const [selectedPerfume, setSelectedPerfume] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const perfumesPerPage = 5;

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
    console.log("Opening Add Perfume Modal");
    setOpen(!open);
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

  const handleView = (perfume) => {
    setSelectedPerfume(perfume);
  };

  const closeModal = () => {
    setSelectedPerfume(null);
  };

  // Pagination
  const indexOfLastPerfume = currentPage * perfumesPerPage;
  const indexOfFirstPerfume = indexOfLastPerfume - perfumesPerPage;
  const currentPerfumes = perfumes.slice(indexOfFirstPerfume, indexOfLastPerfume);
  const totalPages = Math.ceil(perfumes.length / perfumesPerPage);

  const nextPage = () => setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
  const prevPage = () => setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));

  return (
    <div className="p-4 relative min-h-screen text-[#FFD700] mt-12">

      <h2 className="text-2xl font-bold mb-4 border-b border-[#FFD700] pb-2 tracking-wide">
        Manage Perfumes
      </h2>

      {/* Add Perfume Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          variant="gradient"
          className="bg-[#FFD700] text-black px-4 py-2 font-semibold rounded-md shadow-lg hover:bg-yellow-500 hover:shadow-xl transition duration-300"
          onClick={handleOpen}
        >
          + Add Perfume
        </Button>
      </div>

      {/* Perfume Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full border-collapse border border-[#FFD700] shadow-md bg-black text-[#FFD700] text-sm">
          <thead>
            <tr className="bg-[#FFD700] text-black text-md">
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
                <tr key={perfume.id} className={`hover:bg-[#FFD700] hover:text-black transition duration-300 ${index % 2 === 0 ? "bg-[#222222]" : "bg-black"}`}>
                  <td className="p-2 border border-[#FFD700] text-center">{perfume.name}</td>
                  <td className="p-2 border border-[#FFD700] text-center">Versace</td>
                  <td className="p-2 border border-[#FFD700] text-center">${perfume.price}</td>
                  <td className="p-2 border border-[#FFD700] text-center">{perfume.stock}</td>
                  <td className="p-2 border border-[#FFD700] text-center flex gap-2 justify-center">
                    <button
                      className="bg-blue-500 text-white px-2 py-1 rounded-md shadow-md hover:bg-blue-700 transition duration-300"
                      onClick={() => handleView(perfume)}
                    >
                      View
                    </button>
                    <button
                      className="bg-red-600 text-white px-2 py-1 rounded-md shadow-md hover:bg-red-800 transition duration-300"
                      onClick={() => handleDeletePerfume(perfume.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-gray-400 p-3">No perfumes added yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center mt-6 space-x-4">
          <button
            onClick={prevPage}
            className={`px-4 py-2 rounded-md font-semibold text-black transition duration-300 ${currentPage === 1 ? "bg-gray-500 cursor-not-allowed text-white" : "bg-[#FFD700] hover:bg-yellow-400 hover:shadow-lg"}`}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          <span className="text-[#FFD700] font-semibold text-lg">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={nextPage}
            className={`px-4 py-2 rounded-md font-semibold text-black transition duration-300 ${currentPage === totalPages ? "bg-gray-500 cursor-not-allowed text-white" : "bg-[#FFD700] hover:bg-yellow-400 hover:shadow-lg"}`}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      )}

  
      {open && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <AddPerfumesForm isOpen={open} onClose={handleOpen} />
        </div>
      )}

      {/* View Perfume */}
      {selectedPerfume && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 text-center">
            <h3 className="text-lg font-semibold text-black mb-3">{selectedPerfume.name}</h3>
            <img src="https://via.placeholder.com/300" alt="Perfume" className="w-full h-64 object-cover rounded-md" />
            <p className="text-gray-700 mt-2">{selectedPerfume.description || "No description available."}</p>
            <button className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700 transition duration-300" onClick={closeModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPerfumes;
