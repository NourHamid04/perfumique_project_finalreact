import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { collection, addDoc } from "firebase/firestore";
import { Mail, Lock, User, Home, Phone, Eye, EyeOff } from "lucide-react";
import { setDoc, doc } from "firebase/firestore"; // Use setDoc
import BackgroundImg from "../assets/website/contact-bg.png"; // Background Image
import { serverTimestamp } from "firebase/firestore";


function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [address, setAddress] = useState("");
    const [phone, setPhone] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                navigate("/"); // Redirect to home if already logged in
            }
        });
        return () => unsubscribe();
    }, [navigate]);

    const handleRegister = async () => {
        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const userId = userCredential.user.uid; // Get the correct Firebase Auth UID
    
            // Store user data in Firestore with the UID as the document ID
            await setDoc(doc(db, "users", userId), {
                name,
                email,
                address,
                phone,
                role: "customer",
                createdAt: serverTimestamp(), 

            });
    
            console.log("User registered with UID:", userId);
            navigate("/");
        } catch (error) {
            console.error("Error registering:", error.message);
        }
    };

    return (
        <div 
            className="relative min-h-screen flex items-center justify-center px-6 sm:px-8"
            style={{
                backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.95), rgba(0, 0, 0, 0.7)), url(${BackgroundImg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed",
            }}
        >
            {/* 🔥 Outer Glass Card with Neon Glow */}
            <div className="relative bg-black/80 backdrop-blur-lg border border-[#FFD700] shadow-2xl shadow-yellow-500/40 px-8 py-8 sm:px-12 sm:py-10 rounded-xl max-w-2xl w-full text-center transition-all duration-300 hover:shadow-yellow-600/50">
                
                {/* 🔥 Gold-Glowing Header */}
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[#FFD700] animate-pulse tracking-wide">Create an Account</h2>
                <p className="text-sm sm:text-md text-gray-300 mt-2">Join us & experience premium fragrances</p>
    
                {/* ✨ Decorative Gold Line */}
                <div className="h-1 w-20 bg-[#FFD700] mx-auto mt-3 rounded-full"></div>
    
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-6">
                    {/* 🔹 Name Input */}
                    <div className="relative">
                        <User className="absolute left-4 top-3 text-[#FFD700]" size={22} />
                        <input
                            type="text"
                            placeholder="Full Name"
                            className="w-full bg-black/60 border border-[#FFD700] text-white pl-12 pr-4 py-3 rounded-md text-sm sm:text-md focus:ring-2 focus:ring-yellow-500 placeholder-gray-400 transition-all duration-300 hover:shadow-yellow-500/30"
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>
    
                    {/* 🔹 Email Input */}
                    <div className="relative">
                        <Mail className="absolute left-4 top-3 text-[#FFD700]" size={22} />
                        <input
                            type="email"
                            placeholder="Email Address"
                            className="w-full bg-black/60 border border-[#FFD700] text-white pl-12 pr-4 py-3 rounded-md text-sm sm:text-md focus:ring-2 focus:ring-yellow-500 placeholder-gray-400 transition-all duration-300 hover:shadow-yellow-500/30"
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
    
                    {/* 🔹 Address Input */}
                    <div className="relative">
                        <Home className="absolute left-4 top-3 text-[#FFD700]" size={22} />
                        <input
                            type="text"
                            placeholder="Home Address"
                            className="w-full bg-black/60 border border-[#FFD700] text-white pl-12 pr-4 py-3 rounded-md text-sm sm:text-md focus:ring-2 focus:ring-yellow-500 placeholder-gray-400 transition-all duration-300 hover:shadow-yellow-500/30"
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>
    
                    {/* 🔹 Phone Number Input */}
                    <div className="relative">
                        <Phone className="absolute left-4 top-3 text-[#FFD700]" size={22} />
                        <input
                            type="tel"
                            placeholder="Phone Number"
                            className="w-full bg-black/60 border border-[#FFD700] text-white pl-12 pr-4 py-3 rounded-md text-sm sm:text-md focus:ring-2 focus:ring-yellow-500 placeholder-gray-400 transition-all duration-300 hover:shadow-yellow-500/30"
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>
    
                    {/* 🔹 Password Input */}
                    <div className="relative">
                        <Lock className="absolute left-4 top-3 text-[#FFD700]" size={22} />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Create Password"
                            className="w-full bg-black/60 border border-[#FFD700] text-white pl-12 pr-10 py-3 rounded-md text-sm sm:text-md focus:ring-2 focus:ring-yellow-500 placeholder-gray-400 transition-all duration-300 hover:shadow-yellow-500/30"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)} 
                            className="absolute right-4 top-3 text-[#FFD700] focus:outline-none"
                        >
                            {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                        </button>
                    </div>
    
                    {/* 🔹 Confirm Password Input */}
                    <div className="relative">
                        <Lock className="absolute left-4 top-3 text-[#FFD700]" size={22} />
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            className="w-full bg-black/60 border border-[#FFD700] text-white pl-12 pr-10 py-3 rounded-md text-sm sm:text-md focus:ring-2 focus:ring-yellow-500 placeholder-gray-400 transition-all duration-300 hover:shadow-yellow-500/30"
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)} 
                            className="absolute right-4 top-3 text-[#FFD700] focus:outline-none"
                        >
                            {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                        </button>
                    </div>
                </div>
    
                {/* 🔥 Ultra Modern Register Button */}
                <button
                    onClick={handleRegister}
                    className="w-full bg-gradient-to-r from-[#FFD700] to-yellow-500 text-black py-3 mt-8 rounded-full font-bold text-md sm:text-lg shadow-lg flex items-center justify-center gap-3 hover:scale-105 transition-transform duration-300 hover:shadow-yellow-500/50"
                >
                    Register
                </button>
    
                {/* ✨ Decorative Gold Line */}
                <div className="h-1 w-20 bg-[#FFD700] mx-auto mt-5 rounded-full"></div>
    
                {/* 🔸 Login Link with Animation */}
                <p className="text-gray-400 mt-5 text-sm sm:text-md">
                    Already have an account?{" "}
                    <Link to="/login" className="text-[#FFD700] font-semibold hover:underline transition-all duration-300 hover:text-yellow-300">
                        <span className="inline-flex items-center gap-1 hover:scale-110 transition-transform">
                            Login
                        </span>
                    </Link>
                </p>
            </div>
        </div>
    );
    
    
    
}

export default Register;
