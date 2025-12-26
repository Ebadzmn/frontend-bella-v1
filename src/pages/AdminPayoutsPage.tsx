import React, { useState, useEffect } from "react";
import {
  Search,
  MoreVertical,
  CheckCircle,
  XCircle,
  Trash2,
  Download,
  AlertCircle,
  CreditCard,
} from "lucide-react";
import { getApiUrl } from "../config/api";
import { toast } from "react-hot-toast";

interface Payout {
  id: number;
  amount: number;
  status: "PENDING" | "PAID" | "FAILED";
  createdAt: string;
  processedAt: string | null;
  partner: {
    id: number;
    name: string;
    email: string;
    stripeAccountId?: string | null;
  };
}

const AdminPayoutsPage: React.FC = () => {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showActionsMenu, setShowActionsMenu] = useState<number | null>(null);

  // Modal States
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [autoPayoutEnabled, setAutoPayoutEnabled] = useState(false);

  const fetchSettings = async () => {
    try {
      const response = await fetch(getApiUrl("admin/settings/auto-payout"), {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAutoPayoutEnabled(data.enabled);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    }
  };

  const handleToggleAutoPayout = async () => {
    try {
      const newValue = !autoPayoutEnabled;
      const response = await fetch(getApiUrl("admin/settings/auto-payout"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ enabled: newValue }),
      });

      if (response.ok) {
        setAutoPayoutEnabled(newValue);
        toast.success(`Auto Payout ${newValue ? "Enabled" : "Disabled"}`);
      } else {
        throw new Error("Failed to update setting");
      }
    } catch (error) {
      toast.error("Failed to update auto payout setting");
    }
  };

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchQuery) params.append("search", searchQuery);
      if (statusFilter !== "all") params.append("status", statusFilter);

      const response = await fetch(getApiUrl(`admin/payouts?${params}`), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch payouts");

      const data = await response.json();
      setPayouts(data.payouts || []);
    } catch (error) {
      console.error("Error fetching payouts:", error);
      toast.error("Failed to load payouts");
      setPayouts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts();
    fetchSettings();
  }, [statusFilter, searchQuery]);

  const handleApprove = async (id: number) => {
    try {
      setProcessingId(id);
      const response = await fetch(getApiUrl(`admin/payouts/${id}/approve`), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to approve payout");

      toast.success("Payout approved successfully");
      fetchPayouts();
    } catch (error) {
      console.error("Error approving payout:", error);
      toast.error("Failed to approve payout");
    } finally {
      setProcessingId(null);
      setShowActionsMenu(null);
    }
  };

  const handleMarkPaid = async (id: number) => {
    try {
      if (!confirm("Are you sure you want to manually mark this payout as PAID? This will NOT transfer funds via Stripe.")) return;

      setProcessingId(id);
      const response = await fetch(getApiUrl(`admin/payouts/${id}/mark-paid`), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to mark payout as paid");

      toast.success("Payout marked as paid manually");
      fetchPayouts();
    } catch (error) {
      console.error("Error marking payout as paid:", error);
      toast.error("Failed to mark payout as paid");
    } finally {
      setProcessingId(null);
      setShowActionsMenu(null);
    }
  };

  const handleReject = async (id: number) => {
    try {
      setProcessingId(id);
      const response = await fetch(getApiUrl(`admin/payouts/${id}/reject`), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to reject payout");

      toast.success("Payout rejected");
      fetchPayouts();
    } catch (error) {
      console.error("Error rejecting payout:", error);
      toast.error("Failed to reject payout");
    } finally {
      setProcessingId(null);
      setShowActionsMenu(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedPayout) return;

    try {
      const response = await fetch(
        getApiUrl(`admin/payouts/${selectedPayout.id}`),
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) throw new Error("Failed to delete payout");

      toast.success("Payout deleted successfully");
      fetchPayouts();
      setShowDeleteModal(false);
      setSelectedPayout(null);
    } catch (error) {
      console.error("Error deleting payout:", error);
      toast.error("Failed to delete payout");
    }
  };

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
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "FAILED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payouts</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage partner payouts and withdrawals
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-gray-300 shadow-sm">
            <span className="text-sm font-medium text-gray-700">
              Auto Payout
            </span>
            <button
              onClick={handleToggleAutoPayout}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${autoPayoutEnabled ? "bg-blue-600" : "bg-gray-200"
                }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${autoPayoutEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
              />
            </button>
          </div>
          <button
            onClick={async () => {
              if (!confirm("Add £1000 test funds to platform balance?")) return;
              try {
                const response = await fetch(
                  getApiUrl("admin/payouts/test-topup"),
                  {
                    method: "POST",
                    headers: {
                      Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                  }
                );
                const data = await response.json();
                if (data.success) {
                  toast.success("Added £1000 test funds successfully");
                } else {
                  toast.error(data.error || "Failed to add funds");
                }
              } catch (err) {
                toast.error("Failed to add funds");
              }
            }}
            className="flex items-center px-4 py-2 bg-purple-600 text-white border border-transparent rounded-lg shadow-sm text-sm font-medium hover:bg-purple-700"
          >
            <CreditCard className="w-4 h-4 mr-2" />
            Add Test Funds
          </button>
          <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by partner name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <div className="sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="FAILED">Failed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Partner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payout Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    </div>
                  </td>
                </tr>
              ) : payouts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No payouts found matching your filters
                  </td>
                </tr>
              ) : (
                payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                            {payout.partner.name[0].toUpperCase()}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {payout.partner.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {payout.partner.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">
                        {formatCurrency(payout.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {payout.partner.stripeAccountId ? (
                        <div>
                          <div className="text-sm font-medium text-purple-700 flex items-center gap-1">
                            <span>Stripe Connect</span>
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {payout.partner.stripeAccountId}
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500 italic">
                          No payout method
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                          payout.status
                        )}`}
                      >
                        {payout.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(payout.createdAt)}
                      </div>
                      {payout.processedAt && (
                        <div className="text-xs text-gray-500">
                          Processed: {formatDate(payout.processedAt)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() =>
                            setShowActionsMenu(
                              showActionsMenu === payout.id ? null : payout.id
                            )
                          }
                          className="text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {showActionsMenu === payout.id && (
                          <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1" role="menu">
                              {payout.status === "PENDING" && (
                                <>
                                  <button
                                    onClick={() => handleApprove(payout.id)}
                                    disabled={processingId === payout.id}
                                    className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 flex items-center"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Approve Payout
                                  </button>
                                  <button
                                    onClick={() => handleMarkPaid(payout.id)}
                                    disabled={processingId === payout.id}
                                    className="w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 flex items-center"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Mark Paid (Manual)
                                  </button>
                                  <button
                                    onClick={() => handleReject(payout.id)}
                                    disabled={processingId === payout.id}
                                    className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Reject Payout
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => {
                                  setSelectedPayout(payout);
                                  setShowDeleteModal(true);
                                  setShowActionsMenu(null);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Record
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPayout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
              Delete Payout Record
            </h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              Are you sure you want to delete this payout record for{" "}
              {selectedPayout.partner.name}? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayoutsPage;
