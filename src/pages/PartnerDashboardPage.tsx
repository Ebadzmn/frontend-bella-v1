import React, { useState, useEffect } from "react";
import {
  Scan,
  Clock,
  CheckCircle,
  TrendingUp,
  MapPin,
  Activity,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getApiUrl } from "../config/api";

interface DashboardStats {
  todayVerifications: number;
  weekVerifications: number;
  monthVerifications: number;
  totalVerifications: number;
  recentVerifications: any[];
}

const PartnerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [partner, setPartner] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("partnerToken");
        if (!token) {
          navigate("/partner-login");
          return;
        }

        // Fetch partner profile and stats
        const [profileRes, statsRes] = await Promise.all([
          fetch(getApiUrl("partner-auth/me"), {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(getApiUrl("partner-auth/stats"), {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (!profileRes.ok || !statsRes.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const profileData = await profileRes.json();
        const statsData = await statsRes.json();

        if (profileData.success && statsData.success) {
          setPartner(profileData.partner);
          localStorage.setItem("partner", JSON.stringify(profileData.partner));

          // Transform stats data
          setStats({
            todayVerifications: statsData.data.performance.todayVisits,
            weekVerifications: Math.floor(
              statsData.data.performance.totalVisits / 4
            ), // Approximate
            monthVerifications: statsData.data.performance.totalVisits,
            totalVerifications: statsData.data.performance.totalVisits,
            recentVerifications: [],
          });
        }
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // Separate function for manual retry without dependency issues
  const handleRetry = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("partnerToken");
      if (!token) {
        navigate("/partner-login");
        return;
      }

      const [profileRes, statsRes] = await Promise.all([
        fetch(getApiUrl("partner-auth/me"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(getApiUrl("partner-auth/stats"), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (!profileRes.ok || !statsRes.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const profileData = await profileRes.json();
      const statsData = await statsRes.json();

      if (profileData.success && statsData.success) {
        setPartner(profileData.partner);
        localStorage.setItem("partner", JSON.stringify(profileData.partner));

        setStats({
          todayVerifications: statsData.data.performance.todayVisits,
          weekVerifications: Math.floor(
            statsData.data.performance.totalVisits / 4
          ),
          monthVerifications: statsData.data.performance.totalVisits,
          totalVerifications: statsData.data.performance.totalVisits,
          recentVerifications: [],
        });
      }
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Activity className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {partner?.name}!
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Here's your verification activity overview
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <button
            onClick={() => navigate("/partner/scan")}
            className="bg-orange-600 text-white p-4 sm:p-6 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center group-hover:bg-opacity-30 transition-all">
                <Scan className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="text-left">
                <p className="text-xs sm:text-sm font-medium opacity-90">
                  Quick Action
                </p>
                <p className="text-base sm:text-lg font-semibold">
                  Scan QR Code
                </p>
              </div>
            </div>
            <Activity className="w-5 h-5 sm:w-6 sm:h-6 opacity-50" />
          </button>

          <button
            onClick={() => navigate("/partner/history")}
            className="bg-gray-900 text-white p-4 sm:p-6 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center group-hover:bg-opacity-30 transition-all">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="text-left">
                <p className="text-xs sm:text-sm font-medium opacity-90">
                  View
                </p>
                <p className="text-base sm:text-lg font-semibold">
                  Verification History
                </p>
              </div>
            </div>
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 opacity-50" />
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                Today
              </p>
              <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
              {stats?.todayVerifications}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Verifications
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                This Week
              </p>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
              {stats?.weekVerifications}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Verifications
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                This Month
              </p>
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
              {stats?.monthVerifications}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Verifications
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs sm:text-sm font-medium text-gray-600">
                All Time
              </p>
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">
              {stats?.totalVerifications}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Total</p>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Recent Activity
          </h2>

          {stats?.recentVerifications &&
          stats.recentVerifications.length > 0 ? (
            <div className="space-y-4">
              {/* Recent verification items would go here */}
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8">
              <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm sm:text-base text-gray-600">
                No recent verifications
              </p>
              <button
                onClick={() => navigate("/partner/scan")}
                className="mt-4 text-sm sm:text-base text-orange-600 hover:text-orange-700 font-medium"
              >
                Start scanning codes →
              </button>
            </div>
          )}
        </div>

        {/* Partner Info */}
        <div className="mt-6 sm:mt-8 bg-orange-50 border border-orange-200 rounded-lg p-4 sm:p-6">
          <div className="flex items-start space-x-3">
            <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-orange-900 mb-2 text-sm sm:text-base">
                Partner Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                <div className="break-words">
                  <span className="text-orange-700">Email:</span>
                  <span className="ml-2 font-medium text-orange-900">
                    {partner?.email}
                  </span>
                </div>
                <div>
                  <span className="text-orange-700">Phone:</span>
                  <span className="ml-2 font-medium text-orange-900">
                    {partner?.phone || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-orange-700">Status:</span>
                  <span
                    className={`ml-2 font-medium ${
                      partner?.status === "ACTIVE"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {partner?.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerDashboardPage;
