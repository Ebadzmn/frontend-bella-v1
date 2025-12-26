import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { App as CapacitorApp } from "@capacitor/app";
import { useEffect } from "react";
import { AuthProvider } from "./contexts/AuthContext";
import { PartnerAuthProvider } from "./contexts/PartnerAuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PartnerProtectedRoute from "./components/PartnerProtectedRoute";
import Layout from "./components/Layout";
import PartnerLayout from "./components/PartnerLayout";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import QRCodePage from "./pages/QRCodePage";
import BillingPage from "./pages/BillingPage";
import CheckoutPage from "./pages/CheckoutPage";
import SettingsPage from "./pages/SettingsPage";
import SupportPage from "./pages/SupportPage";
import MapPage from "./pages/MapPage";
import ExtraServicesPage from "./pages/ExtraServicesPage";
import NotFoundPage from "./pages/NotFoundPage";
import CustomerServiceStatusPage from "./pages/CustomerServiceStatusPage";
import PartnerScanPage from "./pages/PartnerScanPage";
import PartnerVerifyPage from "./pages/PartnerVerifyPage";
import PartnerLoginPage from "./pages/PartnerLoginPage";
import PartnerSignupPage from "./pages/PartnerSignupPage";
import PartnerDashboardPage from "./pages/PartnerDashboardPage";
import PartnerPayoutsPage from "./pages/PartnerPayoutsPage";
import PartnerRecentVisitsPage from "./pages/PartnerRecentVisitsPage";
import PartnerHelpSupportPage from "./pages/PartnerHelpSupportPage";
import PartnerSettingsPage from "./pages/PartnerSettingsPage";
import PartnerVerifySubscriptionPage from "./pages/PartnerVerifySubscriptionPage";
import AdminPartnersPage from "./pages/AdminPartnersPage";
import AdminPartnerDetailsPage from "./pages/AdminPartnerDetailsPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminCustomersPage from "./pages/AdminCustomersPage";
import AdminSubscriptionsPage from "./pages/AdminSubscriptionsPage";
import AdminExtraServicesPage from "./pages/AdminExtraServicesPage";
import AdminSettingsPage from "./pages/AdminSettingsPage";
import AdminRevenuePage from "./pages/AdminRevenuePage";
import AdminPayoutsPage from "./pages/AdminPayoutsPage";
import AdminAdminsPage from "./pages/AdminAdminsPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import PartnerForgotPasswordPage from "./pages/PartnerForgotPasswordPage";
import PartnerResetPasswordPage from "./pages/PartnerResetPasswordPage";

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    CapacitorApp.addListener("appUrlOpen", (data) => {
      console.log("App opened with URL:", data.url);
      if (data.url.includes("login") || data.url.includes("magic")) {
        navigate("/login");
      }
    });
  }, [navigate]);

  return (
    <AuthProvider>
      <PartnerAuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route path="/partner-login" element={<PartnerLoginPage />} />
          <Route
            path="/partner-forgot-password"
            element={<PartnerForgotPasswordPage />}
          />
          <Route
            path="/partner-reset-password"
            element={<PartnerResetPasswordPage />}
          />
          <Route path="/partner-signup" element={<PartnerSignupPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />

          {/* Protected routes - User role */}
          <Route
            path="/app"
            element={
              <ProtectedRoute requiredRole="USER">
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="qr-code" element={<QRCodePage />} />
            <Route
              path="service-status/:code"
              element={<CustomerServiceStatusPage />}
            />
            <Route path="billing" element={<BillingPage />} />
            <Route path="checkout" element={<CheckoutPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="support" element={<SupportPage />} />
            <Route path="map" element={<MapPage />} />
            <Route path="extra-services" element={<ExtraServicesPage />} />
          </Route>

          {/* Admin routes - Admin role required */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboardPage />} />
            <Route path="customers" element={<AdminCustomersPage />} />
            <Route path="partners" element={<AdminPartnersPage />} />
            <Route path="partners/:id" element={<AdminPartnerDetailsPage />} />
            <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
            <Route path="revenue" element={<AdminRevenuePage />} />
            <Route path="payouts" element={<AdminPayoutsPage />} />
            <Route path="extra-services" element={<AdminExtraServicesPage />} />
            <Route path="admins" element={<AdminAdminsPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>

          {/* Partner routes */}
          <Route
            path="/partner"
            element={
              <PartnerProtectedRoute>
                <PartnerLayout />
              </PartnerProtectedRoute>
            }
          >
            <Route
              index
              element={<Navigate to="/partner/dashboard" replace />}
            />
            <Route path="dashboard" element={<PartnerDashboardPage />} />
            <Route path="payouts" element={<PartnerPayoutsPage />} />
            <Route path="scan" element={<PartnerScanPage />} />
            <Route
              path="verify-subscription"
              element={<PartnerVerifySubscriptionPage />}
            />
            <Route path="verify/:code" element={<PartnerVerifyPage />} />
            <Route path="recent-visits" element={<PartnerRecentVisitsPage />} />
            <Route path="settings" element={<PartnerSettingsPage />} />
            <Route path="help-support" element={<PartnerHelpSupportPage />} />
          </Route>

          {/* 404 route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </PartnerAuthProvider>
    </AuthProvider>
  );
}

export default App;
