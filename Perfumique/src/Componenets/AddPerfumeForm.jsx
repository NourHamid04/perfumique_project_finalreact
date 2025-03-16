import { useState } from "react";
import { db } from "../firebase"; // Import Firestore
import { collection, addDoc } from "firebase/firestore";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
} from "@material-tailwind/react";

const AddPerfumesForm = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "", // ✅ Added back the description field
    stock: "",
    image: null,
  });

  const [imageName, setImageName] = useState("");

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
      // Save to Firestore
      await addDoc(collection(db, "products"), {
        name: formData.name,
        price: parseFloat(formData.price).toFixed(2),
        description: formData.description, // ✅ Saving the description
        stock: parseInt(formData.stock),
        imageName: imageName, // Store image name for now
        createdAt: new Date(),
      });

      alert("Perfume added successfully!");

      setFormData({ name: "", price: "", description: "", stock: "", image: null });
      setImageName("");
      onClose();
    } catch (error) {
      console.error("Error adding perfume:", error);
      alert("Failed to add perfume.");
    }
  };

  return (
    <Dialog open={isOpen} handler={onClose} className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-80">
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

          {/* ✅ Added back the "Description" field */}
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
            {imageName && <p className="text-gray-300 text-sm mt-1">Uploaded: {imageName}</p>}
          </div>
        </DialogBody>

        <DialogFooter className="flex justify-between mt-4 border-t border-[#FFD700] pt-2">
          <Button variant="text" className="text-red-400 hover:text-red-600 transition duration-300" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="gradient" className="bg-[#FFD700] text-black font-semibold px-4 py-1.5 rounded-md hover:bg-yellow-500 transition duration-300" onClick={handleSubmit}>
            Add Perfume
          </Button>
        </DialogFooter>
      </div>
    </Dialog>
  );
};

export default AddPerfumesForm;
