import React, { useState, useEffect, useCallback } from "react";
import {
  DollarSign,
  TrendingUp,
  Download,
  Search,
  CreditCard,
  FileText,
  Settings,
  X,
} from "lucide-react";
import { getApiUrl } from "../config/api";

interface RevenueHistoryItem {
  id: string;
  type: "SUBSCRIPTION" | "ONE_TIME";
  amount: number;
  status: string;
  date: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  description: string;
  reference: string | null;
}

interface DashboardStats {
  revenue: Array<{ month: string; revenue: number }>;
  kpis: {
    avgRevenuePerUser: number;
    monthlyGrowth: number;
  };
}

const AdminRevenuePage: React.FC = () => {
  const [history, setHistory] = useState<RevenueHistoryItem[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<
    "ALL" | "SUBSCRIPTION" | "ONE_TIME"
  >("ALL");

  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [commissionRate, setCommissionRate] = useState(20);
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch History
      const historyRes = await fetch(getApiUrl("admin/revenue/history"), {
        headers,
      });
      const historyData = await historyRes.json();

      if (!historyRes.ok)
        throw new Error(historyData.error || "Failed to fetch history");

      // Fetch Stats
      const statsRes = await fetch(getApiUrl("admin/dashboard/stats"), {
        headers,
      });
      const statsData = await statsRes.json();

      if (!statsRes.ok)
        throw new Error(statsData.error || "Failed to fetch stats");

      // Fetch Settings
      const settingsRes = await fetch(getApiUrl("admin/revenue/settings"), {
        headers,
      });
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setCommissionRate(settingsData.settings.commissionPercentage);
      }

      setHistory(historyData.data);
      setStats(statsData.stats);
    } catch (err) {
      console.error("Error fetching revenue data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load revenue data"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveSettings = async () => {
    try {
      setSavingSettings(true);
      const token = localStorage.getItem("token");
      const response = await fetch(getApiUrl("admin/revenue/settings"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ commissionPercentage: Number(commissionRate) }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to save settings");

      setShowSettings(false);
      // Optional: Show success notification
    } catch (err) {
      console.error("Error saving settings:", err);
      alert(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSavingSettings(false);
    }
  };

  // Calculate totals from history
  const totalRevenue = history.reduce((sum, item) => sum + item.amount, 0);
  const subscriptionRevenue = history
    .filter((h) => h.type === "SUBSCRIPTION")
    .reduce((sum, item) => sum + item.amount, 0);
  const oneTimeRevenue = history
    .filter((h) => h.type === "ONE_TIME")
    .reduce((sum, item) => sum + item.amount, 0);

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      item.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.reference &&
        item.reference.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesFilter = filterType === "ALL" || item.type === filterType;

    return matchesSearch && matchesFilter;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency: "GBP",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading && !history.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 relative">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Revenue & Transactions
          </h1>
          <p className="text-gray-500 mt-1">
            Manage and view all financial transactions
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-sm text-sm font-medium hover:bg-indigo-700"
          >
            <Settings className="w-4 h-4 mr-2" />
            Revenue Settings
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-full">
              <DollarSign className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              {stats?.kpis.monthlyGrowth}%
            </span>
            <span className="text-gray-500 ml-2">vs last month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Subscriptions</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(subscriptionRevenue)}
              </p>
            </div>
            <div className="p-3 bg-purple-50 rounded-full">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Total from active plans
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                One-Time Purchases
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {formatCurrency(oneTimeRevenue)}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-full">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            Total from extra services
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterType("ALL")}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              filterType === "ALL"
                ? "bg-indigo-50 text-indigo-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            All Transactions
          </button>
          <button
            onClick={() => setFilterType("SUBSCRIPTION")}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              filterType === "SUBSCRIPTION"
                ? "bg-purple-50 text-purple-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            Subscriptions
          </button>
          <button
            onClick={() => setFilterType("ONE_TIME")}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
              filterType === "ONE_TIME"
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            One-Time
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(item.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {item.description}
                      </div>
                      <div className="text-xs text-gray-400 font-mono">
                        {item.reference}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {item.user?.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {item.user?.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.type === "SUBSCRIPTION"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {item.type === "SUBSCRIPTION"
                          ? "Subscription"
                          : "One-Time"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No transactions found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Revenue Settings
              </h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform Commission (%)
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <span className="ml-3 text-gray-500">%</span>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                This percentage will be deducted from the service price before
                paying the partner.
                <br />
                Example: 20% commission on £10 service = £2 platform fee, £8
                partner payout.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50"
              >
                {savingSettings ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRevenuePage;
