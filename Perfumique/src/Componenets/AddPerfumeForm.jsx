import { useEffect, useState } from "react";
import { db } from "../firebase"; // Firestore
import { collection, addDoc } from "firebase/firestore";
import { supabase } from "../supabase"; // Import Supabase client
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
} from "@material-tailwind/react";

const AddPerfumesForm = ({ isOpen, onClose }) => {

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    price: "",
    description: "",
    stock: "",
    image: null,
  });


  const [imageName, setImageName] = useState("");
  const [uploading, setUploading] = useState(false); // Upload state

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      setImageName(file.name);
    }
  };

  const uploadImage = async (file) => {
    if (!file) return null;

    setUploading(true);
    const filePath = `perfumes/${Date.now()}_${file.name}`; // Unique filename

    const { data, error } = await supabase.storage.from("perfume-images").upload(filePath, file);

    if (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image.");

      setUploading(false);
      return null;
    }

    setUploading(false);
    return `${supabase.storage.from("perfume-images").getPublicUrl(filePath).data.publicUrl}`;
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.stock) {
      alert("Please fill in all required fields.");
      return;
    }

    if (isNaN(formData.price) || isNaN(formData.stock)) {
      alert("Price and Stock must be valid numbers.");
      return;
    }

    try {
      let imageUrl = null;
      if (formData.image) {
        imageUrl = await uploadImage(formData.image);
      }

      await addDoc(collection(db, "products"), {
        name: formData.name,
        brand: formData.brand,
        price: parseFloat(formData.price).toFixed(2),
        description: formData.description,
        stock: parseInt(formData.stock),
        imageUrl: imageUrl,
        createdAt: new Date(),
      });
      setPopupMessage("Perfume Added successfully!");
      setShowPopup(true);
      setFormData({ name: "", price: "", description: "", stock: "", image: null });
      setImageName("");
    } catch (error) {
      console.error("Error adding perfume:", error);
      alert("Failed to add perfume.");
    }
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log("Popup visibility changed:", showPopup); // This should log 'true' when the popup is shown
    }, 100);
    return () => clearTimeout(timer);
  }, [showPopup]);


  return (
    <Dialog open={isOpen} handler={onClose} className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
     {showPopup && (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-[6000] flex items-center justify-center">
    <div className="bg-[#222222] text-white p-6 rounded-md shadow-lg max-w-sm w-full text-center">
      <p className="mb-4 text-[#FFD700] text-lg">{popupMessage}</p>
      <div className="flex justify-center">
        <button
          onClick={() => {
            setShowPopup(false); 
            onClose(); 
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          OK
        </button>
      </div>
    </div>
  </div>
)}


      <div className="bg-black border border-[#FFD700] rounded-lg shadow-2xl shadow-yellow-500/50 p-4 max-w-md w-full">
        <DialogHeader className="text-lg font-bold text-[#FFD700]">
          Add New Perfume
        </DialogHeader>

        <DialogBody className="space-y-4 mt-2">
          {/* Perfume Name */}
          <div className="flex flex-col">
            <label className="mb-1 text-[#FFD700] text-sm font-semibold">Perfume Name *</label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter perfume name"
              className="w-full h-10 bg-black text-white border border-[#FFD700] rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#FFD700]"
            />
          </div>

          {/* Brand Selection */}
          <div className="flex flex-col">
            <label className="mb-1 text-[#FFD700] text-sm font-semibold">Brand *</label>
            <select
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
              className="w-full h-10 bg-black text-white border border-[#FFD700] rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#FFD700]"
            >
              <option value="">Select a brand</option>
              <option value="Versace">Versace</option>
              <option value="Dior">Dior</option>
              <option value="Chanel">Chanel</option>
              <option value="Gucci">Gucci</option>
              <option value="Armani">Armani</option>
              <option value="Hugo Boss">Hugo Boss</option>

            </select>
          </div>


          {/* Price */}
          <div className="flex flex-col">
            <label className="mb-1 text-[#FFD700] text-sm font-semibold">Price ($) *</label>
            <input
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              required
              placeholder="Enter price"
              className="w-full h-10 bg-black text-white border border-[#FFD700] rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#FFD700]"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col">
            <label className="mb-1 text-[#FFD700] text-sm font-semibold">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter perfume description"
              className="pt-1 w-full h-16 bg-black text-white border border-[#FFD700] rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#FFD700]"
            />
          </div>

          {/* Stock */}
          <div className="flex flex-col">
            <label className="mb-1 text-[#FFD700] text-sm font-semibold">Stock *</label>
            <input
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleChange}
              required
              placeholder="Enter stock quantity"
              className="w-full h-10 bg-black text-white border border-[#FFD700] rounded-md px-3 text-sm focus:outline-none focus:ring-1 focus:ring-[#FFD700]"
            />
          </div>

          {/* Image Upload */}
          <div className="flex flex-col">
            <label className="mb-1 text-[#FFD700] text-sm font-semibold">Upload Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="text-white p-2 mt-1 cursor-pointer"
              style={{ border: "none", outline: "none" }}
            />
            {uploading && <p className="text-yellow-400 text-sm">Uploading...</p>}
          </div>
        </DialogBody>

        <DialogFooter className="flex justify-between mt-4 border-t border-[#FFD700] pt-2">
          <Button variant="text" className="text-red-400 hover:text-red-600 transition duration-300" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            className="bg-[#FFD700] text-black font-semibold px-4 py-1.5 rounded-md hover:bg-yellow-500 transition duration-300"
            onClick={handleSubmit}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Add Perfume"}
          </Button>
        </DialogFooter>
      </div>


    </Dialog>
  );
};

export default AddPerfumesForm;
