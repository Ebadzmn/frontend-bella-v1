import React, { useState, useEffect, useCallback } from "react";
import { getApiUrl } from "../config/api";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  Users,
  Download,
} from "lucide-react";

interface PayoutStats {
  totalEarnings: number;
  pendingPayout: number;
  activeSubscriptions: number;
  totalVisits: number;
  avgPerVisit: number;
  retention: number;
  rating: number;
  earningsChange: number;
  nextPayoutDate: string;
  payoutStats?: {
    totalPaid: string;
    pending: string;
    failed: string;
    totalPayouts: number;
    paidPayouts: number;
    pendingPayouts: number;
  };
}

interface Payout {
  id: number;
  amount: number;
  status: string;
  description: string;
  createdAt: string;
  processedAt?: string;
  failureReason?: string;
  verification?: {
    user: {
      name: string;
      email: string;
    };
    subscription: {
      plan: {
        name: string;
      };
    };
  };
}

const PartnerPayoutsPage: React.FC = () => {
  const [stats, setStats] = useState<PayoutStats | null>(null);
  const [monthlyBreakdown, setMonthlyBreakdown] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [payoutsPage, setPayoutsPage] = useState(1);
  const [totalPayouts, setTotalPayouts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayoutData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem("partnerToken");
      if (!token) {
        window.location.href = "/partner-login";
        return;
      }

      const response = await fetch(getApiUrl("partner-auth/stats"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch payout data");
      }

      const data = await response.json();

      if (data.success) {
        const apiStats = data.data;

        setStats({
          totalEarnings: parseFloat(apiStats.totalEarnings),
          pendingPayout: parseFloat(apiStats.pendingPayout),
          activeSubscriptions: apiStats.activeSubscriptions,
          totalVisits: apiStats.performance.totalVisits,
          avgPerVisit: parseFloat(apiStats.performance.averagePerVisit),
          retention: parseInt(apiStats.performance.retentionRate),
          rating: parseFloat(apiStats.performance.customerRating),
          earningsChange: parseFloat(apiStats.earningsChange),
          nextPayoutDate: new Date(
            apiStats.nextPayoutDate
          ).toLocaleDateString(),
          payoutStats: apiStats.payoutStats,
        });

        // Add icons to monthly breakdown
        const breakdownWithIcons = apiStats.monthlyBreakdown.map(
          (item: any) => ({
            ...item,
            amount: parseFloat(item.amount),
            icon: item.type.includes("Premium")
              ? "💎"
              : item.type.includes("Basic")
              ? "🚗"
              : item.type.includes("Fee")
              ? "💳"
              : "💰",
            description: item.type.includes("Fee") ? "2.9% + £0.30" : undefined,
          })
        );

        setMonthlyBreakdown(breakdownWithIcons);
      }
    } catch (err: any) {
      console.error("Fetch payout error:", err);
      setError(err.message || "Failed to load payout data");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPayoutHistory = useCallback(async () => {
    try {
      const token = localStorage.getItem("partnerToken");
      if (!token) return;

      const response = await fetch(
        getApiUrl(`partner-auth/payouts?page=${payoutsPage}&limit=10`),
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch payout history");
      }

      const data = await response.json();

      if (data.success) {
        setPayouts(data.data.payouts);
        setTotalPayouts(data.data.pagination.total);
      }
    } catch (err: any) {
      console.error("Fetch payout history error:", err);
    }
  }, [payoutsPage]);

  useEffect(() => {
    fetchPayoutData();
  }, [fetchPayoutData]);

  useEffect(() => {
    fetchPayoutHistory();
  }, [fetchPayoutHistory]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <DollarSign className="w-12 h-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading payout data...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Failed to load data"}</p>
          <button
            onClick={fetchPayoutData}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-gray-700" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
          </div>
        </div>

        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Earnings */}
          <div className="bg-white rounded-xl shadow-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">
                  Total Earnings
                </p>
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <h2 className="text-3xl font-bold text-gray-900">
                  £{stats.totalEarnings.toFixed(2)}
                </h2>
              </div>
              <div className="mt-2 flex items-center text-sm">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="text-green-600 font-medium">
                  +{stats.earningsChange}%
                </span>
              </div>
            </div>
          </div>

          {/* Pending Payout */}
          <div className="bg-white rounded-xl shadow-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">
                  Pending Payout
                </p>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <h2 className="text-3xl font-bold text-gray-900">
                  £{stats.pendingPayout.toFixed(2)}
                </h2>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Due {stats.nextPayoutDate}
              </p>
            </div>
          </div>

          {/* Active Subscriptions */}
          <div className="bg-white rounded-xl shadow-sm p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">
                  Active Subscriptions
                </p>
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
              </div>
              <div className="flex items-baseline space-x-2">
                <h2 className="text-3xl font-bold text-gray-900">
                  {stats.activeSubscriptions}
                </h2>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {stats.totalVisits} total visits
              </p>
            </div>
          </div>
        </div>

        {/* Performance Stats */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Performance Stats
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Total Visits</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalVisits}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Avg Per Visit</p>
              <p className="text-2xl font-bold text-gray-900">
                £{stats.avgPerVisit}
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Retention</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.retention}%
              </p>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">Rating</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rating}</p>
            </div>
          </div>
        </div>

        {/* Payout History */}
        {stats.payoutStats && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Payout History
            </h3>

            {/* Payout Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-green-700 mb-1">Total Paid</p>
                <p className="text-2xl font-bold text-green-900">
                  £{stats.payoutStats.totalPaid}
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {stats.payoutStats.paidPayouts} payouts
                </p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <p className="text-sm text-yellow-700 mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-900">
                  £{stats.payoutStats.pending}
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  {stats.payoutStats.pendingPayouts} payouts
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-4">
                <p className="text-sm text-red-700 mb-1">Failed</p>
                <p className="text-2xl font-bold text-red-900">
                  £{stats.payoutStats.failed}
                </p>
                <p className="text-xs text-red-600 mt-1">
                  {stats.payoutStats.totalPayouts} total
                </p>
              </div>
            </div>

            {/* Recent Payouts Table */}
            {payouts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Date
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Customer
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Plan
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((payout) => (
                      <tr
                        key={payout.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {new Date(payout.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div>
                            <p className="font-medium text-gray-900">
                              {payout.verification?.user.name || "N/A"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {payout.verification?.user.email || ""}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-700">
                          {payout.verification?.subscription?.plan?.name ||
                            payout.description}
                        </td>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-900">
                          £{payout.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              payout.status === "PAID"
                                ? "bg-green-100 text-green-800"
                                : payout.status === "PENDING" ||
                                  payout.status === "PROCESSING"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {payout.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalPayouts > 10 && (
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Showing {(payoutsPage - 1) * 10 + 1} to{" "}
                      {Math.min(payoutsPage * 10, totalPayouts)} of{" "}
                      {totalPayouts}
                    </p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() =>
                          setPayoutsPage((p) => Math.max(1, p - 1))
                        }
                        disabled={payoutsPage === 1}
                        className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPayoutsPage((p) => p + 1)}
                        disabled={payoutsPage * 10 >= totalPayouts}
                        className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No payout history yet</p>
                <p className="text-sm">
                  Payouts will appear here when customers use your services
                </p>
              </div>
            )}
          </div>
        )}

        {/* Monthly Breakdown */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Monthly Breakdown
            </h3>
            <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>

          <div className="space-y-4">
            {monthlyBreakdown.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center text-xl">
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.type}</p>
                    {item.count && (
                      <p className="text-sm text-gray-500">
                        {item.count} active
                      </p>
                    )}
                    {item.description && (
                      <p className="text-sm text-gray-500">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
                <p
                  className={`text-lg font-semibold ${
                    item.amount < 0 ? "text-red-600" : "text-gray-900"
                  }`}
                >
                  {item.amount < 0 ? "-" : ""}£
                  {Math.abs(item.amount).toFixed(2)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200 flex items-center justify-between">
            <p className="text-lg font-semibold text-gray-900">
              Net Earnings (This Month)
            </p>
            <p className="text-2xl font-bold text-gray-900">
              £{stats.pendingPayout.toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerPayoutsPage;
