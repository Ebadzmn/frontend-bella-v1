import React, { useState, useEffect, useCallback } from "react";
import { Download, CreditCard, Check, Star } from "lucide-react";
import { getApiUrl } from "../config/api";
import { useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  duration: number;
  quota: number;
  active: boolean;
  vehicleType?: "CAR" | "TAXI" | "VAN";
  tier?: "BASE" | "STANDARD" | "PREMIUM";
  inAndOutQuota?: number;
  outsideOnlyQuota?: number;
  inAndOutPayout?: number;
  outsideOnlyPayout?: number;
  createdAt: string;
  updatedAt: string;
}

interface Subscription {
  id: number;
  status: string;
  startDate: string;
  endDate: string;
  washesUsed: number;
  plan: Plan;
  cancelAtPeriodEnd?: boolean;
  canceledAt?: string;
  remainingDays?: number;
  isCanceled?: boolean;
  inAndOutWashesUsed?: number;
  outsideOnlyWashesUsed?: number;
}

interface Invoice {
  id: number;
  amount: number;
  currency: string;
  status: string;
  created: number;
  dueDate: number | null;
  paidAt: number | null;
  invoiceUrl: string | null;
  invoicePdf: string | null;
  description: string;
}

const BillingPage: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [currentSubscription, setCurrentSubscription] =
    useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "plans" | "subscription" | "billing"
  >("plans");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch plans - filter by user's vehicle type if available
      const vehicleTypeParam = user?.vehicleType
        ? `?vehicleType=${user.vehicleType}`
        : "";
      const plansResponse = await fetch(
        getApiUrl(`billing/plans${vehicleTypeParam}`)
      );
      const plansData = await plansResponse.json();
      setPlans(plansData.plans);

      // Fetch current subscription
      const subscriptionResponse = await fetch(
        getApiUrl("subscriptions/current"),
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (subscriptionResponse.ok) {
        const subscriptionData = await subscriptionResponse.json();
        console.log("Current subscription data:", subscriptionData);
        setCurrentSubscription(subscriptionData.data);
      }

      // Fetch billing history
      const invoicesResponse = await fetch(getApiUrl("billing/invoices"), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (invoicesResponse.ok) {
        const invoicesData = await invoicesResponse.json();
        setInvoices(invoicesData.invoices);
      }
    } catch (err) {
      setError("Failed to load billing data");
      console.error("Error fetching billing data:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();

    // Check if user navigated from Dashboard Cancel button
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      // Clear the state to prevent it from persisting on refresh
      window.history.replaceState({}, "", window.location.pathname);
    }

    // Check if user just subscribed (from checkout redirect)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("subscribed") === "true") {
      // Show success message and switch to subscription tab
      setSuccessMessage("🎉 Subscription successful! Your plan is now active.");
      setTimeout(() => {
        setActiveTab("subscription");
        // Clean up URL
        window.history.replaceState({}, "", "/app/billing");
      }, 500);

      // Hide success message after 5 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    }
  }, [fetchData, location]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const formatCurrency = (amount: number, currency: string = "GBP") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const handleSelectPlan = async (planId: number) => {
    try {
      if (currentSubscription) {
        // Take confirmation before switching plans
        if (
          !confirm(
            "Are you sure you want to switch plans? By selecting OK, your current subscription will be replaced. And your selected card will be charged pro-rata for the new plan."
          )
        ) {
          return;
        }

        // Upgrade/downgrade existing subscription
        const response = await fetch(getApiUrl("billing/upgrade"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ newPlanId: planId }),
        });

        if (response.ok) {
          alert("Subscription updated successfully!");
          fetchData();
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.error}`);
        }
      } else {
        // Create new subscription - redirect to checkout
        window.location.href = `/app/checkout?planId=${planId}`;
      }
    } catch (err) {
      console.error("Error selecting plan:", err);
      alert("Failed to process request");
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) {
      return;
    }

    try {
      const response = await fetch(getApiUrl("billing/cancel"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        alert("Subscription cancelled successfully");
        fetchData();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (err) {
      console.error("Error cancelling subscription:", err);
      alert("Failed to cancel subscription");
    }
  };

  const getPlanFeatures = (plan: Plan) => {
    const features = [
      plan.inAndOutQuota
        ? `${plan.inAndOutQuota} In & Out washes per month`
        : "No In & Out washes",
      ...(plan.outsideOnlyQuota
        ? [`${plan.outsideOnlyQuota} Outside Only washes per month`]
        : []),
      `${plan.duration} days validity`,
      "QR code verification",
      "Mobile app access",
    ];

    if (plan.quota >= 8) {
      features.push("Priority support");
    }
    if (plan.quota === 999) {
      features.push("VIP treatment");
      features.push("Premium locations");
    }

    return features;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Billing & Subscription
          </h1>
          <p className="mt-2 text-gray-600">
            Manage your subscription and billing information
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium">{successMessage}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("plans")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "plans"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Subscription Plans
            </button>
            <button
              onClick={() => setActiveTab("subscription")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "subscription"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Current Subscription
            </button>
            <button
              onClick={() => setActiveTab("billing")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "billing"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Billing History
            </button>
          </nav>
        </div>

        {/* Plans Tab */}
        {activeTab === "plans" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            {plans.map((plan, index) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-xl shadow-lg ${
                  currentSubscription?.plan.id === plan.id
                    ? "ring-2 ring-blue-500 ring-opacity-50"
                    : ""
                } ${index === 1 ? "md:scale-105 md:z-10" : ""}`}
              >
                {index === 1 && (
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center">
                      <Star className="w-4 h-4 mr-1" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {plan.name}
                    </h3>
                    <p className="mt-2 text-gray-600">{plan.description}</p>
                    <div className="mt-6">
                      <span className="text-4xl font-bold text-gray-900">
                        £{plan.price}
                      </span>
                      <span className="text-lg text-gray-600">/month</span>
                    </div>
                  </div>

                  <div className="mt-8">
                    <ul className="space-y-4">
                      {getPlanFeatures(plan).map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start">
                          <Check className="flex-shrink-0 w-5 h-5 text-green-500 mt-0.5" />
                          <span className="ml-3 text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8">
                    <button
                      onClick={() => handleSelectPlan(plan.id)}
                      disabled={currentSubscription?.plan.id === plan.id}
                      className={`w-full py-3 px-6 rounded-lg font-semibold text-center transition-colors ${
                        currentSubscription?.plan.id === plan.id
                          ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                          : index === 1
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-gray-900 text-white hover:bg-gray-800"
                      }`}
                    >
                      {currentSubscription?.plan.id === plan.id
                        ? "Current Plan"
                        : currentSubscription
                        ? "Switch to This Plan"
                        : "Get Started"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Current Subscription Tab */}
        {activeTab === "subscription" && (
          <div className="bg-white rounded-lg shadow-md p-8">
            {currentSubscription ? (
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Current Subscription
                </h3>

                {/* Cancellation Notice */}
                {currentSubscription.cancelAtPeriodEnd && (
                  <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          className="h-5 w-5 text-yellow-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">
                          Subscription Scheduled for Cancellation
                        </h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>
                            Your subscription will end on{" "}
                            <strong>
                              {new Date(
                                currentSubscription.endDate
                              ).toLocaleDateString()}
                            </strong>
                            .
                            {currentSubscription.remainingDays && (
                              <span>
                                {" "}
                                You have{" "}
                                <strong>
                                  {currentSubscription.remainingDays} days
                                </strong>{" "}
                                remaining.
                              </span>
                            )}
                          </p>
                          <p className="mt-1">
                            You'll continue to have access to all features until
                            then.
                          </p>
                          {currentSubscription.canceledAt && (
                            <p className="mt-1 text-xs">
                              Cancellation requested on{" "}
                              {new Date(
                                currentSubscription.canceledAt
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="mt-4">
                          <button
                            onClick={() => {
                              alert(
                                "Reactivation feature coming soon! Please contact support."
                              );
                            }}
                            className="text-sm font-medium text-yellow-800 hover:text-yellow-900 underline"
                          >
                            Reactivate Subscription →
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                      <h4 className="text-xl font-semibold">
                        {currentSubscription.plan.name}
                      </h4>
                      <p className="mt-2 opacity-90">
                        {currentSubscription.plan.description}
                      </p>
                      <div className="mt-4 text-2xl font-bold">
                        £{currentSubscription.plan.price}/month
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            currentSubscription.status === "ACTIVE"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {currentSubscription.status}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Started:</span>
                        <span className="font-medium">
                          {new Date(
                            currentSubscription.startDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Expires:</span>
                        <span className="font-medium">
                          {new Date(
                            currentSubscription.endDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Usage Statistics
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-gray-600">
                              Total Washes Used
                            </span>
                            <span className="font-medium">
                              {(currentSubscription.inAndOutWashesUsed || 0) +
                                (currentSubscription.outsideOnlyWashesUsed ||
                                  0)}{" "}
                              /
                              {(currentSubscription.plan.inAndOutQuota || 0) +
                                (currentSubscription.plan.outsideOnlyQuota ||
                                  0)}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{
                                width: `${Math.min(
                                  (((currentSubscription.inAndOutWashesUsed ||
                                    0) +
                                    (currentSubscription.outsideOnlyWashesUsed ||
                                      0)) /
                                    ((currentSubscription.plan.inAndOutQuota ||
                                      0) +
                                      (currentSubscription.plan
                                        .outsideOnlyQuota || 0))) *
                                    100,
                                  100
                                )}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                          <div>
                            <div className="text-sm text-gray-500 mb-1">
                              In & Out
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-gray-600">
                                Used:
                              </span>
                              <span className="font-medium text-blue-600">
                                {currentSubscription.inAndOutWashesUsed || 0}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-gray-600">
                                Remaining:
                              </span>
                              <span className="font-medium text-green-600">
                                {(currentSubscription.plan.inAndOutQuota || 0) -
                                  (currentSubscription.inAndOutWashesUsed || 0)}
                              </span>
                            </div>
                          </div>
                          {currentSubscription.plan.outsideOnlyQuota &&
                            currentSubscription.plan.outsideOnlyQuota > 0 && (
                              <div>
                                <div className="text-sm text-gray-500 mb-1">
                                  Outside Only
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-gray-600">
                                    Used:
                                  </span>
                                  <span className="font-medium text-blue-600">
                                    {currentSubscription.outsideOnlyWashesUsed ||
                                      0}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-xs text-gray-600">
                                    Remaining:
                                  </span>
                                  <span className="font-medium text-green-600">
                                    {(currentSubscription.plan
                                      .outsideOnlyQuota || 0) -
                                      (currentSubscription.outsideOnlyWashesUsed ||
                                        0)}
                                  </span>
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>

                    {currentSubscription.status === "ACTIVE" && (
                      <button
                        onClick={handleCancelSubscription}
                        className="mt-6 w-full bg-red-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
                      >
                        Cancel Subscription
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <CreditCard className="mx-auto h-16 w-16 text-gray-400" />
                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                  No Active Subscription
                </h3>
                <p className="mt-2 text-gray-600 max-w-md mx-auto">
                  Subscribe to one of our plans to start using our car wash
                  services and enjoy convenient, high-quality cleaning.
                </p>
                <button
                  onClick={() => setActiveTab("plans")}
                  className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Browse Plans
                </button>
              </div>
            )}
          </div>
        )}

        {/* Billing History Tab */}
        {activeTab === "billing" && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">
                Billing History
              </h3>
              <p className="mt-1 text-gray-600">
                View and download your payment history
              </p>
            </div>

            {invoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {invoices.map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(invoice.created)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {invoice.description}
                          </div>
                          <div className="text-sm text-gray-500">
                            Monthly subscription
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(invoice.amount, invoice.currency)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              invoice.status === "paid"
                                ? "bg-green-100 text-green-800"
                                : invoice.status === "open"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {invoice.status.charAt(0).toUpperCase() +
                              invoice.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex space-x-3">
                            {invoice.invoiceUrl && (
                              <a
                                href={invoice.invoiceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 font-medium"
                              >
                                View
                              </a>
                            )}
                            {invoice.invoicePdf && (
                              <a
                                href={invoice.invoicePdf}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 font-medium flex items-center"
                              >
                                <Download className="w-4 h-4 mr-1" />
                                Download
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-12 text-center">
                <Download className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No billing history
                </h3>
                <p className="mt-2 text-gray-600">
                  Your billing history will appear here once you make your first
                  payment.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingPage;
