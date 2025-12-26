import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "USER" | "PARTNER" | "ADMIN"; // Match backend enum values
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check role if required (case-insensitive comparison)
  if (
    requiredRole &&
    user?.role?.toUpperCase() !== requiredRole.toUpperCase()
  ) {
    // Redirect based on user's actual role
    const userRole = user?.role?.toUpperCase();
    if (userRole === "ADMIN") {
      return <Navigate to="/admin/partners" replace />;
    } else if (userRole === "PARTNER") {
      return <Navigate to="/partner/dashboard" replace />;
    } else {
      return <Navigate to="/app/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
