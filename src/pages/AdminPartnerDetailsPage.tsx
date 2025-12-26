import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getApiUrl } from "../config/api";
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  MapPin,
  Clock,
  Briefcase,
  CreditCard,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Hash,
  Image as ImageIcon,
} from "lucide-react";

interface Location {
  id: number;
  name: string;
  postcode: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  county: string | null;
  country: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  hours: string | null;
  isPrimary: boolean;
  active: boolean;
}

interface Partner {
  id: number;
  name: string;
  tradingName: string | null;
  companyRegistrationNumber: string | null;
  contactPersonName: string | null;
  email: string;
  phone: string | null;
  openingHours: string | null;
  servicesOffered: string | null;
  businessPhoto: string | null;
  status: "PENDING" | "ACTIVE" | "INACTIVE" | "REJECTED";
  stripeAccountId: string | null;
  createdAt: string;
  updatedAt: string;
  locations: Location[];
  _count: {
    verifications: number;
  };
}

const AdminPartnerDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetchPartnerDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(getApiUrl(`admin/partners/${id}`), {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch partner details");
        }

        setPartner(data.partner);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPartnerDetails();
  }, [id]);

  const approvePartner = async () => {
    try {
      setActionLoading(true);
      const response = await fetch(getApiUrl(`admin/partners/${id}/approve`), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to approve partner");

      // Manually refresh data instead of recursive call
      const refreshResponse = await fetch(getApiUrl(`admin/partners/${id}`), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const refreshData = await refreshResponse.json();
      if (refreshResponse.ok) {
        setPartner(refreshData.partner);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const rejectPartner = async () => {
    try {
      setActionLoading(true);
      const response = await fetch(getApiUrl(`admin/partners/${id}/reject`), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to reject partner");

      // Manually refresh data
      const refreshResponse = await fetch(getApiUrl(`admin/partners/${id}`), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const refreshData = await refreshResponse.json();
      if (refreshResponse.ok) {
        setPartner(refreshData.partner);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const updateStatus = async (
    newStatus: "ACTIVE" | "INACTIVE" | "REJECTED"
  ) => {
    if (!id) return;
    try {
      setActionLoading(true);
      const response = await fetch(getApiUrl(`admin/partners/${id}/status`), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to update status");
      // Refresh partner details
      const refreshResponse = await fetch(getApiUrl(`admin/partners/${id}`), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const refreshData = await refreshResponse.json();
      if (refreshResponse.ok) {
        setPartner(refreshData.partner);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-800 border-green-200";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      case "INACTIVE":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <CheckCircle className="w-5 h-5" />;
      case "PENDING":
        return <AlertCircle className="w-5 h-5" />;
      case "REJECTED":
        return <XCircle className="w-5 h-5" />;
      case "INACTIVE":
        return <XCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading partner details...</p>
        </div>
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <XCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Error Loading Partner
          </h3>
          <p className="text-red-800 mb-4">{error || "Partner not found"}</p>
          <button
            onClick={() => navigate("/admin/partners")}
            className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Partners
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/admin/partners")}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Partners
        </button>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-orange-600 font-bold text-2xl">
                {partner.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {partner.name}
              </h1>
              {partner.tradingName && (
                <p className="text-gray-500 text-sm">
                  Trading as: {partner.tradingName}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                    partner.status
                  )}`}
                >
                  {getStatusIcon(partner.status)}
                  {partner.status}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {partner.status === "PENDING" && (
              <>
                <button
                  onClick={approvePartner}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-5 h-5" />
                  Approve
                </button>
                <button
                  onClick={rejectPartner}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <XCircle className="w-5 h-5" />
                  Reject
                </button>
              </>
            )}

            {partner.status === "ACTIVE" && (
              <button
                onClick={() => updateStatus("INACTIVE")}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
              >
                <AlertCircle className="w-5 h-5" />
                Deactivate
              </button>
            )}

            {(partner.status === "INACTIVE" ||
              partner.status === "REJECTED") && (
              <button
                onClick={() => updateStatus("ACTIVE")}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                <CheckCircle className="w-5 h-5" />
                Reactivate
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Business Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Building className="w-5 h-5 text-orange-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Business Information
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem label="Business Name" value={partner.name} />
              <InfoItem label="Trading Name" value={partner.tradingName} />
              <InfoItem
                label="Company Registration Number"
                value={partner.companyRegistrationNumber}
                icon={<Hash className="w-4 h-4" />}
              />
              <InfoItem label="Status" value={partner.status} />
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-orange-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Contact Information
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem
                label="Contact Person"
                value={partner.contactPersonName}
                icon={<User className="w-4 h-4" />}
              />
              <InfoItem
                label="Email"
                value={partner.email}
                icon={<Mail className="w-4 h-4" />}
              />
              <InfoItem
                label="Phone"
                value={partner.phone}
                icon={<Phone className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* Business Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Briefcase className="w-5 h-5 text-orange-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Business Details
              </h2>
            </div>
            <div className="space-y-4">
              {partner.openingHours && (
                <InfoItem
                  label="Opening Hours"
                  value={partner.openingHours}
                  icon={<Clock className="w-4 h-4" />}
                  fullWidth
                  multiline
                />
              )}
              {partner.servicesOffered && (
                <InfoItem
                  label="Services Offered"
                  value={partner.servicesOffered}
                  icon={<Briefcase className="w-4 h-4" />}
                  fullWidth
                  multiline
                />
              )}
              {!partner.openingHours && !partner.servicesOffered && (
                <p className="text-gray-500 text-sm italic">
                  No business details provided
                </p>
              )}
            </div>
          </div>

          {/* Payout Information */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-orange-600" />
              <h2 className="text-xl font-semibold text-gray-900">
                Payout Setup
              </h2>
            </div>
            {partner.stripeAccountId ? (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-purple-900">
                      Stripe Connect Active
                    </h3>
                    <p className="text-xs text-purple-700 font-mono mt-1">
                      ID: {partner.stripeAccountId}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <AlertCircle className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      No Payout Method
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Partner has not connected Stripe yet.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Statistics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Statistics
            </h2>
            <div className="space-y-4">
              <StatItem
                label="Locations"
                value={partner.locations?.length || 0}
              />
              <StatItem
                label="Verifications"
                value={partner._count.verifications}
              />
            </div>
          </div>

          {/* Timestamps */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-orange-600" />
              <h2 className="text-lg font-semibold text-gray-900">Timeline</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">
                  Application Submitted
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(partner.createdAt).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Last Updated</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(partner.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Locations */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Locations ({partner.locations.length})
                </h2>
              </div>
            </div>

            {partner.locations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MapPin className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No locations added yet</p>
                <p className="text-sm mt-1">
                  Locations will appear here after partner approval
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {partner.locations.map((location) => (
                  <div
                    key={location.id}
                    className={`p-4 rounded-lg border-2 ${
                      location.isPrimary
                        ? "border-orange-200 bg-orange-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                          {location.name}
                          {location.isPrimary && (
                            <span className="px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                              Primary
                            </span>
                          )}
                        </h3>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          location.active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {location.active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="text-sm text-gray-700 space-y-1">
                      <p>{location.addressLine1}</p>
                      {location.addressLine2 && <p>{location.addressLine2}</p>}
                      <p>
                        {location.city}
                        {location.county && `, ${location.county}`}
                      </p>
                      <p className="font-medium">{location.postcode}</p>
                      <p className="text-gray-500">{location.country}</p>
                    </div>

                    {(location.phone || location.hours) && (
                      <div className="mt-3 pt-3 border-t border-gray-200 text-sm space-y-1">
                        {location.phone && (
                          <p className="text-gray-600">📞 {location.phone}</p>
                        )}
                        {location.hours && (
                          <p className="text-gray-600">🕒 {location.hours}</p>
                        )}
                      </div>
                    )}

                    <div className="mt-2 text-xs text-gray-500">
                      📍 {location.latitude.toFixed(6)},{" "}
                      {location.longitude.toFixed(6)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Business Photo */}
          {partner.businessPhoto && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-5 h-5 text-orange-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Business Photo
                </h2>
              </div>
              <img
                src={partner.businessPhoto}
                alt="Business"
                className="w-full h-auto rounded-lg"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper Components
const InfoItem: React.FC<{
  label: string;
  value: string | null | undefined;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  multiline?: boolean;
  masked?: boolean;
}> = ({ label, value, icon, fullWidth, multiline, masked }) => {
  const displayValue = () => {
    if (!value)
      return <span className="text-gray-400 italic">Not provided</span>;
    if (masked && value.length > 4) {
      return `****${value.slice(-4)}`;
    }
    return value;
  };

  return (
    <div className={fullWidth ? "col-span-full" : ""}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {label}
        </p>
      </div>
      {multiline ? (
        <p className="text-sm text-gray-900 whitespace-pre-line">
          {displayValue()}
        </p>
      ) : (
        <p className="text-sm font-medium text-gray-900">{displayValue()}</p>
      )}
    </div>
  );
};

const StatItem: React.FC<{ label: string; value: number }> = ({
  label,
  value,
}) => {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-600">{label}</span>
      <span className="text-lg font-bold text-orange-600">{value}</span>
    </div>
  );
};

export default AdminPartnerDetailsPage;
