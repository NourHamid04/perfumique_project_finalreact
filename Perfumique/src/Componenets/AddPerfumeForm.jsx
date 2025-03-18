import { useState } from "react";
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
            {imageName && <p className="text-gray-300 text-sm mt-1">Uploaded: {imageName}</p>}
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
