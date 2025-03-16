import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { ShoppingCart, Users, Package, DollarSign } from "lucide-react";

const AdminDashboard = () => {
  const [totalPerfumes, setTotalPerfumes] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    // Get total perfumes
    const unsubscribePerfumes = onSnapshot(collection(db, "products"), (snapshot) => {
      setTotalPerfumes(snapshot.size);
    });

    // Get total customers
    const unsubscribeUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      setTotalUsers(snapshot.size);
    });

    return () => {
      unsubscribePerfumes();
      unsubscribeUsers();
    };
  }, []);

  return (
    <div className="p-6 relative min-h-screen text-[#FFD700] mt-12">
      <h2 className="text-3xl font-bold mb-6 border-b border-[#FFD700] pb-2 tracking-wide">
        Admin Dashboard
      </h2>

      {/* Statistics Cards Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Perfumes */}
        <div className="bg-black border border-[#FFD700] rounded-lg shadow-lg p-6 flex items-center space-x-4">
          <Package size={40} className="text-[#FFD700]" />
          <div>
            <h3 className="text-lg font-semibold">Total Perfumes</h3>
            <p className="text-2xl font-bold">{totalPerfumes}</p>
          </div>
        </div>

        {/* Total Users */}
        <div className="bg-black border border-[#FFD700] rounded-lg shadow-lg p-6 flex items-center space-x-4">
          <Users size={40} className="text-[#FFD700]" />
          <div>
            <h3 className="text-lg font-semibold">Total Customers</h3>
            <p className="text-2xl font-bold">{totalUsers}</p>
          </div>
        </div>

        {/* Static Orders */}
        <div className="bg-black border border-[#FFD700] rounded-lg shadow-lg p-6 flex items-center space-x-4">
          <ShoppingCart size={40} className="text-[#FFD700]" />
          <div>
            <h3 className="text-lg font-semibold">Total Orders</h3>
            <p className="text-2xl font-bold">12</p> {/* Static for now */}
          </div>
        </div>

        {/* Static Revenue */}
        <div className="bg-black border border-[#FFD700] rounded-lg shadow-lg p-6 flex items-center space-x-4">
          <DollarSign size={40} className="text-[#FFD700]" />
          <div>
            <h3 className="text-lg font-semibold">Total Revenue</h3>
            <p className="text-2xl font-bold">$3,200</p> {/* Static for now */}
          </div>
        </div>
      </div>

      {/* Static Recent Activities */}
      <div className="mt-8">
        <h3 className="text-2xl font-semibold mb-4 border-b border-[#FFD700] pb-2">Recent Activities</h3>
        <ul className="bg-black border border-[#FFD700] rounded-lg p-4 shadow-lg space-y-3 text-sm">
          <li className="flex justify-between">
            <span>🛒 New order placed - Order #1023</span>
            <span className="text-gray-400">2h ago</span>
          </li>
          <li className="flex justify-between">
            <span>🛍️ 5 perfumes added</span>
            <span className="text-gray-400">4h ago</span>
          </li>
          <li className="flex justify-between">
            <span>👤 New customer registered</span>
            <span className="text-gray-400">6h ago</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
