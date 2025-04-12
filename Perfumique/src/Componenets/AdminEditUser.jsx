import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase"; // Ensure this is imported from your firebase config

const AdminEditUser = ({ userId, closeModal }) => {
  const [userData, setUserData] = useState({
    email: "",
    name: "",
    phone: "",
    address: "",
    role: "", // Example: admin, user, etc.
  });

  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  useEffect(() => {
    // Fetch the user data when the modal is opened
    const fetchUserData = async () => {
      const userRef = doc(db, "users", userId); // Adjust "users" collection path accordingly
      const docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      } else {
        console.log("No such document!");
      }
    };

    fetchUserData();
  }, [userId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData({
      ...userData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userRef = doc(db, "users", userId); // Adjust "users" collection path accordingly
    try {
      await updateDoc(userRef, userData); // Update user data
      setPopupMessage("User edited successfully!");
      setShowPopup(true);
    } catch (error) {
      console.error("Error updating user: ", error);
      alert("Failed to update user.");
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
                  closeModal(); // Close modal when clicking OK
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
        <h3 className="text-lg font-bold text-[#FFD700] mb-4">Edit User</h3>
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
              value={userData.name}
              onChange={handleInputChange}
              className="w-full mt-2 p-2 rounded-md border border-[#FFD700] bg-black text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-[#FFD700]">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={userData.email}
              onChange={handleInputChange}
              className="w-full mt-2 p-2 rounded-md border border-[#FFD700] bg-black text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
            />
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label htmlFor="phone" className="block text-sm font-medium text-[#FFD700]">
              Phone
            </label>
            <input
              type="text"
              id="phone"
              name="phone"
              value={userData.phone}
              onChange={handleInputChange}
              className="w-full mt-2 p-2 rounded-md border border-[#FFD700] bg-black text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
            />
          </div>

          {/* Address */}
          <div className="mb-4">
            <label htmlFor="address" className="block text-sm font-medium text-[#FFD700]">
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={userData.address}
              onChange={handleInputChange}
              className="w-full mt-2 p-2 rounded-md border border-[#FFD700] bg-black text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
            />
          </div>

          {/* Role */}
          <div className="mb-4">
            <label htmlFor="role" className="block text-sm font-medium text-[#FFD700]">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={userData.role}
              onChange={handleInputChange}
              className="w-full mt-2 p-2 rounded-md border border-[#FFD700] bg-black text-white focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
            >
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>

          <div className="flex justify-between gap-4 mt-6">
            <button
              type="button"
              className="bg-red-500 text-white px-4 py-2 rounded-md"
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#FFD700] text-black px-4 py-2 rounded-md"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminEditUser;
