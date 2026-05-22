import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";


const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="finova-dark-app flex h-screen overflow-hidden bg-black text-white">

      {/* ✅ Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex lg:hidden">

          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-40"
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sidebar Panel */}
          <div className="relative h-full w-64 bg-black shadow-lg">
            <Sidebar />
          </div>

        </div>
      )}

      {/* ✅ Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar />
      </div>

      {/* ✅ Main Section */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* Scroll ONLY this area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </div>

      </div>


    </div>
  );
};

export default DashboardLayout;
