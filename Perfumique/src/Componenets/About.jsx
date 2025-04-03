import React from "react";
import AboutImage from "../assets/website/about_image.png"; // Ensure this is a high-quality perfume image
import { Sparkles, Diamond, Leaf } from "lucide-react";
import AboutHeader from "../assets/website/about-bg2.png"
function About() {
    return (
            <div 
          className="overflow-y-auto"
          style={{ 
            backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0) 20%, rgba(0, 0, 0, 0) 20%, rgba(0, 0, 0, 1) 100%), url(${AboutHeader})`,

      
            backgroundSize: "contain" 
          }}>
            {/* Hero Section */}
            <div className="container mx-auto  flex flex-col-reverse  lg:flex-row items-center gap-12">
                {/* Text Section */}
                <div className="relative mt-20 bg-black border border-[#FFD700] rounded-lg shadow-2xl shadow-yellow-100/20 p-16 lg:w-1/2 space-y-6 text-center lg:text-left bg-[url('/path-to-subtle-gold-texture.png')] bg-cover">
    
    {/* Calligraphy Quote for Elegance */}
    <p className="text-[#FFD700] text-white italic text-sm absolute top-6 left-6">
        "Timeless Elegance in Every Drop"
    </p>

    {/* Title */}
    <h1 className="text-4xl lg:text-5xl text-white vfont-extrabold tracking-tight">
        Welcome to <span className="text-[#FFD700]">Perfumiqe</span>
    </h1>

    {/* Description */}
    <p className="text-lg text-white leading-relaxed ">
        Indulge in the world of <strong>luxury fragrances</strong>. At <strong>Perfumiqe</strong>, we craft and curate
        the finest scents that captivate your senses and leave a <strong>lasting impression</strong>.
    </p>

    {/* Button */}
    <button className="bg-gradient-to-r from-[#FFD700] to-yellow-500 text-black py-3 px-6 rounded-full 
                        shadow-lg hover:scale-105 hover:shadow-yellow-500/50 transition-transform duration-300 font-semibold">
        Explore Collection
    </button>
</div>


                {/* Image Section */}
                <div className="lg:w-1/2 flex justify-center mt-24">
                <img
                    src={AboutImage}
                    alt="Luxury Perfume"
                    className="w-[100%] max-w-[550px] rounded-lg shadow-2xl shadow-black/80 transition-transform hover:scale-105 duration-500 border border-[#FFD700]"
                />
            </div>

            </div>

            {/* Our Values Section */}
            <div className="container mx-auto mt-44 text-center ">
                <h2 className="text-3xl font-bold text-[#FFD700]">Our Values</h2>
                <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                    We believe in creating perfumes that **inspire, empower, and enchant**.
                </p>

                <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                    {/* Value 1 */}
                    <div className="bg-black border border-[#FFD700] p-6 rounded-xl shadow-lg hover:scale-105 transition-transform">
                        <div className="flex justify-center mb-4">
                            <Sparkles className="w-12 h-12 text-[#FFD700] animate-pulse" />
                        </div>
                        <h3 className="text-xl font-bold text-[#FFD700]">Timeless Elegance</h3>
                        <p className="text-gray-400">
                            Our scents embody **sophistication and class**, designed for those who appreciate the art of fine perfumery.
                        </p>
                    </div>

                    {/* Value 2 */}
                    <div className="bg-black border border-[#FFD700] p-6 rounded-xl shadow-lg hover:scale-105 transition-transform">
                        <div className="flex justify-center mb-4">
                            <Diamond className="w-12 h-12 text-[#FFD700] animate-pulse" />
                        </div>
                        <h3 className="text-xl font-bold text-[#FFD700]">Premium Ingredients</h3>
                        <p className="text-gray-400">
                            We source the **rarest and most exquisite ingredients** to create **luxurious, high-quality perfumes**.
                        </p>
                    </div>

                    {/* Value 3 */}
                    <div className="bg-black border border-[#FFD700] p-6 rounded-xl shadow-lg hover:scale-105 transition-transform">
                        <div className="flex justify-center mb-4">
                            <Leaf className="w-12 h-12 text-[#FFD700] animate-pulse" />
                        </div>
                        <h3 className="text-xl font-bold text-[#FFD700]">Eco-Friendly</h3>
                        <p className="text-gray-400">
                            Sustainability is at our core. We use **eco-friendly packaging** and ethical sourcing practices.
                        </p>
                    </div>
                </div>
            </div>

            {/* Call to Action */}
            <div className="container mx-auto mt-20 text-center bg-gradient-to-r from-[#FFD700] to-yellow-500 text-black py-16 px-6 rounded-lg shadow-lg">
                <h2 className="text-3xl font-bold">Discover Your Signature Scent</h2>
                <p className="text-lg mt-2">Find the perfect fragrance that defines **you**.</p>
                <button className="mt-6 bg-black text-[#FFD700] py-3 px-6 rounded-full font-semibold shadow-lg hover:scale-105 transition-transform border border-[#FFD700]">
                    Shop Now
                </button>
            </div>
        </div>
    );
}

export default About;
