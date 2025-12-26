import React from "react";
import { Navigate } from "react-router-dom";
import { usePartnerAuth } from "../contexts/PartnerAuthContext";

interface PartnerProtectedRouteProps {
  children: React.ReactNode;
}

const PartnerProtectedRoute: React.FC<PartnerProtectedRouteProps> = ({
  children,
}) => {
  const { isAuthenticated, isLoading } = usePartnerAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading partner data...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to partner login page, not customer login
    return <Navigate to="/partner-login" replace />;
  }

  return <>{children}</>;
};

export default PartnerProtectedRoute;
