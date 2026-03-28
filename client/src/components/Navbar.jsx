import React, { useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { useUser, useClerk, SignInButton } from "@clerk/react";

const Navbar = () => {
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();

  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const hoverTimeoutRef = useRef(null);

  // 🔥 Get first letter (Name → Email → Default)
  const getUserInitial = () => {
    if (!user) return "U";

    if (user.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    }

    if (user.primaryEmailAddress?.emailAddress) {
      return user.primaryEmailAddress.emailAddress.charAt(0).toUpperCase();
    }

    return "U";
  };

  // Hover handlers
  const clearHoverTimeout = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  const handleMouseEnter = useCallback(() => {
    clearHoverTimeout();
    setIsPopupOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    clearHoverTimeout();
    hoverTimeoutRef.current = setTimeout(() => {
      setIsPopupOpen(false);
    }, 200);
  }, []);

  return (
    <header className="fixed top-0 w-full bg-white shadow-md z-50">
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <img src="/nav.png" alt="Logo" className="h-9 w-auto" />
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center space-x-6">
          <a href="#testimonials" className="text-gray-700 hover:text-blue-600">
            Testimonials
          </a>
          <a href="#features" className="text-gray-700 hover:text-blue-600">
            Features
          </a>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4 relative">
          
          {/* If NOT signed in */}
          {!isSignedIn ? (
            <SignInButton mode="modal" redirectUrl="/dashboard">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                Login
              </button>
            </SignInButton>
          ) : (
            <>
              {/* Avatar Button */}
              <button
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white font-semibold text-lg hover:bg-blue-700 transition shadow-sm"
                title={
                  user?.fullName ||
                  user?.primaryEmailAddress?.emailAddress ||
                  "Account"
                }
              >
                {getUserInitial()}
              </button>

              {/* Popup */}
              {isPopupOpen && (
                <div
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  className="absolute right-0 top-12 w-56 bg-white border rounded-xl shadow-lg p-4 z-50"
                >
                  {/* User Info */}
                  <div className="mb-3">
                    <p className="font-semibold text-gray-800">
                      {user?.fullName || "User"}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {user?.primaryEmailAddress?.emailAddress}
                    </p>
                  </div>

                  <hr className="mb-3" />

                  {/* Actions */}
                  <Link
                    to="/dashboard"
                    className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    Dashboard
                  </Link>

                  <button
                    onClick={() => signOut(() => (window.location.href = "/"))}
                    className="w-full text-left px-3 py-2 rounded-md text-red-500 hover:bg-red-50 mt-2"
                  >
                    Logout
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;