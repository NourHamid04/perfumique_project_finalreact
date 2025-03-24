import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { Button } from "@material-tailwind/react";
import { User } from "lucide-react";
import ContactBg from "../assets/website/contact-bg.png"; // Background Image

const UserProfile = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const navigate = useNavigate();

  // Fetch current user data
  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login"); // Redirect to login if not logged in
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserData(userSnap.data());
      }
      setLoading(false);
    };
    fetchUserData();
  }, [navigate]);

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle profile update
  const handleUpdate = async () => {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        name: userData.name,
        email: userData.email,
        address: userData.address,
        phone: userData.phone,
      });
      setEditing(false);
    }
  };

  if (loading) {
    return <div className="text-center text-[#FFD700]">Loading...</div>;
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center text-[#FFD700] p-8 pt-32"
      style={{
        backgroundImage: `url(${ContactBg})`,
      }}
    >
      <div className="max-w-4xl mx-auto bg-black/60 border border-[#FFD700] rounded-xl p-8 shadow-lg backdrop-blur-md">
        <h1 className="text-4xl font-bold text-center mb-6">User Profile</h1>

        <div className="mt-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-semibold">Personal Information</h2>
            <Button
              variant="gradient"
              className="bg-[#FFD700] text-black font-semibold"
              onClick={() => setEditing(!editing)}
            >
              {editing ? "Cancel" : "Edit"}
            </Button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-lg">Name</label>
              <input
                type="text"
                name="name"
                value={userData.name}
                onChange={handleChange}
                disabled={!editing}
                className="w-full bg-black/60 border border-[#FFD700] text-white py-3 px-4 rounded-md focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            <div>
              <label className="block text-lg">Email</label>
              <input
                type="email"
                name="email"
                value={userData.email}
                disabled
                className="w-full bg-black/60 border border-[#FFD700] text-white py-3 px-4 rounded-md focus:ring-2 focus:ring-yellow-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-lg">Address</label>
              <input
                type="text"
                name="address"
                value={userData.address}
                onChange={handleChange}
                disabled={!editing}
                className="w-full bg-black/60 border border-[#FFD700] text-white py-3 px-4 rounded-md focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            <div>
              <label className="block text-lg">Phone</label>
              <input
                type="tel"
                name="phone"
                value={userData.phone}
                onChange={handleChange}
                disabled={!editing}
                className="w-full bg-black/60 border border-[#FFD700] text-white py-3 px-4 rounded-md focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            {editing && (
              <Button
                variant="gradient"
                className="mt-6 bg-[#FFD700] text-black font-semibold"
                onClick={handleUpdate}
              >
                Save Changes
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
