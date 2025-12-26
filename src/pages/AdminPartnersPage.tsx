import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getApiUrl } from "../config/api";
import {
  Users,
  Plus,
  Search,
  // Filter,
  // Edit,
  // Trash2,
  Key,
  MoreVertical,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";

interface Partner {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: "PENDING" | "ACTIVE" | "INACTIVE" | "REJECTED";
  createdAt: string;
  updatedAt: string;
  _count: {
    locations: number;
    verifications: number;
  };
}

const AdminPartnersPage: React.FC = () => {
  const navigate = useNavigate();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | "PENDING" | "ACTIVE" | "INACTIVE" | "REJECTED"
  >("ALL");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  const toggleMenu = (partnerId: number) => {
    if (activeMenuId === partnerId) {
      setActiveMenuId(null);
    } else {
      setActiveMenuId(partnerId);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeMenuId !== null && !(event.target as Element).closest('.action-menu-container')) {
        setActiveMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeMenuId]);

  const updatePartnerStatus = async (partnerId: number, newStatus: string) => {
    if (!window.confirm(`Are you sure you want to change status to ${newStatus}?`)) return;

    try {
      setActionLoadingId(partnerId);
      const response = await fetch(getApiUrl(`admin/partners/${partnerId}/status`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      await refreshPartners();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoadingId(null);
      setActiveMenuId(null);
    }
  };

  // Delete partner functionality is intentionally removed from the UI.

  const approvePartner = (id: number) => updatePartnerStatus(id, 'ACTIVE');
  const rejectPartner = (id: number) => updatePartnerStatus(id, 'REJECTED');

  useEffect(() => {
    const fetchPartners = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (statusFilter !== "ALL") params.append("status", statusFilter);
        if (searchQuery) params.append("search", searchQuery);

        const response = await fetch(getApiUrl(`admin/partners?${params}`), {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch partners");
        }

        setPartners(data.partners);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, [statusFilter, searchQuery]);

  // Separate function for manual refresh without changing dependencies
  const refreshPartners = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.append("status", statusFilter);
      if (searchQuery) params.append("search", searchQuery);

      const response = await fetch(getApiUrl(`admin/partners?${params}`), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch partners");
      }

      setPartners(data.partners);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Partner Management
        </h1>
        <p className="text-gray-600">Create and manage partner accounts</p>
      </div>

      {/* Actions Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Filter / Tabs */}
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter("PENDING")}
            className={`px-3 py-2 rounded-lg ${statusFilter === "PENDING"
              ? "bg-orange-600 text-white"
              : "bg-white border border-gray-200"
              }`}
          >
            New Applications
          </button>
          <button
            onClick={() => setStatusFilter("ACTIVE")}
            className={`px-3 py-2 rounded-lg ${statusFilter === "ACTIVE"
              ? "bg-orange-600 text-white"
              : "bg-white border border-gray-200"
              }`}
          >
            Approved Partners
          </button>
          <button
            onClick={() => setStatusFilter("REJECTED")}
            className={`px-3 py-2 rounded-lg ${statusFilter === "REJECTED"
              ? "bg-orange-600 text-white"
              : "bg-white border border-gray-200"
              }`}
          >
            Rejected Partners
          </button>
          <button
            onClick={() => setStatusFilter("INACTIVE")}
            className={`px-3 py-2 rounded-lg ${statusFilter === "INACTIVE"
              ? "bg-orange-600 text-white"
              : "bg-white border border-gray-200"
              }`}
          >
            Inactive
          </button>
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-2 rounded-lg ${statusFilter === "ALL"
              ? "bg-orange-600 text-white"
              : "bg-white border border-gray-200"
              }`}
          >
            All
          </button>
        </div>

        {/* Create Button */}
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center space-x-2 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Create Partner</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Partners Table */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600">Loading partners...</p>
        </div>
      ) : partners.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Partners Found
          </h3>
          <p className="text-gray-600 mb-4">
            Get started by creating your first partner account
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center space-x-2 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Partner</span>
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-visible">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Partner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Locations
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verifications
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {partners.map((partner) => (
                <tr key={partner.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 font-semibold">
                          {partner.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {partner.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {partner.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {partner.phone || "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${partner.status === "ACTIVE"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                        }`}
                    >
                      {partner.status === "ACTIVE" ? (
                        <CheckCircle className="w-3 h-3 mr-1" />
                      ) : (
                        <XCircle className="w-3 h-3 mr-1" />
                      )}
                      {partner.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {partner._count.locations}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {partner._count.verifications}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() =>
                          navigate(`/admin/partners/${partner.id}`)
                        }
                        className="text-blue-600 hover:text-blue-800"
                        title="View Details"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      {partner.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => approvePartner(partner.id)}
                            disabled={actionLoadingId === partner.id}
                            className="text-green-600 hover:text-green-800"
                            title="Approve Application"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => rejectPartner(partner.id)}
                            disabled={actionLoadingId === partner.id}
                            className="text-red-600 hover:text-red-800"
                            title="Reject Application"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => {
                          setSelectedPartner(partner);
                          setShowPasswordModal(true);
                        }}
                        className="text-orange-600 hover:text-orange-700"
                        title="Reset Password"
                      >
                        <Key className="w-5 h-5" />
                      </button>
                      <div className="relative action-menu-container">
                        <button
                          onClick={() => toggleMenu(partner.id)}
                          className="text-gray-600 hover:text-gray-900 focus:outline-none"
                          title="More Options"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>

                        {activeMenuId === partner.id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                            <div className="py-1">
                              {partner.status === 'ACTIVE' && (
                                <button
                                  onClick={() => updatePartnerStatus(partner.id, 'INACTIVE')}
                                  className="block w-full text-left px-4 py-2 text-sm text-yellow-600 hover:bg-gray-100"
                                >
                                  Deactivate Account
                                </button>
                              )}
                              {partner.status === 'INACTIVE' && (
                                <button
                                  onClick={() => updatePartnerStatus(partner.id, 'ACTIVE')}
                                  className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-100"
                                >
                                  Activate Account
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Partner Modal */}
      {showCreateModal && (
        <CreatePartnerModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={refreshPartners}
        />
      )}

      {/* Reset Password Modal */}
      {showPasswordModal && selectedPartner && (
        <ResetPasswordModal
          partner={selectedPartner}
          onClose={() => {
            setShowPasswordModal(false);
            setSelectedPartner(null);
          }}
          onSuccess={refreshPartners}
        />
      )}
    </div>
  );
};

// Create Partner Modal Component
const CreatePartnerModal: React.FC<{
  onClose: () => void;
  onSuccess: () => void;
}> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    status: "ACTIVE",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(getApiUrl("admin/partners"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create partner");
      }

      setSuccess(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="text-center mb-6">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Partner Created!
            </h3>
            <p className="text-gray-600">
              Share these credentials with the partner:
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2">
            <div>
              <span className="text-sm text-gray-600">Email:</span>
              <p className="font-mono font-semibold">
                {success.credentials.email}
              </p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Temporary Password:</span>
              <p className="font-mono font-semibold">
                {success.credentials.temporaryPassword}
              </p>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => {
                onSuccess();
                onClose();
              }}
              className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          Create New Partner
        </h3>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password *
            </label>
            <input
              type="text"
              required
              minLength={8}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Min. 8 characters"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create Partner"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Reset Password Modal Component
const ResetPasswordModal: React.FC<{
  partner: Partner;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ partner, onClose, onSuccess }) => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/admin/partners/${partner.id}/reset-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="text-center mb-6">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Password Reset!
            </h3>
            <p className="text-gray-600">
              Share the new password with {partner.name}:
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">New Password:</p>
            <p className="font-mono font-semibold text-lg">{password}</p>
          </div>

          <button
            onClick={() => {
              onSuccess();
              onClose();
            }}
            className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">
          Reset Partner Password
        </h3>

        <p className="text-gray-600 mb-4">
          Reset password for <strong>{partner.name}</strong>
        </p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password *
            </label>
            <input
              type="text"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Min. 8 characters"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminPartnersPage;
