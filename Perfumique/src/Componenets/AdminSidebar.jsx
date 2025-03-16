import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, LogOut } from "lucide-react";
import { auth } from "../firebase"; 
import { signOut } from "firebase/auth";
import sidebar_admin from "../assets/website/sidebar_admin.png"

function AdminSidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login"); // Redirect to login after logout
    } catch (error) {
      console.error("Logout Error:", error.message);
    }
  };

  return (
    <div className="h-screen w-64 bg-black text-[#FFD700] fixed top-0 left-0 shadow-2xl border-r border-[#FFD700] flex flex-col" style={{ 
                      backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 1) 20%, rgba(0, 0, 0, 0) 40%, rgba(0, 0, 0, 0) 0%, rgb(232, 206, 140) 100%), url(${sidebar_admin})`,
                      backgroundSize: "contain" 
                    }}>
      
      {/* Logo / Branding */}
      <div className="text-3xl font-bold text-center py-6 border-b border-[#FFD700] tracking-widest">
        Admin Panel
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-4">
        
        <NavLink 
          to="/admin/" 
          end
          className={({ isActive }) => 
            `flex items-center gap-3 p-3 rounded-md transition duration-300 ${
              isActive ? "bg-[#FFD700] text-black" : "hover:bg-[#FFD700] hover:text-black"
            }`
          }
        >
          <LayoutDashboard size={20} /> Dashboard
        </NavLink>

        <NavLink 
          to="/admin/perfumes" 
          className={({ isActive }) => 
            `flex items-center gap-3 p-3 rounded-md transition duration-300 ${
              isActive ? "bg-[#FFD700] text-black" : "hover:bg-[#FFD700] hover:text-black"
            }`
          }
        >
          <Package size={20} /> Perfumes
        </NavLink>

      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-[#FFD700]">
        <button 
          onClick={handleLogout} 
          className="flex items-center gap-3 p-3 w-full bg-[#FFD700] text-black rounded-md font-semibold hover:bg-yellow-400 transition duration-300"
        >
          <LogOut size={20} /> Logout
        </button>
      </div>

    </div>
  );
}

export default AdminSidebar;
