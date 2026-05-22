import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Footer from "../components/Footer";


const Landing = () => {
  return (
    <div className="finova-marketing bg-black text-white">
      <div className="min-h-screen bg-black pt-[76px]">
        <Navbar />
        <Hero/>
      </div>
      <Footer />
    </div>
  );
};

export default Landing;
