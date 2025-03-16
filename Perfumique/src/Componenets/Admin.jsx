import React from "react";
import { Routes, Route } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import AdminDashboard from "./AdminDashboard";
import AdminPerfumes from "./AdminPerfumes";
import AdminUsers from "./AdminUsers";
import Admin_bg from "../assets/website/admin_bg.png"
function Admin() {

  return (
    <div className="flex bg-black text-white min-h-screen">
      
      {/* Sidebar Navigation - Ensure Full Height */}
      <AdminSidebar />

      {/* Content Area - Ensure Proper Scrolling */}
      <div className="ml-64 p-6 w-full min-h-screen overflow-y-auto"  style={{ 
                  backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 1) 10%, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 1) 100%), url(${Admin_bg})`,
                  backgroundSize: "contain" 
                }}>
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="perfumes" element={<AdminPerfumes />} />
          <Route path="users" element={<AdminUsers />} />

        </Routes>
      </div>

    </div>
  );
}

export default Admin;
