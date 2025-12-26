import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, ShoppingCart, Loader2 } from "lucide-react";
import { authenticatedFetch } from "../config/api";

interface ExtraService {
  id: number;
  name: string;
  description: string;
  price: number;
  type: string;
}

interface Purchase {
  id: number;
  status: string;
  createdAt: string;
  service: ExtraService;
  qrCode?: {
    code: string;
    expiresAt: string;
  };
}

const ExtraServicesPage: React.FC = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState<ExtraService[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [servicesRes, purchasesRes] = await Promise.all([
        authenticatedFetch("/extra-services"),
        authenticatedFetch("/extra-services/purchases"),
      ]);

      if (!servicesRes.ok || !purchasesRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const servicesData = await servicesRes.json();
      const purchasesData = await purchasesRes.json();

      setServices(servicesData);
      setPurchases(purchasesData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (service: ExtraService) => {
    try {
      setProcessingId(service.id);

      // Create payment intent
      const response = await authenticatedFetch(
        "/extra-services/create-payment-intent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            serviceId: service.id,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create payment intent");
      }

      const data = await response.json();

      // Navigate to checkout with client secret and purchase details
      navigate("/app/checkout", {
        state: {
          clientSecret: data.clientSecret,
          purchaseId: data.purchaseId,
          amount: service.price,
          description: service.name,
          isExtraService: true,
        },
      });
    } catch (error) {
      console.error("Error initiating purchase:", error);
      alert("Failed to start purchase process. Please try again.");
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Extra Services</h1>
        <p className="mt-2 text-gray-600">
          Purchase one-time washes when you've used your subscription quota.
        </p>
      </div>

      {/* Available Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {services.map((service) => (
          <div
            key={service.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Package className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {service.name}
              </h3>
              <p className="text-gray-500 text-sm mb-4 min-h-[40px]">
                {service.description}
              </p>
              <div className="flex items-baseline mb-6">
                <span className="text-2xl font-bold text-gray-900">
                  £{service.price.toFixed(2)}
                </span>
                <span className="text-gray-500 ml-1">/ wash</span>
              </div>
              <button
                onClick={() => handlePurchase(service)}
                disabled={processingId === service.id}
                className="w-full flex items-center justify-center space-x-2 bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingId === service.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    <span>Purchase Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Past Purchases */}
      {purchases.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Purchase History
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {purchases.map((purchase) => (
                    <tr key={purchase.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-500" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {purchase.service.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              £{purchase.service.price.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(purchase.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Completed
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {purchase.status === "COMPLETED" && !purchase.qrCode ? (
                          <span className="text-gray-400">Used</span>
                        ) : (
                          <button
                            onClick={() => {
                              if (purchase.qrCode) {
                                navigate(
                                  `/app/service-status/${purchase.qrCode.code}`
                                );
                              } else {
                                navigate("/app/qr-code");
                              }
                            }}
                            className="text-orange-600 hover:text-orange-900 font-medium"
                          >
                            View Status
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExtraServicesPage;
