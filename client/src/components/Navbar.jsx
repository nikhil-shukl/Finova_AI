import React, { useCallback, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { SignInButton, useClerk, useUser } from "@clerk/react";
import { LayoutDashboard } from "lucide-react";

const Navbar = () => {
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const hoverTimeoutRef = useRef(null);

  const getUserInitial = () => {
    if (user?.firstName) return user.firstName.charAt(0).toUpperCase();
    if (user?.primaryEmailAddress?.emailAddress) {
      return user.primaryEmailAddress.emailAddress.charAt(0).toUpperCase();
    }
    return "N";
  };

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
    hoverTimeoutRef.current = setTimeout(() => setIsPopupOpen(false), 180);
  }, []);

  const linkClass = ({ isActive }) =>
    `text-sm font-bold transition ${isActive ? "text-[#d8bd62]" : "text-white/62 hover:text-[#d8bd62]"}`;

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/92 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="FinovaAI" className="h-10 w-auto" />
          <div>
            <p className="text-lg font-black leading-5 text-white">FinovaAI</p>
            <p className="text-xs font-semibold text-[#d8bd62]">Finance Growth With AI</p>
          </div>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          <NavLink to="/" className={linkClass}>Home</NavLink>
          <a href="/#features" className="text-sm font-bold text-white/62 transition hover:text-[#d8bd62]">Features</a>
          <NavLink to="/about" className={linkClass}>About Us</NavLink>
          <NavLink to="/dashboard/news" className={linkClass}>Market Pulse</NavLink>
        </div>

        <div className="relative flex items-center gap-3">
          <Link
            to="/dashboard"
            className="hidden items-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-2 text-sm font-bold text-white/75 transition hover:border-[#d8bd62]/50 hover:text-[#d8bd62] sm:flex"
          >
            <LayoutDashboard size={16} />
            Dashboard
          </Link>

          {!isSignedIn ? (
            <SignInButton mode="modal" redirectUrl="/dashboard">
              <button className="rounded-xl bg-[#d8bd62] px-4 py-2 text-sm font-black text-black shadow-lg shadow-[#d8bd62]/20 transition hover:bg-[#f0d878]">
                Login
              </button>
            </SignInButton>
          ) : (
            <>
              <button
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d8bd62] text-sm font-black text-black shadow-sm transition hover:bg-[#f0d878]"
                title={user?.fullName || user?.primaryEmailAddress?.emailAddress || "Account"}
              >
                {getUserInitial()}
              </button>

              {isPopupOpen && (
                <div
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  className="absolute right-0 top-12 z-50 w-60 rounded-2xl border border-white/10 bg-[#090909] p-4 shadow-xl"
                >
                  <div className="mb-3">
                    <p className="font-bold text-white">{user?.fullName || "Nikhil Shukla"}</p>
                    <p className="truncate text-sm text-white/45">{user?.primaryEmailAddress?.emailAddress}</p>
                  </div>
                  <div className="h-px bg-white/10" />
                  <Link to="/dashboard" className="mt-3 block rounded-lg px-3 py-2 text-sm font-semibold text-white/70 hover:bg-white/[0.04]">
                    Dashboard
                  </Link>
                  <button
                    onClick={() => signOut(() => (window.location.href = "/"))}
                    className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-300 hover:bg-red-500/10"
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
