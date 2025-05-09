import React, { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Send, Lock } from "lucide-react";
import { auth, db } from "../firebase"; // Import Firebase
import { onAuthStateChanged } from "firebase/auth";
import emailjs from "emailjs-com"; 
import ContactBg from "../assets/website/shop-bg2.png"; // Background Image
import { doc, getDoc } from "firebase/firestore";
function Contact() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  useEffect(() => {
    if (showPopup) {
      const timer = setTimeout(() => setShowPopup(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showPopup]);
  // 🔥 Detect Logged-in User
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef); // ✅ Wait for Firestore to return the user data
  
        if (userSnap.exists()) {
          setUser(userSnap.data()); // ✅ Store user data in state
          setName(userSnap.data().name || "User"); // ✅ Get user’s name or default to "User"
        }
      } else {
        setUser(null);
        setName("User");
      }
    });
  
    return () => unsubscribe();
  }, []);
  


  
  const sendEmail = async (e) => {
    e.preventDefault();
  
    if (!user) {
      setPopupMessage("You must be logged in to send a message.");
      setShowPopup(true);
      return;
    }
  
    if (!message) {
      setPopupMessage("Please enter a message.");
      setShowPopup(true);
      return;
    }
  
    setSending(true);
  
    // Prepare form data
    const nameVal = name;
    const emailVal =  "nourhamid312@gmail.com";
    const messageVal = message;
    try {
      await fetch(
        "https://script.google.com/macros/s/AKfycbxvKcMenVlG4VJB19Fhce5goWz80bptNjEwZxAm08SWq69Od2ciirp6Z_YK9x2shHGHtg/exec",
        {
          method: "POST",
  
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `name=${encodeURIComponent(nameVal)}&email=${encodeURIComponent(emailVal)}&message=${encodeURIComponent(messageVal)}`,
        }
      );
  
      setPopupMessage("Message submitted successfully!");
      setMessage(""); // Clear message input
    } catch (err) {
      console.error(err);
      setPopupMessage("Something went wrong. Please try again.");
    } finally {
      setSending(false);
      setShowPopup(true);
    }
  };
  
  

  return (
    <div 
      className="relative min-h-screen flex items-center justify-center text-white px-6"
      style={{ 
        backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 20%, rgba(0, 0, 0, 0) 20%, rgba(0, 0, 0, 1) 100%), url(${ContactBg})`,
        backgroundSize: "cover", 
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}
    >
      {/* 🔹 Contact Card */}
      <div className="bg-black/70 backdrop-blur-lg border border-[#FFD700] m-20 rounded-lg shadow-2xl shadow-yellow-500/30 p-10 lg:p-16 w-full max-w-4xl text-center">
        
        {/* 🔸 Title */}
        <h1 className="text-4xl lg:text-5xl font-extrabold text-[#FFD700] tracking-wider">
          Get in Touch
        </h1>
        <p className="text-lg text-gray-300 mt-4">
          Have questions? Feel free to reach out to us. Our team is here to assist you.
        </p>

        {/* 🔹 Contact Details */}
        <div className="flex flex-col lg:flex-row justify-around items-center mt-8 space-y-6 lg:space-y-0">
          <div className="flex items-center gap-3">
            <Mail size={24} className="text-[#FFD700]" />
            <p className="text-gray-400">nourhamid312@gmail.com</p>
          </div>
          <div className="flex items-center gap-3">
            <Phone size={24} className="text-[#FFD700]" />
            <p className="text-gray-400">+961 79159184</p>
          </div>
          <div className="flex items-center gap-3">
            <MapPin size={24} className="text-[#FFD700]" />
            <p className="text-gray-400">Saida, Lebanon</p>
          </div>
        </div>

        {/* 🔹 Contact Form */}
        <form className="mt-10 space-y-6" onSubmit={sendEmail}>
          <input 
            type="text" 
            value={name} 
            readOnly 
            className="w-full bg-black/50 border border-[#FFD700] text-white px-4 py-3 rounded-md"
          />
          <input 
            type="email" 
            value={user ? user.email : "Please log in to send messages"} 
            readOnly
            className="w-full bg-black/50 border border-[#FFD700] text-white px-4 py-3 rounded-md"
          />
          <textarea 
            rows="4" 
            placeholder="Your Message" 
            className="w-full bg-black/50 border border-[#FFD700] text-white px-4 py-3 rounded-md"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          ></textarea>

          {/* 🔸 Show Error if Not Logged In */}
          {error && <p className="text-red-500">{error}</p>}

          {/* 🔹 Send Button */}
          <button 
            type="submit" 
            disabled={!user || sending}
            className={`w-full py-3 rounded-md font-semibold shadow-lg flex items-center justify-center gap-2 ${
              user ? "bg-gradient-to-r from-[#FFD700] to-yellow-500 text-black hover:scale-105 hover:shadow-yellow-500/50 transition-transform" : "bg-gray-600 cursor-not-allowed"
            }`}
          >
           {sending ? (
                "Sending..."
              ) : user ? (
                <>
                  <Send size={20} /> Send Message
                </>
              ) : (
                "Please log in to send messages"
              )}

          </button>
        </form>

        {/* 🔹 Embedded Map */}
        <div className="mt-12 border border-[#FFD700] rounded-md overflow-hidden">
          <iframe
            className="w-full h-64"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d26364.575773981465!2d35.36712870541991!3d33.56136315546819!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151ef27bb67e3f55%3A0x946dfbb79ad5e4f2!2sSidon!5e0!3m2!1sen!2slb!4v1710000000000!5m2!1sen!2slb"
            allowFullScreen=""
            loading="lazy"
          ></iframe>
        </div>
      </div>
      {showPopup && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-black/90 border border-[#FFD700]/20 rounded-xl p-6 max-w-md w-full mx-4 shadow-xl animate-fade-in">
            <p className="text-center text-lg text-[#FFD700] mb-4">
              {popupMessage}
            </p>
            <button
              onClick={() => setShowPopup(false)}
              className="w-full py-2 bg-[#FFD700]/90 hover:bg-[#FFD700] text-black font-semibold rounded-lg transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Contact;
