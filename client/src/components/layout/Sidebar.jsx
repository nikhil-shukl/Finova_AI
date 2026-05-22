import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  ShieldCheck,
  Bot ,
  Database,
  ArrowLeft ,
  Power,
} from "lucide-react";

const Sidebar = () => {
  const menuItems = [
    { name: "My Portfolio", icon: LayoutDashboard, path: "/dashboard" },
    { name: "Truth Agent", icon: ShieldCheck, path: "/dashboard/true" },
        { name: "Market Pulse", icon: TrendingUp, path: "/dashboard/news" },
        { name: "Finpilot AI ", icon: Bot , path: "/dashboard/bot" },
    { name: "Ingest Settings", icon: Database, path: "/dashboard/ingest" },
     { name: "Go Back", icon: ArrowLeft , path: "/" },
  ];

  return (
    <div className="h-screen w-64 border-r border-white/10 bg-[#050505] p-6 text-white flex flex-col justify-between">
      
      {/* Top Section */}
      <div>
        <div className="mb-8 flex items-center gap-2">
          <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
          <div>
            <h1 className="text-xl font-black text-white">FinovaAI</h1>
            <p className="text-xs font-semibold text-[#d8bd62]">
              Finance Growth With AI
            </p>
          </div>
        </div>

        {/* Menu */}
        <nav className="space-y-2">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={index}
                to={item.path}
                end={item.path === "/dashboard"}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-[#d8bd62] text-black font-black shadow-sm"
                      : "text-white/62 hover:bg-white/[0.06] hover:text-[#d8bd62]"
                  }`
                }
              >
                <Icon size={18} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <button
        onClick={() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/";
        }}
        className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left text-red-300 transition-all hover:bg-red-500/10"
      >
        <Power size={18} />
        <span>Log Out</span>
      </button>
    </div>
  );
};

export default Sidebar;
