import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { Mail, Lock, Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import BackgroundImg from "../assets/website/contact-bg.png"; // Background Image

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                await (user.uid);
            }fetchUserRole
        });
        return () => unsubscribe();
    }, []);

    const fetchUserRole = async (userId) => {
        try {
            const userRef = doc(db, "users", userId);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                const role = userSnap.data().role;
                navigate(role === "admin" ? "/admin" : "/");
            } else {
                navigate("/");
            }
        } catch (error) {
            console.error("Error fetching user role:", error.message);
        }
    };

    const handleLogin = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            await fetchUserRole(userCredential.user.uid);
        } catch (error) {
            setError("Invalid email or password. Please try again.");
        }
    };

    return (
        <div 
            className="relative min-h-screen flex items-center justify-center px-8"
            style={{
                backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.7)), url(${BackgroundImg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed",
            }}
        >
            <div className="bg-black/85 backdrop-blur-lg border border-[#FFD700] shadow-2xl shadow-yellow-500/30 p-14 rounded-lg max-w-lg w-full text-center">
                
                {/* 🔸 Animated Header */}
                <h2 className="text-5xl font-extrabold text-[#FFD700] animate-pulse">Welcome Back</h2>
                <p className="text-lg text-gray-300 mt-2">Sign in to access your exclusive perfume collection</p>

                {/* 🔹 Email Input */}
                <div className="relative mt-8">
                    <Mail className="absolute left-4 top-4 text-[#FFD700]" size={24} />
                    <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full bg-black/60 border border-[#FFD700] text-white pl-14 pr-4 py-4 rounded-md text-lg focus:ring-2 focus:ring-yellow-500 placeholder-gray-400"
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                {/* 🔹 Password Input */}
                <div className="relative mt-6">
                    <Lock className="absolute left-4 top-4 text-[#FFD700]" size={24} />
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="w-full bg-black/60 border border-[#FFD700] text-white pl-14 pr-12 py-4 rounded-md text-lg focus:ring-2 focus:ring-yellow-500 placeholder-gray-400"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-4 top-4 text-[#FFD700] focus:outline-none"
                    >
                        {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                    </button>
                </div>

                {/* 🔸 Forgot Password */}
                <div className="text-right mt-2">
                    <Link to="/forgot-password" className="text-[#FFD700] text-sm hover:underline">
                        Forgot password?
                    </Link>
                </div>

                {/* 🔸 Error Message */}
                {error && <p className="text-red-500 text-sm mt-3">{error}</p>}

                {/* 🔹 Login Button */}
                <button
                    onClick={handleLogin}
                    className="w-full bg-gradient-to-r from-[#FFD700] to-yellow-500 text-black py-4 mt-8 rounded-md font-bold text-lg shadow-md flex items-center justify-center gap-3 hover:scale-105 transition-transform duration-200"
                >
                    <LogIn size={24} /> Login
                </button>

                {/* 🔸 Register Link */}
                <p className="text-gray-400 mt-6 text-lg">
                    Don't have an account?{" "}
                    <Link to="/register" className="text-[#FFD700] font-semibold hover:underline">
                        <span className="inline-flex items-center gap-1">
                            Register <UserPlus size={20} />
                        </span>
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;
