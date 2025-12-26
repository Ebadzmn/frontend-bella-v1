import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Package,
  DollarSign,
  Activity,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from "lucide-react";
import { getApiUrl } from "../config/api";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardStats {
  totalCustomers: number;
  totalPartners: number;
  activeSubscriptions: number;
  washesThisMonth: number;
  revenue: Array<{ month: string; revenue: number }>;
  washActivity: Array<{ day: string; washes: number }>;
  subscriptionDistribution: Array<{ name: string; value: number }>;
  kpis: {
    avgRevenuePerUser: number;
    customerRetention: number;
    monthlyGrowth: number;
    churnRate: number;
  };
}

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportPeriod, setReportPeriod] = useState("weekly");
  const [downloadingReport, setDownloadingReport] = useState(false);

  const fetchDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(getApiUrl("admin/dashboard/stats"), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(
          `Failed to fetch stats: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      setStats(data.stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardStats();
  }, [fetchDashboardStats]);

  const handleDownloadReport = async (format: "pdf" | "csv") => {
    try {
      setDownloadingReport(true);
      const response = await fetch(
        getApiUrl(`admin/reports/${format}?period=${reportPeriod}`),
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          `Failed to download report: ${response.status} ${response.statusText}`
        );
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bella-report-${reportPeriod}-${
        new Date().toISOString().split("T")[0]
      }.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading report:", error);
      alert(
        error instanceof Error ? error.message : "Failed to download report"
      );
    } finally {
      setDownloadingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to Load Dashboard
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchDashboardStats}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            No Data Available
          </h2>
          <p className="text-gray-600 mb-6">
            Dashboard statistics are not available at the moment.
          </p>
          <button
            onClick={fetchDashboardStats}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  const revenueChartData = {
    labels: stats.revenue.map((r) => r.month),
    datasets: [
      {
        label: "Revenue (£)",
        data: stats.revenue.map((r) => r.revenue),
        borderColor: "rgb(234, 88, 12)",
        backgroundColor: "rgba(234, 88, 12, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const washActivityData = {
    labels: stats.washActivity.map((w) => w.day),
    datasets: [
      {
        label: "Washes",
        data: stats.washActivity.map((w) => w.washes),
        backgroundColor: "rgb(17, 24, 39)",
      },
    ],
  };

  const subscriptionDistData = {
    labels: stats.subscriptionDistribution.map((s) => s.name),
    datasets: [
      {
        data: stats.subscriptionDistribution.map((s) => s.value),
        backgroundColor: [
          "rgb(234, 88, 12)",
          "rgb(17, 24, 39)",
          "rgb(107, 114, 128)",
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Overview of your business metrics and performance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Customers */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Customers</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalCustomers.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Total Partners */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Package className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Partners</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.totalPartners}
              </p>
            </div>
          </div>

          {/* Active Subscriptions */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Activity className="w-6 h-6 text-gray-900" />
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Subscriptions</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.activeSubscriptions}
              </p>
            </div>
          </div>

          {/* Washes This Month */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <DollarSign className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Washes This Month</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.washesThisMonth.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Download Reports */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Download Reports
          </h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="flex-1 min-w-[200px]">
              <label
                htmlFor="report-period"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Report Period
              </label>
              <select
                id="report-period"
                value={reportPeriod}
                onChange={(e) => setReportPeriod(e.target.value)}
                disabled={downloadingReport}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="weekly">Weekly Report</option>
                <option value="monthly">Monthly Report</option>
                <option value="yearly">Yearly Report</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleDownloadReport("pdf")}
                disabled={downloadingReport}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Download PDF report"
              >
                {downloadingReport ? "⏳ Downloading..." : "📄 Download PDF"}
              </button>
              <button
                onClick={() => handleDownloadReport("csv")}
                disabled={downloadingReport}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Download CSV report"
              >
                {downloadingReport ? "⏳ Downloading..." : "📊 Download CSV"}
              </button>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Summary */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Revenue Summary
            </h3>
            <div className="h-64">
              <Line
                data={revenueChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const value = context?.parsed?.y ?? 0;
                          return `Revenue: ${value.toFixed(2)}`;
                        },
                      },
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      ticks: {
                        callback: (value) => `£${value}`,
                      },
                    },
                  },
                }}
              />
            </div>
          </div>

          {/* Subscription Distribution */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Subscription Distribution
            </h3>
            <div className="h-64 flex items-center justify-center">
              <Pie
                data={subscriptionDistData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "bottom",
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const label = context.label || "";
                          const value = context.parsed || 0;
                          return `${label}: ${value} users`;
                        },
                      },
                    },
                  },
                }}
              />
            </div>
            <div className="mt-4 space-y-2">
              {stats.subscriptionDistribution.map((sub, index) => {
                const colors = ["bg-purple-500", "bg-blue-500", "bg-green-500"];
                return (
                  <div
                    key={sub.name}
                    className="flex items-center justify-between text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 ${colors[index]} rounded-full`}
                      ></div>
                      <span className="text-gray-600">{sub.name}</span>
                    </div>
                    <span className="font-semibold">{sub.value} users</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Weekly Wash Activity */}
        <div className="bg-white rounded-lg p-6 shadow-sm mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Washes Completed This Month
          </h3>
          <div className="h-64">
            <Bar
              data={washActivityData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => `Washes: ${context.parsed.y}`,
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1,
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Key Performance Indicators
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">
                Avg. Revenue per User
              </p>
              <p className="text-2xl font-bold text-gray-900">
                £{stats.kpis.avgRevenuePerUser.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Customer Retention</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.kpis.customerRetention.toFixed(1)}%
                </p>
                {stats.kpis.customerRetention > 80 && (
                  <TrendingUp
                    className="w-5 h-5 text-green-500"
                    aria-label="Trending up"
                  />
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Monthly Growth</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-green-600">
                  +{stats.kpis.monthlyGrowth.toFixed(1)}%
                </p>
                <TrendingUp
                  className="w-5 h-5 text-green-500"
                  aria-label="Trending up"
                />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Churn Rate</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900">
                  {stats.kpis.churnRate.toFixed(1)}%
                </p>
                {stats.kpis.churnRate > 5 && (
                  <TrendingDown
                    className="w-5 h-5 text-red-500"
                    aria-label="Trending down"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
