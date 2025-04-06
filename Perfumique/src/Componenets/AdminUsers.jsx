import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, where, doc, deleteDoc } from "firebase/firestore";

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5;
    const [searchNameQuery, setSearchNameQuery] = useState(""); // State for name search query
    const [searchEmailQuery, setSearchEmailQuery] = useState(""); // State for email search query
    const [searchPhoneQuery, setSearchPhoneQuery] = useState(""); // State for phone search query
    const [selectedUsersForDeletion, setSelectedUsersForDeletion] = useState([]); // State for selected users
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState(null);

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
        const confirmDelete = window.confirm("Are you sure you want to delete this user?");
        if (confirmDelete) {
            try {
                await deleteDoc(doc(db, "users", id));
                alert("User deleted successfully!");
            } catch (error) {
                console.error("Error deleting user:", error);
                alert("Failed to delete user.");
            }
        }
    };

    const handleDeleteSelectedUsers = async () => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete the selected users?"
        );
        if (confirmDelete) {
            try {
                for (const id of selectedUsersForDeletion) {
                    await deleteDoc(doc(db, "users", id));
                }
                alert("Selected users deleted successfully!");
                setSelectedUsersForDeletion([]); // Clear selection
            } catch (error) {
                console.error("Error deleting selected users:", error);
                alert("Failed to delete selected users.");
            }
        }
    };

    const handleCheckboxChange = (id) => {
        if (selectedUsersForDeletion.includes(id)) {
            setSelectedUsersForDeletion(
                selectedUsersForDeletion.filter((userId) => userId !== id)
            );
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

    // Pagination
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;

    // Filter users by name, email, and phone
    const filteredUsers = users.filter((user) =>
        user.name.toLowerCase().includes(searchNameQuery.toLowerCase()) &&
        user.email.toLowerCase().includes(searchEmailQuery.toLowerCase()) &&
        user.phone.toLowerCase().includes(searchPhoneQuery.toLowerCase())
    );

    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

    const nextPage = () => setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
    const prevPage = () => setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));

    return (
        <div className="p-4 relative min-h-screen text-[#FFD700] mt-12">
            <h2 className="text-2xl font-bold mb-4 border-b border-[#FFD700] pb-2 tracking-wide">
                Manage Users
            </h2>

            {/* Search Inputs */}
            <div className="flex gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Search by Name"
                    value={searchNameQuery}
                    onChange={(e) => setSearchNameQuery(e.target.value)}
                    className="w-1/3 p-2 rounded-md border border-[#FFD700] bg-black text-[#FFD700] placeholder-[#FFD700] focus:outline-none focus:ring-2 focus:ring-[#FFD700] transition duration-300 mb-2"
                />
                <input
                    type="text"
                    placeholder="Search by Email"
                    value={searchEmailQuery}
                    onChange={(e) => setSearchEmailQuery(e.target.value)}
                    className="w-1/3 p-2 rounded-md border border-[#FFD700] bg-black text-[#FFD700] placeholder-[#FFD700] focus:outline-none focus:ring-2 focus:ring-[#FFD700] transition duration-300 mb-2 ml-4"
                />
                <input
                    type="text"
                    placeholder="Search by Phone"
                    value={searchPhoneQuery}
                    onChange={(e) => setSearchPhoneQuery(e.target.value)}
                    className="w-1/3 p-2 rounded-md border border-[#FFD700] bg-black text-[#FFD700] placeholder-[#FFD700] focus:outline-none focus:ring-2 focus:ring-[#FFD700] transition duration-300 mb-2 ml-4"
                />
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
                <div className="flex justify-between items-center mt-4">
                    <button
                        onClick={prevPage}
                        className="bg-yellow-500 text-black px-4 py-2 rounded-md shadow-lg hover:bg-yellow-400 hover:shadow-xl transition duration-300"
                        disabled={currentPage === 1}
                    >
                        Prev
                    </button>
                    <button
                        onClick={nextPage}
                        className="bg-yellow-500 text-black px-4 py-2 rounded-md shadow-lg hover:bg-yellow-400 hover:shadow-xl transition duration-300"
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Bottom Right Delete Button */}
            <div className="absolute bottom-14 right-6 flex gap-4">
                <button
                    onClick={handleDeleteSelectedUsers}
                    disabled={selectedUsersForDeletion.length === 0}
                    className="bg-red-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-700 transition duration-300"
                >
                    Delete Selected
                </button>
            </div>
        </div>
    );
};

export default AdminUsers;
