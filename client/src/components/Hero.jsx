import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useClerk, useUser, SignInButton } from "@clerk/react";
import Features from "./Features";

const Hero = () => {
  const { signOut } = useClerk();
  const { isSignedIn } = useUser();
  const navigate = useNavigate();

  const handleAuthClick = () => {
    if (isSignedIn) {
      navigate("/dashboard"); // ✅ go to dashboard
    }
  };

  return (
    <>
      <section className="min-h-[65vh] flex items-center">
        <div className="max-w-[90rem] mx-auto px-8 flex flex-col-reverse md:flex-row items-center gap-12 lg:gap-10">
          
          <div className="text-center md:text-left flex-1">
            
            <h2 className="mt-6 text-4xl md:text-6xl lg:text-5xl font-bold text-gray-900 leading-tight tracking-tight">
              From Financial Complexity To{" "}
              <span className="text-blue-600">Confident Decisions</span>
            </h2>

            <p className="mt-4 text-lg md:text-xl lg:text-1xl text-gray-600 leading-8 max-w-2xl mx-auto md:mx-0">
              We at FinovaAI, unify critical financial data into one intelligent
              platform for faster insights and smarter portfolio decisions.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-6 justify-center md:justify-start">
              
              {isSignedIn ? (
                <button
                  onClick={handleAuthClick}
                  className="px-8 py-4 md:px-10 md:py-5 bg-blue-600 text-white text-lg md:text-xl rounded-xl shadow-lg hover:bg-blue-700 transition"
                >
                  Go to Dashboard 🚀
                </button>
              ) : (
                <SignInButton mode="modal" redirectUrl="/dashboard">
                  <button className="px-8 py-4 md:px-10 md:py-5 bg-blue-600 text-white text-lg md:text-xl rounded-xl shadow-lg hover:bg-blue-700 transition">
                    New User Login
                  </button>
                </SignInButton>
              )}

              <Link
                to="/dashboard"
                className="px-8 py-4 md:px-10 md:py-5 border-2 border-blue-600 text-blue-600 text-lg md:text-xl rounded-xl shadow-lg hover:bg-blue-50 transition"
              >
                View Insights
              </Link>
            </div>
          </div>

          <div className="flex-1 flex justify-center">
            <img
              src="/hero.png"
              alt="Landing"
              className="max-w-sm md:max-w-lg lg:max-w-3xl h-auto object-contain"
            />
          </div>
        </div>
      </section>

      <Features />
    </>
  );
};

export default Hero;