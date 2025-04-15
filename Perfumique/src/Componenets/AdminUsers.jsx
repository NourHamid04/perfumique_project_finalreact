import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, where, doc, deleteDoc } from "firebase/firestore";
import AdminEditUser from "./AdminEditUser";

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5;
    const [searchQuery, setSearchQuery] = useState(""); // Combined name/email search
    const [searchPhoneQuery, setSearchPhoneQuery] = useState("");
    const [selectedUsersForDeletion, setSelectedUsersForDeletion] = useState([]);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [sortOrder, setSortOrder] = useState("asc");

    const [showPopup, setShowPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [deleteUserId, setDeleteUserId] = useState(null);

    const [deleteConfirmed, setDeleteConfirmed] = useState(false);

    useEffect(() => {
        const q = query(collection(db, "users"), where("role", "==", "customer"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const userList = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setUsers(userList);
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = async (id) => {
        setDeleteUserId(id);

        setPopupMessage("Are you sure you want to delete this user?");
        setShowPopup(true);
    };
    const closePopup = () => {
        setShowPopup(false);
        setDeleteConfirmed(false);
    };

    const handleDeleteSelectedUsers = async () => {
        setPopupMessage("Are you sure you want to delete the selected users?");
        setShowPopup(true);
    };

    const confirmDelete = async () => {
        try {
            console.log("Selected Users: ", selectedUsersForDeletion);

            if (deleteUserId) {
                await deleteDoc(doc(db, "users", deleteUserId));
                setPopupMessage("User deleted successfully!");
                setDeleteConfirmed(true);
            } else {
                for (const id of selectedUsersForDeletion) {
                    await deleteDoc(doc(db, "users", id));
                }
                setPopupMessage("Selected users deleted successfully!");
                setSelectedUsersForDeletion([]);
            }
            
            setDeleteConfirmed(true);

        } catch (error) {
            setPopupMessage("Failed to delete user(s).");
            console.error("Error deleting user:", error);
        }
        setShowPopup(true);
    };

    const cancelDelete = () => {
        setShowPopup(false);
        setDeleteUserId(null);
    };

    const handleCheckboxChange = (id) => {
        if (selectedUsersForDeletion.includes(id)) {
            setSelectedUsersForDeletion(selectedUsersForDeletion.filter((userId) => userId !== id));
        } else {
            setSelectedUsersForDeletion([...selectedUsersForDeletion, id]);
        }
    };

    const handleEditModal = (id) => {
        setSelectedUserId(id);
        setIsEditModalOpen(true);
    };


    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setSelectedUserId(null);
    };

    // Sort users
    const sortUsers = (usersList) => {
        return usersList.sort((a, b) => {
            if (sortOrder === "asc") {
                return a.name.localeCompare(b.name);
            } else {
                return b.name.localeCompare(a.name);
            }
        });
    };

    // Pagination
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;

    // Filter users
    const filteredUsers = users.filter((user) =>
        (user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
        user.phone.toLowerCase().includes(searchPhoneQuery.toLowerCase())
    );

    // Sort filtered users
    const sortedUsers = sortUsers(filteredUsers);

    const currentUsers = sortedUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(sortedUsers.length / usersPerPage);

    const nextPage = () => setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
    const prevPage = () => setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));

    return (
        <div className="p-4 relative min-h-screen text-[#FFD700]">
            <h2 className="text-2xl font-bold mb-4 border-b border-[#FFD700] pb-2 tracking-wide">
                Manage Users
            </h2>

            {/* Search Inputs */}
            <div className="flex gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search by Name or Email"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-1/2 p-2 rounded-md border border-[#FFD700] bg-black text-[#FFD700] placeholder-[#FFD700] focus:outline-none focus:ring-2 focus:ring-[#FFD700] transition duration-300 mb-2"
                />
                <input
                    type="text"
                    placeholder="Search by Phone"
                    value={searchPhoneQuery}
                    onChange={(e) => setSearchPhoneQuery(e.target.value)}
                    className="w-1/2 p-2 rounded-md border border-[#FFD700] bg-black text-[#FFD700] placeholder-[#FFD700] focus:outline-none focus:ring-2 focus:ring-[#FFD700] transition duration-300 mb-2"
                />
                {/* Sort by Name Input */}
                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="p-2 rounded-md border border-[#FFD700] bg-black text-[#FFD700] focus:outline-none focus:ring-2 focus:ring-[#FFD700] transition duration-300 mb-2"
                >
                    <option value="" selected>Sort by Name</option>
                    <option value="asc">A - Z</option>
                    <option value="desc">Z - A</option>
                </select>
            </div>

            {/* User Table */}
            <div className="mt-6 overflow-x-auto">
                <table className="w-full border-collapse border border-[#FFD700] shadow-md bg-black text-[#FFD700] text-sm">
                    <thead>
                        <tr className="bg-[#FFD700] text-black text-md">
                            <th className="p-2 border border-[#FFD700]">Select</th>
                            <th className="p-2 border border-[#FFD700]">Name</th>
                            <th className="p-2 border border-[#FFD700]">Email</th>
                            <th className="p-2 border border-[#FFD700]">Phone</th>
                            <th className="p-2 border border-[#FFD700]">Role</th>
                            <th className="p-2 border border-[#FFD700]">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.length > 0 ? (
                            currentUsers.map((user, index) => (
                                <tr
                                    key={user.id}
                                    className={`hover:bg-[#FFD700] hover:text-black transition duration-300 ${index % 2 === 0 ? "bg-[#222222]" : "bg-black"} ${selectedUsersForDeletion.includes(user.id) ? "bg-[none]" : ""}`}
                                >
                                    <td className="p-2 border border-[#FFD700] text-center w-10">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsersForDeletion.includes(user.id)}
                                            onChange={() => handleCheckboxChange(user.id)}
                                            className="w-4 h-4"
                                        />
                                    </td>
                                    <td className="p-2 border border-[#FFD700] text-center">{user.name}</td>
                                    <td className="p-2 border border-[#FFD700] text-center">{user.email}</td>
                                    <td className="p-2 border border-[#FFD700] text-center">{user.phone}</td>
                                    <td className="p-2 border border-[#FFD700] text-center">{user.role}</td>
                                    <td className="p-2 border border-[#FFD700] text-center flex gap-2 justify-center">
                                        <button
                                            className="bg-blue-500 text-white px-2 py-1 rounded-md shadow-md hover:bg-blue-700 transition duration-300"
                                            onClick={() => handleEditModal(user.id)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="bg-red-500 text-white px-2 py-1 rounded-md shadow-md hover:bg-red-700 transition duration-300"
                                            onClick={() => handleDelete(user.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center p-4 text-[#FFD700]">
                                    No users found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {filteredUsers.length > usersPerPage && (
                <div className="flex items-center gap-4 mt-4 justify-center">
                    <button
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-md shadow-lg transition duration-300 ${currentPage === 1
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-yellow-500 text-black hover:bg-yellow-400 hover:shadow-xl"
                            }`}
                    >
                        Prev
                    </button>

                    <span className="text-[#FFD700] font-medium">
                        Page {currentPage} of {totalPages}
                    </span>

                    <button
                        onClick={nextPage}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded-md shadow-lg transition duration-300 ${currentPage === totalPages
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-yellow-500 text-black hover:bg-yellow-400 hover:shadow-xl"
                            }`}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Bottom Right Delete Button */}
            <div className="absolute bottom-8 right-3 flex gap-4">
                <button
                    onClick={handleDeleteSelectedUsers}
                    disabled={selectedUsersForDeletion.length === 0}
                    className={`px-4 py-2 rounded-md shadow-md transition duration-300 ${selectedUsersForDeletion.length === 0
                        ? "bg-gray-500 cursor-not-allowed"
                        : "bg-red-500 hover:bg-red-700 text-white"
                        }`}
                >
                    Delete Selected
                </button>
            </div>

            {/* Custom Popup for Confirmations */}
            {showPopup && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-[#222222] p-6 rounded-md shadow-lg text-center w-96">
            <h3 className="text-xl text-[#FFD700] mb-4">
                {deleteConfirmed
                    ? "User deleted successfully."
                    : "Are you sure you want to delete this user?"}
            </h3>
            <div className="flex justify-around">
                {deleteConfirmed ? (
                    <button
                        onClick={closePopup}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                    >
                        Close
                    </button>
                ) : (
                    <>
                        <button
                            onClick={confirmDelete}
                            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                        >
                            Yes
                        </button>
                        <button
                            onClick={cancelDelete}
                            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                        >
                            No
                        </button>
                    </>
                )}
            </div>
        </div>
    </div>
)}




            {isEditModalOpen && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <AdminEditUser
                        userId={selectedUserId} // Pass the selectedUserId for editing the user
                        closeModal={closeEditModal}
                    />
                </div>
            )}


        </div>
    );
};

export default AdminUsers;
