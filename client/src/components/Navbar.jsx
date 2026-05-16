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
    `text-sm font-semibold transition ${isActive ? "text-blue-600" : "text-slate-600 hover:text-blue-600"}`;

  return (
    <header className="fixed top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="FinovaAI" className="h-10 w-auto" />
          <div>
            <p className="text-lg font-black leading-5 text-slate-950">FinovaAI</p>
            <p className="text-xs font-semibold text-blue-600">Finance Growth With AI</p>
          </div>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          <NavLink to="/" className={linkClass}>Home</NavLink>
          <a href="/#features" className="text-sm font-semibold text-slate-600 transition hover:text-blue-600">Features</a>
          <NavLink to="/about" className={linkClass}>About Us</NavLink>
          <NavLink to="/dashboard/news" className={linkClass}>Market Pulse</NavLink>
        </div>

        <div className="relative flex items-center gap-3">
          <Link
            to="/dashboard"
            className="hidden items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 transition hover:border-blue-200 hover:text-blue-600 sm:flex"
          >
            <LayoutDashboard size={16} />
            Dashboard
          </Link>

          {!isSignedIn ? (
            <SignInButton mode="modal" redirectUrl="/dashboard">
              <button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700">
                Login
              </button>
            </SignInButton>
          ) : (
            <>
              <button
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-950 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
                title={user?.fullName || user?.primaryEmailAddress?.emailAddress || "Account"}
              >
                {getUserInitial()}
              </button>

              {isPopupOpen && (
                <div
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  className="absolute right-0 top-12 z-50 w-60 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl"
                >
                  <div className="mb-3">
                    <p className="font-bold text-slate-900">{user?.fullName || "Nikhil Shukla"}</p>
                    <p className="truncate text-sm text-slate-500">{user?.primaryEmailAddress?.emailAddress}</p>
                  </div>
                  <div className="h-px bg-slate-100" />
                  <Link to="/dashboard" className="mt-3 block rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                    Dashboard
                  </Link>
                  <button
                    onClick={() => signOut(() => (window.location.href = "/"))}
                    className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm font-semibold text-red-500 hover:bg-red-50"
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
