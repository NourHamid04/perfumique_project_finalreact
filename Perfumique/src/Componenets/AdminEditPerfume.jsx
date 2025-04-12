import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"; // Firebase Storage
import { Button } from "@material-tailwind/react";
import { db } from "../firebase";
const AdminEditPerfume = ({ perfumeId, closeModal }) => {
  const [perfumeData, setPerfumeData] = useState({
    name: "",
    brand: "",
    price: "",
    stock: "",
    description: "",
    imageUrl: "", // Initially empty
  });

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");


  const [image, setImage] = useState(null); // New state to store the image file

  useEffect(() => {
    // Fetch the perfume data from Firebase when the modal is opened
    const fetchPerfumeData = async () => {
      const perfumeRef = doc(db, "products", perfumeId);
      const docSnap = await getDoc(perfumeRef);
      if (docSnap.exists()) {
        setPerfumeData(docSnap.data());
      } else {
        console.log("No such document!");
      }
    };

    fetchPerfumeData();
  }, [perfumeId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPerfumeData({
      ...perfumeData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file); // Set the selected file in state
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // If there's an image, just update the image URL in the Firestore document
    let updatedPerfumeData = { ...perfumeData };

    if (image) {
      updatedPerfumeData.imageUrl = URL.createObjectURL(image); // Use the local image URL instead of uploading to Firebase
    }

    // Now update the Firestore document with the new data
    const perfumeRef = doc(db, "products", perfumeId);
    try {
      await updateDoc(perfumeRef, updatedPerfumeData);
      setPopupMessage("Perfume Editted successfully!");
      setShowPopup(true);
    } catch (error) {
      console.error("Error updating perfume: ", error);
      alert("Failed to update perfume.");
    }
  };


  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[6000] flex items-center justify-center">
          <div className="bg-[#222222] text-white p-6 rounded-md shadow-lg max-w-sm w-full text-center">
            <p className="mb-4 text-[#FFD700] text-lg">{popupMessage}</p>
            <div className="flex justify-center">
              <button
                onClick={() => {
                  setShowPopup(false);
                  closeModal();
                }}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-black border border-[#FFD700] rounded-lg shadow-2xl shadow-yellow-500/50 p-6 w-full max-w-md">
        <h3 className="text-lg font-bold text-[#FFD700] mb-4">Edit Perfume</h3>
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-[#FFD700]">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={perfumeData.name}
              onChange={handleInputChange}
              className="w-full mt-2 p-2 rounded-md border border-[#FFD700] bg-black text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
            />
          </div>

          {/* Brand */}
          <div className="mb-4">
            <label htmlFor="brand" className="block text-sm font-medium text-[#FFD700]">
              Brand
            </label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={perfumeData.brand}
              onChange={handleInputChange}
              className="w-full mt-2 p-2 rounded-md border border-[#FFD700] bg-black text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
            />
          </div>

          {/* Price */}
          <div className="mb-4">
            <label htmlFor="price" className="block text-sm font-medium text-[#FFD700]">
              Price
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={perfumeData.price}
              onChange={handleInputChange}
              className="w-full mt-2 p-2 rounded-md border border-[#FFD700] bg-black text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
            />
          </div>

          {/* Stock */}
          <div className="mb-4">
            <label htmlFor="stock" className="block text-sm font-medium text-[#FFD700]">
              Stock
            </label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={perfumeData.stock}
              onChange={handleInputChange}
              className="w-full mt-2 p-2 rounded-md border border-[#FFD700] bg-black text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-[#FFD700]">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={perfumeData.description}
              onChange={handleInputChange}
              className="w-full mt-2 p-2 rounded-md border border-[#FFD700] bg-black text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
            />
          </div>

          {/* Image Upload */}
          <div className="mb-4">
            <label htmlFor="image" className="block text-sm font-medium text-[#FFD700]">
              Image
            </label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}
              className="w-full mt-2 p-2 rounded-md border border-[#FFD700] bg-black text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
            />
          </div>

          <div className="flex justify-between gap-4 mt-6">
            <Button
              type="button"
              className="bg-red-500 text-white px-4 py-2 rounded-md"
              onClick={closeModal}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#FFD700] text-black px-4 py-2 rounded-md"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEditPerfume;
