import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";
import {
  LayoutDashboard,
  QrCode,
  CreditCard,
  Settings,
  HelpCircle,
  LogOut,
  Users,
  Package,
  UserCog,
  X,
  MapPin,
  Sparkles,
  DollarSign,
  Shield,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import logoUrl from "/BellaLogo.png";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Check if user is admin
  const isAdmin = user?.role === "ADMIN";

  const userNavItems = [
    { path: "/app/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/app/qr-code", icon: QrCode, label: "My QR Code" },
    { path: "/app/map", icon: MapPin, label: "Find Locations" },
    { path: "/app/billing", icon: CreditCard, label: "Billing" },
    { path: "/app/extra-services", icon: Package, label: "Extra Services" },
    { path: "/app/settings", icon: Settings, label: "Settings" },
  ];

  const adminNavItems = [
    { path: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/admin/customers", icon: Users, label: "Customers" },
    { path: "/admin/partners", icon: UserCog, label: "Partners" },
    { path: "/admin/subscriptions", icon: Package, label: "Subscriptions" },
    { path: "/admin/revenue", icon: DollarSign, label: "Revenue" },
    { path: "/admin/payouts", icon: CreditCard, label: "Payouts" },
    { path: "/admin/extra-services", icon: Sparkles, label: "Extra Services" },
    { path: "/admin/admins", icon: Shield, label: "Admins" },
    { path: "/admin/settings", icon: Settings, label: "Settings" },
  ];

  const navItems = isAdmin ? adminNavItems : userNavItems;

  const isActive = (path: string) => location.pathname === path;

  const handleNavClick = async (e: React.MouseEvent, path: string) => {
    const externalRoutes = [
      "/app/billing",
      "/app/extra-services",
      "/app/settings",
    ];

    if (Capacitor.isNativePlatform() && externalRoutes.includes(path)) {
      e.preventDefault();
      const token = localStorage.getItem("token");
      const url = `https://www.bellacarwash.co.uk${path}${
        token ? `?token=${token}` : ""
      }`;
      await Browser.open({ url });
    }

    if (onClose) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-gray-900 text-white flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        {/* Close button for mobile */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 lg:hidden text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        {/* Logo and Brand */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <img src={logoUrl} alt="Bella Wash Logo" className="w-12 h-12" />
            <div>
              <h1 className="text-lg font-semibold">Bella Wash</h1>
              <p className="text-xs text-gray-400">
                {isAdmin ? "Admin Portal" : "Customer Portal"}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 py-6 overflow-y-auto">
          <div className="px-3">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
              Menu
            </p>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={(e) => handleNavClick(e, item.path)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
                    isActive(item.path)
                      ? "bg-orange-500 text-white"
                      : "text-gray-300 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </NavLink>
              );
            })}
          </div>

          {/* Help Section */}
          {!isAdmin && (
            <div className="px-3 mt-8">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
                Help
              </p>
              <NavLink
                to="/app/support"
                onClick={(e) => handleNavClick(e, "/app/support")}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg mb-1 transition-colors ${
                  isActive("/app/support")
                    ? "bg-orange-500 text-white"
                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <HelpCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Contact Support</span>
              </NavLink>
            </div>
          )}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user?.name?.[0] || "U"}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-gray-400">
                {isAdmin ? "Administrator" : "Unlimited Plan"}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center space-x-2 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
