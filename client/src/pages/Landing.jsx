import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Footer from "../components/Footer";


const Landing = () => {
  return (
    <div className="bg-slate-50">
      <div className="min-h-screen bg-white pt-[76px]">
        <Navbar />
        <Hero/>
      </div>
      <Footer />
    </div>
  );
};

export default Landing;
