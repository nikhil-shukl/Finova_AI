import React from "react";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";


const Landing = () => {
  return (
    <div>
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-[90px]">
        <Navbar />
        <Hero/>

      </div>
    </div>
  );
};

export default Landing;