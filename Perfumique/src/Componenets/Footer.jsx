import React from "react";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";
import footer from './../assets/website/footer-pattern.jpg';
const Footer = () => {
  return (
    <footer className="relative bg-black text-[#FFD700] py-16 px-8 w-full mt-auto">
      {/* Background Gold Texture Overlay */}
      <div
        className="absolute inset-0 opacity-20"
       style={{ 
               backgroundImage: `url(${footer})`, 
               backgroundSize: "cover", 
               backgroundPosition: "center",
               backgroundAttachment: "fixed"
             }}
      ></div>

      {/* Footer Content */}
      <div className="relative z-10 container mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Brand Info */}
        <div className="space-y-4 text-center md:text-left">
          <h2 className="text-3xl font-extrabold tracking-wide">Perfumiqe</h2>
          <p className="text-gray-400">
            Discover the finest luxury fragrances crafted for those who appreciate elegance and sophistication.
          </p>
        </div>

        {/* Quick Links */}
        <div className="text-center md:text-left">
          <h3 className="text-xl font-semibold">Quick Links</h3>
          <ul className="mt-4 space-y-2">
            <li><a href="/" className="hover:text-yellow-400 transition">Home</a></li>
            <li><a href="/shop" className="hover:text-yellow-400 transition">Shop</a></li>
            <li><a href="/about" className="hover:text-yellow-400 transition">About Us</a></li>
            <li><a href="/contact" className="hover:text-yellow-400 transition">Contact</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="text-center md:text-left">
          <h3 className="text-xl font-semibold">Contact</h3>
          <ul className="mt-4 space-y-2">
            <li className="flex justify-center md:justify-start items-center gap-2">
              <Mail size={18} className="text-yellow-400" /> info@perfumiqe.com
            </li>
            <li className="flex justify-center md:justify-start items-center gap-2">
              <Phone size={18} className="text-yellow-400" /> +961 79159184
            </li>
            <li className="flex justify-center md:justify-start items-center gap-2">
              <MapPin size={18} className="text-yellow-400" /> saida, Lebanon
            </li>
          </ul>
        </div>
      </div>

      {/* Social Media */}
      <div className="relative z-10 mt-12 flex justify-center space-x-6">
        <a href="#" className="text-yellow-400 hover:text-white transition"><Facebook size={22} /></a>
        <a href="#" className="text-yellow-400 hover:text-white transition"><Instagram size={22} /></a>
        <a href="#" className="text-yellow-400 hover:text-white transition"><Twitter size={22} /></a>
      </div>

      {/* Bottom Section */}
      <div className="relative z-10 mt-10 border-t border-[#FFD700] pt-6 text-center text-gray-400 text-sm">
        © {new Date().getFullYear()} Perfumiqe. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;