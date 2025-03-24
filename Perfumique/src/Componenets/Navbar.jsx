import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { Menu, User, ShoppingBag, LogOut, LogIn, Home, Info, Phone, ShoppingCart } from "lucide-react";

function Navbar() {
    const [cartCount, setCartCount] = useState(0);
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();

    // ✅ Fetch Authenticated User
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                await fetchUserRole(currentUser.uid);
                fetchCartCount(currentUser.uid); // Fetch cart count for this user
            } else {
                setUser(null);
                setRole(null);
                setCartCount(0); // Reset cart count when logged out
            }
        });

        return () => unsubscribe();
    }, []);

    // ✅ Fetch User Role
    const fetchUserRole = async (userId) => {
        try {
            const userRef = doc(db, "users", userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                setRole(userSnap.data().role);
            } else {
                console.log("No role found, defaulting to customer.");
                setRole("customer");
            }
        } catch (error) {
            console.error("Error fetching user role:", error.message);
        }
    };

    // ✅ Fetch Cart Count for Logged-in User
    const fetchCartCount = (userId) => {
        if (!userId) return;
        const cartRef = query(collection(db, "cart_items"), where("userId", "==", userId));

        const unsubscribe = onSnapshot(cartRef, (snapshot) => {
            let totalItems = 0;
            snapshot.docs.forEach(doc => {
                totalItems += doc.data().quantity; // Sum up all item quantities
            });
            setCartCount(totalItems);
        });

        return () => unsubscribe(); // Cleanup listener
    };

    // ✅ Handle Logout
    const handleLogout = async () => {
        try {
            await signOut(auth);
            setUser(null);
            setRole(null);
            setCartCount(0); // Reset cart count on logout
            navigate("/");
        } catch (error) {
            console.error("Error logging out:", error.message);
        }
    };

    return (
        <nav className="fixed top-0 w-full bg-black/30 text-white backdrop-blur-lg py-4 px-6 flex justify-between items-center shadow-lg z-50">
            {/* Logo */}
            <div className="text-2xl font-bold tracking-wide flex items-center gap-2">
                <ShoppingBag className="w-7 h-7 text-[#FFD700]" />
                Perfumiqe
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex space-x-6 items-center">
                <Link to="/" className="flex items-center gap-2 hover:text-yellow-400 transition duration-300">
                    <Home size={20} /> Home
                </Link>
                <Link to="/about" className="flex items-center gap-2 hover:text-yellow-400 transition duration-300">
                    <Info size={20} /> About
                </Link>
                <Link to="/shop" className="flex items-center gap-2 hover:text-yellow-400 transition duration-300">
                    <ShoppingBag size={20} /> Shop
                </Link>
                <Link to="/contact" className="flex items-center gap-2 hover:text-yellow-400 transition duration-300">
                    <Phone size={20} /> Contact
                </Link>

                {/* ✅ Cart Link with Counter */}
                {user && (
                    <Link to="/cart" className="relative flex items-center gap-2 hover:text-yellow-400 transition duration-300">
                        <ShoppingCart size={24} />
                        {cartCount > 0 && (
                            <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                )}

                {user ? (
                    <div className="flex items-center gap-4">
                        {/* User Icon Clicks to Admin Dashboard if Admin */}
                        <button
                                onClick={() => {
                                    if (role === "admin") {
                                        navigate("/admin"); // Navigate to admin dashboard
                                    } else {
                                        navigate("/userprofile"); // Navigate to user profile for regular users
                                    }
                                }}
                                className="flex items-center gap-2 text-yellow-400 font-semibold cursor-pointer"
                            >
                                <User size={20} />
                                {user.email}
                            </button>


                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-red-400 hover:text-red-600 transition duration-300"
                        >
                            <LogOut size={20} /> Logout
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="flex items-center gap-2 hover:text-yellow-400 transition duration-300">
                            <LogIn size={20} /> Login
                        </Link>
                    </div>
                )}
            </div>

            {/* Mobile Menu Button */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden text-[#FFD700]">
                <Menu size={28} />
            </button>

            {/* Mobile Menu Dropdown */}
            {menuOpen && (
                <div className="absolute top-16 right-6 bg-black text-[#FFD700] rounded-lg shadow-lg py-4 px-6 flex flex-col space-y-4 md:hidden border border-[#FFD700]">
                    <Link to="/" className="flex items-center gap-2 hover:text-yellow-400 transition duration-300">
                        <Home size={20} /> Home
                    </Link>
                    <Link to="/about" className="flex items-center gap-2 hover:text-yellow-400 transition duration-300">
                        <Info size={20} /> About
                    </Link>
                    <Link to="/shop" className="flex items-center gap-2 hover:text-yellow-400 transition duration-300">
                        <ShoppingBag size={20} /> Shop
                    </Link>
                    <Link to="/contact" className="flex items-center gap-2 hover:text-yellow-400 transition duration-300">
                        <Phone size={20} /> Contact
                    </Link>

                    {user && (
                        <Link to="/cart" className="relative flex items-center gap-2 hover:text-yellow-400 transition duration-300">
                            <ShoppingCart size={20} />
                            {cartCount > 0 && (
                                <span className="absolute -top-2 -right-3 bg-red-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    )}

                    {user ? (
                        <>
                           
                                
                                <Link
                                    to="/userprofile"
                                    className="flex items-center gap-2 text-yellow-400 font-semibold cursor-pointer"
                                >
                                    <User size={20} />
                                    {user.email}
                                </Link>
                                
                            


                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-red-400 hover:text-red-600 transition duration-300"
                            >
                                <LogOut size={20} /> Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/register" className="flex items-center gap-2 hover:text-yellow-400 transition duration-300">
                                <LogIn size={20} /> Register
                            </Link>
                            <Link to="/login" className="flex items-center gap-2 hover:text-yellow-400 transition duration-300">
                                <LogIn size={20} /> Login
                            </Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}

export default Navbar;
