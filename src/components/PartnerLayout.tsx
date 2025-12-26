import React, { useState } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import {
  DollarSign,
  Scan,
  Clock,
  Settings,
  HelpCircle,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";
import { usePartnerAuth } from "../contexts/PartnerAuthContext";
import { useNotifications } from "../hooks/useNotifications";
import logoUrl from "/BellaLogo.png";

const PartnerLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { partner, logout, isAuthenticated } = usePartnerAuth();
  useNotifications(isAuthenticated, 'partner');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/partner-login");
  };

  const menuItems = [
    {
      title: "Main Menu",
      items: [
        {
          icon: LayoutDashboard,
          label: "Dashboard",
          path: "/partner/dashboard",
        },
        { icon: DollarSign, label: "Payouts", path: "/partner/payouts" },
        { icon: Scan, label: "Scan QR Code", path: "/partner/scan" },
        { icon: Clock, label: "Recent Visits", path: "/partner/recent-visits" },
      ],
    },
    {
      title: "Support",
      items: [
        { icon: Settings, label: "Settings", path: "/partner/settings" },
        {
          icon: HelpCircle,
          label: "Help & Support",
          path: "/partner/help-support",
        },
      ],
    },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleNavClick = async (e: React.MouseEvent, path: string) => {
    if (Capacitor.isNativePlatform() && path === "/partner/settings") {
      e.preventDefault();
      const token = localStorage.getItem("partnerToken");
      const url = `https://www.bellacarwash.co.uk${path}${
        token ? `?token=${token}` : ""
      }`;
      await Browser.open({ url });
    }
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-gray-900 text-white flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        {/* Close button for mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 lg:hidden text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Logo/Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <img src={logoUrl} alt="Bella Wash Logo" className="w-12 h-12" />
            <div>
              <h1 className="text-lg font-semibold">Partner Dashboard</h1>
              <p className="text-sm text-gray-400">
                {partner?.businessName || "Car Wash Pro"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6">
          {menuItems.map((section, idx) => (
            <div key={idx} className="mb-6">
              <h3 className="px-6 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {section.title}
              </h3>
              <div className="space-y-1 px-3">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={(e) => handleNavClick(e, item.path)}
                      className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                        active
                          ? "bg-orange-500 text-white"
                          : "text-gray-300 hover:bg-orange-500 hover:text-white"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-300 hover:bg-orange-500 hover:text-white transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile header */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">Bella Wash</h1>
          <div className="w-6" /> {/* Spacer for centering */}
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default PartnerLayout;
