import { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, query, where, doc, deleteDoc } from "firebase/firestore";

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 5;

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


    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

    const totalPages = Math.ceil(users.length / usersPerPage);
    const nextPage = () => setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
    const prevPage = () => setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));

    return (
        <div className="p-4 relative min-h-screen text-[#FFD700] mt-12">


            <h2 className="text-2xl font-bold mb-4 border-b border-[#FFD700] pb-2 tracking-wide">
                Manage Customers
            </h2>

            <div className="mt-6 overflow-x-auto">
                <table className="w-full border-collapse border border-[#FFD700] shadow-md bg-black text-[#FFD700] text-sm">
                    <thead>
                        <tr className="bg-[#FFD700] text-black text-md">
                            <th className="p-2 border border-[#FFD700]">Name</th>
                            <th className="p-2 border border-[#FFD700]">Email</th>
                            <th className="p-2 border border-[#FFD700]">Phone</th>
                            <th className="p-2 border border-[#FFD700]">Address</th>
                            <th className="p-2 border border-[#FFD700]">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.length > 0 ? (
                            currentUsers.map((user, index) => (
                                <tr key={user.id} className={`hover:bg-[#FFD700] hover:text-black transition duration-300 ${index % 2 === 0 ? "bg-[#222222]" : "bg-black"}`}>
                                    <td className="p-2 border border-[#FFD700] text-center">{user.name}</td>
                                    <td className="p-2 border border-[#FFD700] text-center">{user.email}</td>
                                    <td className="p-2 border border-[#FFD700] text-center">{user.phone}</td>
                                    <td className="p-2 border border-[#FFD700] text-center">{user.address}</td>
                                    <td className="p-2 border border-[#FFD700] text-center">
                                        <button
                                            className="bg-red-600 text-white px-2 py-1 rounded-md shadow-md hover:bg-red-800 transition duration-300"
                                            onClick={() => handleDelete(user.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center text-gray-400 p-3">No customers found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 space-x-4">
                    <button
                        onClick={prevPage}
                        className={`px-4 py-2 rounded-md font-semibold text-black transition duration-300 ${currentPage === 1
                                ? "bg-gray-500 cursor-not-allowed text-white"
                                : "bg-[#FFD700] hover:bg-yellow-400 hover:shadow-lg"
                            }`}
                        disabled={currentPage === 1}>
                        Previous
                    </button>

                    <span className="text-[#FFD700] font-semibold text-lg">
                        Page {currentPage} of {totalPages}
                    </span>

                    <button
                        onClick={nextPage}
                        className={`px-4 py-2 rounded-md font-semibold text-black transition duration-300 ${currentPage === totalPages
                                ? "bg-gray-500 cursor-not-allowed text-white"
                                : "bg-[#FFD700] hover:bg-yellow-400 hover:shadow-lg"}`}
                        disabled={currentPage === totalPages}>
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
