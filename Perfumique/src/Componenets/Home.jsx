import React, { useState } from "react";
import BannerImg from "./../assets/website/front-view-bottle-perfume-black-glass-bottle.jpg";
import Perfume1 from "./../assets/perfumes/perfume1.jpg";
import Perfume2 from "./../assets/perfumes/perfume2.jpg";
import Perfume3 from "./../assets/perfumes/perfume3.jpg";
import Perfume4 from "./../assets/perfumes/perfume4.jpg";
import Perfume5 from "./../assets/perfumes/perfume5.jpg";
import { FaStar, FaShippingFast, FaQuoteLeft } from "react-icons/fa";
import { GrShieldSecurity } from "react-icons/gr";
import { MdPayment, MdLocalOffer } from "react-icons/md";
import { IoCloseOutline } from "react-icons/io5";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import Header from "../assets/Hero/Header.jpg"


const Home = () => {
  const [orderPopup, setOrderPopup] = useState(false);
  const handleOrderPopup = () => setOrderPopup(true);

  return (
    <div 
  className="overflow-y-auto"
  style={{ 
    backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0) 10%, rgba(0, 0, 0, 1)), url(${Header})`,

    backgroundPosition: "center", 
    backgroundSize: "contain" 
  }}
  
>

      {/* Hero Section */}
      <div 
            className="relative min-h-screen bg-cover bg-center text-white flex items-center justify-center"
           

            >
            <div className="absolute inset-0  "></div>
            
            <div className="relative z-10 text-center">
                <h1 className="text-5xl pt-32 mt-32 font-bold text-[#FFD700]">Discover Luxury Fragrances</h1>
                <p className="text-lg text-gray-300 max-w-xl mx-auto mt-4">
                Indulge in scents that define elegance and sophistication.
                </p>
                <button className="mt-6 bg-[#FFD700] text-black py-3 px-6 rounded-full font-semibold shadow-lg hover:scale-105 transition-transform">
                Shop Now
                </button>
            </div>
</div>


      {/* Top Products */}
    

      <div className=" py-16 container grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {[Perfume1, Perfume2, Perfume3].map((img, index) => (
          <div key={index} className="border border-[#FFD700] rounded-lg shadow-2xl shadow-yellow-100/20 p-6 rounded-xl shadow-lg hover:scale-105 transition">
            <img
              src={img}
              alt={`Perfume ${index + 1}`}
              className="h-[250px] w-full object-cover mx-auto rounded-md border border-[#FFD700]"
            />
            <h3 className="text-xl font-semibold text-[#FFD700] mt-4">Perfume {index + 1}</h3>
            <div className="flex justify-center mt-2">
              {[...Array(3)].map((_, i) => (
                <FaStar key={i} className="text-yellow-400" />
              ))}
            </div>
            <button className="mt-4 bg-[#FFD700] text-black py-2 px-6 rounded-full font-semibold hover:scale-105 transition-transform">
              Order Now
            </button>
          </div>
        ))}
      </div>
    
    

      {/* Testimonials Section */}
      <div className="py-10 bg-black text-white">
        <div className="container text-center">
          <h2 className="text-3xl font-bold text-[#FFD700] mb-6">What Our Customers Say</h2>
          <Slider dots infinite speed={500} autoplay autoplaySpeed={3000} slidesToShow={1} slidesToScroll={1}>
            {[
              { id: 1, name: "Victor", text: "Best perfume ever!" },
              { id: 2, name: "Emily", text: "Amazing fragrance!" },
              { id: 3, name: "Daniel", text: "Fast delivery!" },
            ].map((testimonial) => (
              <div key={testimonial.id} className="p-6 bg-black/90 border border-[#FFD700] rounded-md">
                <FaQuoteLeft className="text-4xl text-[#FFD700] mx-auto mb-3" />
                <p className="text-lg text-gray-300">{testimonial.text}</p>
                <h3 className="text-xl font-semibold text-[#FFD700] mt-4">- {testimonial.name}</h3>
              </div>
            ))}
          </Slider>
        </div>
      </div>

      {/* Order Popup */}
      {orderPopup && (
        <div className="fixed top-0 left-0 w-full h-full bg-black/50 flex justify-center items-center">
          <div className="bg-black border border-[#FFD700] p-6 rounded-md relative w-80">
            <IoCloseOutline className="text-2xl text-[#FFD700] cursor-pointer absolute top-2 right-2" onClick={() => setOrderPopup(false)} />
            <h1 className="text-xl font-bold text-[#FFD700]">Order Now</h1>
            <input
              type="text"
              placeholder="Name"
              className="w-full border border-[#FFD700] bg-black text-white px-2 py-1 mt-4 rounded"
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full border border-[#FFD700] bg-black text-white px-2 py-1 mt-2 rounded"
            />
            <button className="mt-4 bg-[#FFD700] text-black py-2 px-6 rounded-full w-full font-semibold hover:scale-105 transition-transform">
              Order Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
