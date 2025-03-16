import { useState } from "react";
import { Button } from "@material-tailwind/react";
import AddPerfumesForm from "./AddPerfumeForm";

const AdminPerfumes = () => {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(!open);

  return (
    <div className="p-6 relative min-h-screen text-[#FFD700]">
      
      {/* Title */}
      <h2 className="text-3xl font-extrabold mb-6 mt-10 border-b border-[#FFD700] pb-2">
        Manage Perfumes
      </h2>

      {/* Floating Add Product Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          variant="gradient"
          className="bg-[#FFD700] text-black px-6 py-3 font-semibold rounded-md hover:bg-yellow-500 transition duration-300"
          onClick={handleOpen}
        >
          + Add New Perfume
        </Button>
      </div>

      {/* Add Perfume Form Modal */}
      {open && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <AddPerfumesForm isOpen={open} onClose={handleOpen} onAdd={(data) => console.log("New Perfume:", data)} />
        </div>
      )}
      
    </div>
  );
};

export default AdminPerfumes;
