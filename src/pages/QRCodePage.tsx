import React, { useState, useEffect } from "react";
import {
  Download,
  Maximize,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { getApiUrl } from "../config/api";

interface VerificationCode {
  id: number;
  code: string;
  qrCode: string;
  washType?: "IN_AND_OUT" | "OUTSIDE_ONLY";
  expiresAt: string;
  inAndOutRemaining?: number;
  outsideOnlyRemaining?: number;
  subscription?: {
    plan: string;
    inAndOutQuota?: number;
    outsideOnlyQuota?: number;
    inAndOutUsed?: number;
    outsideOnlyUsed?: number;
  } | null;
  oneTimePurchase?: {
    serviceName: string;
  } | null;
}

const QRCodePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentCode, setCurrentCode] = useState<VerificationCode | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [fullScreen, setFullScreen] = useState(false);
  const [showWashTypeSelection, setShowWashTypeSelection] = useState(false);
  const [selectedWashType, setSelectedWashType] = useState<
    "IN_AND_OUT" | "OUTSIDE_ONLY"
  >("IN_AND_OUT");

  useEffect(() => {
    if (location.state?.newVerificationCode) {
      setCurrentCode(location.state.newVerificationCode);
      // Clean up state history to prevent re-using on refresh (optional, but good practice)
      window.history.replaceState({}, document.title);
    } else {
      fetchCurrentCode();
    }
  }, []);

  useEffect(() => {
    if (currentCode) {
      const timer = setInterval(() => {
        const remaining = calculateTimeRemaining(currentCode.expiresAt);
        setTimeRemaining(remaining);

        // Check if expired
        if (new Date(currentCode.expiresAt) < new Date()) {
          setCurrentCode(null);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [currentCode]);

  const fetchCurrentCode = async () => {
    try {
      const response = await fetch(getApiUrl("verification/current"), {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await response.json();
      if (data.success && data.data) {
        setCurrentCode(data.data);
      }
    } catch (err) {
      console.error("Error fetching current code:", err);
    }
  };

  const generateCode = async (washType: "IN_AND_OUT" | "OUTSIDE_ONLY") => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(getApiUrl("verification/generate"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ washType }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || data.message || "Failed to generate code"
        );
      }

      setCurrentCode(data.data);
      setShowWashTypeSelection(false);
    } catch (err: any) {
      setError(err.message || "Failed to generate verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateClick = () => {
    setShowWashTypeSelection(true);
    setError(null);
  };

  const handleWashTypeSelect = (washType: "IN_AND_OUT" | "OUTSIDE_ONLY") => {
    setSelectedWashType(washType);
    console.log("Selected Wash Type:", selectedWashType);
    generateCode(washType);
  };

  const calculateTimeRemaining = (expiresAt: string): string => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff <= 0) return "Expired";

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const downloadQRCode = () => {
    if (!currentCode) return;

    const link = document.createElement("a");
    link.href = currentCode.qrCode;
    link.download = `bella-qr-${currentCode.code}.png`;
    link.click();
  };

  const toggleFullScreen = () => {
    setFullScreen(!fullScreen);
  };

  const instructions = [
    {
      step: 1,
      title: "Generate Your Code",
      description: 'Click "Generate Code" to create a new verification code',
    },
    {
      step: 2,
      title: "Visit Partner Location",
      description: "Go to any Bella car wash partner location",
    },
    {
      step: 3,
      title: "Show Your Code",
      description: "Present the QR code or text code to the attendant",
    },
    {
      step: 4,
      title: "Get Your Wash",
      description: "Enjoy your car wash service!",
    },
  ];

  if (fullScreen && currentCode) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-4 sm:p-8">
        <button
          onClick={toggleFullScreen}
          className="absolute top-4 right-4 text-white hover:text-gray-300"
        >
          <Maximize className="w-6 h-6 sm:w-8 sm:h-8" />
        </button>

        <div className="bg-white p-6 sm:p-12 rounded-2xl">
          <img
            src={currentCode.qrCode}
            alt="QR Code"
            className="w-64 h-64 sm:w-96 sm:h-96"
          />
        </div>

        <div className="mt-6 sm:mt-8 text-center text-white">
          <p className="text-2xl sm:text-4xl font-bold font-mono mb-4">
            {currentCode.code}
          </p>
          <div className="flex items-center justify-center space-x-2">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
            <span className="text-xl sm:text-2xl font-semibold">
              {timeRemaining}
            </span>
          </div>
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
            Verification Code
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Generate a code to redeem your car wash service
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* QR Code Section */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            {currentCode ? (
              <>
                <div className="text-center mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    Your Active Code
                  </h3>
                  <div className="flex items-center justify-center space-x-2 text-xs sm:text-sm text-gray-600">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>
                      Expires in:{" "}
                      <span className="font-semibold text-orange-600">
                        {timeRemaining}
                      </span>
                    </span>
                  </div>
                </div>

                {/* QR Code Display */}
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="bg-white p-4 sm:p-6 rounded-lg border-2 border-gray-200 shadow-sm">
                    <img
                      src={currentCode.qrCode}
                      alt="Verification QR Code"
                      className="w-48 h-48 sm:w-64 sm:h-64"
                    />
                  </div>
                </div>

                {/* Text Code */}
                <div className="text-center mb-4 sm:mb-6">
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">
                    Manual Entry Code:
                  </p>
                  <p className="text-2xl sm:text-3xl font-bold font-mono text-gray-900 bg-gray-50 py-2 sm:py-3 px-4 sm:px-6 rounded-lg inline-block">
                    {currentCode.code}
                  </p>
                </div>

                {/* Remaining Washes */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-medium text-blue-900">
                        Current Wash Type:
                      </span>
                      <span className="text-sm sm:text-base font-bold text-blue-600">
                        {currentCode.washType === "IN_AND_OUT"
                          ? "In & Out"
                          : "Outside Only"}
                      </span>
                    </div>
                    {currentCode.inAndOutRemaining !== undefined &&
                      currentCode.subscription && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-medium text-blue-900">
                            In & Out Remaining:
                          </span>
                          <span className="text-xl sm:text-2xl font-bold text-blue-600">
                            {currentCode.inAndOutRemaining}/
                            {currentCode.subscription.inAndOutQuota || 0}
                          </span>
                        </div>
                      )}
                    {currentCode.outsideOnlyRemaining !== undefined &&
                      currentCode.subscription &&
                      currentCode.subscription.outsideOnlyQuota &&
                      currentCode.subscription.outsideOnlyQuota > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs sm:text-sm font-medium text-blue-900">
                            Outside Only Remaining:
                          </span>
                          <span className="text-xl sm:text-2xl font-bold text-blue-600">
                            {currentCode.outsideOnlyRemaining}/
                            {currentCode.subscription.outsideOnlyQuota}
                          </span>
                        </div>
                      )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <button
                    onClick={downloadQRCode}
                    className="flex items-center justify-center space-x-2 bg-orange-500 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-orange-600 transition-colors text-sm sm:text-base"
                  >
                    <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Download</span>
                  </button>
                  <button
                    onClick={toggleFullScreen}
                    className="flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                  >
                    <Maximize className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Full Screen</span>
                  </button>
                </div>

                <button
                  onClick={() =>
                    navigate(`/app/service-status/${currentCode.code}`)
                  }
                  className="w-full mt-2 sm:mt-3 flex items-center justify-center space-x-2 bg-blue-600 text-white px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
                >
                  <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>View Service Status</span>
                </button>

                <button
                  onClick={handleGenerateClick}
                  disabled={loading}
                  className="w-full mt-2 sm:mt-3 flex items-center justify-center space-x-2 border border-orange-500 text-orange-600 px-3 sm:px-4 py-2 sm:py-3 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50 text-sm sm:text-base"
                >
                  <RefreshCw
                    className={`w-3 h-3 sm:w-4 sm:h-4 ${loading ? "animate-spin" : ""
                      }`}
                  />
                  <span>Generate New Code</span>
                </button>
              </>
            ) : showWashTypeSelection ? (
              <div className="text-center py-8 sm:py-12">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
                  Select Wash Type
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-6">
                  Choose the type of wash you want
                </p>

                <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
                  <button
                    onClick={() => handleWashTypeSelect("IN_AND_OUT")}
                    disabled={loading}
                    className="bg-blue-500 text-white px-6 py-4 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="text-lg font-semibold">In & Out Wash</div>
                    <div className="text-sm mt-1 opacity-90">
                      Full interior and exterior cleaning
                    </div>
                  </button>

                  <button
                    onClick={() => handleWashTypeSelect("OUTSIDE_ONLY")}
                    disabled={loading}
                    className="bg-green-500 text-white px-6 py-4 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="text-lg font-semibold">
                      Outside Only Wash
                    </div>
                    <div className="text-sm mt-1 opacity-90">
                      Exterior cleaning only
                    </div>
                  </button>
                </div>

                <button
                  onClick={() => setShowWashTypeSelection(false)}
                  className="mt-4 text-gray-600 hover:text-gray-800 text-sm"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="text-center py-8 sm:py-12">
                <div className="mb-4 sm:mb-6">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <RefreshCw className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">
                    No Active Code
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                    Generate a verification code to redeem your car wash service
                  </p>
                </div>

                <button
                  onClick={handleGenerateClick}
                  disabled={loading}
                  className="bg-orange-500 text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center space-x-2 text-sm sm:text-base"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Generate Code</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* How to Use Section */}
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">
                How It Works
              </h3>

              <div className="space-y-4 sm:space-y-6">
                {instructions.map((instruction) => (
                  <div
                    key={instruction.step}
                    className="flex items-start space-x-3 sm:space-x-4"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-500 text-white rounded-full flex items-center justify-center text-base sm:text-lg font-semibold flex-shrink-0">
                      {instruction.step}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                        {instruction.title}
                      </h4>
                      <p className="text-gray-600 text-xs sm:text-sm">
                        {instruction.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6">
              <h4 className="font-semibold text-yellow-900 mb-3 flex items-center text-sm sm:text-base">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Important Notes
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-yellow-800">
                <li>
                  • Each code is valid for <strong>15 minutes</strong>
                </li>
                <li>
                  • Codes can only be used <strong>once</strong>
                </li>
                <li>• Keep your screen brightness high for scanning</li>
                <li>• You can generate a new code anytime</li>
                <li>• Partners can also enter the code manually</li>
              </ul>
            </div>

            {/* Subscription/Service Info */}
            {currentCode && (
              <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
                <h4 className="font-semibold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
                  {currentCode.oneTimePurchase
                    ? "Service Details"
                    : "Your Subscription"}
                </h4>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-600">
                      {currentCode.oneTimePurchase ? "Service:" : "Plan:"}
                    </span>
                    <span className="font-semibold">
                      {currentCode.oneTimePurchase
                        ? currentCode.oneTimePurchase.serviceName
                        : currentCode.subscription?.plan}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm sm:text-base">
                    <span className="text-gray-600">Member:</span>
                    <span className="font-semibold">{user?.name}</span>
                  </div>

                  {/* Only show quotas for subscription */}
                  {currentCode.subscription && (
                    <>
                      {currentCode.subscription.inAndOutQuota !== undefined && (
                        <div className="flex justify-between text-sm sm:text-base">
                          <span className="text-gray-600">In & Out Used:</span>
                          <span className="font-semibold">
                            {currentCode.subscription.inAndOutUsed} /{" "}
                            {currentCode.subscription.inAndOutQuota}
                          </span>
                        </div>
                      )}
                      {currentCode.subscription.outsideOnlyQuota !==
                        undefined &&
                        currentCode.subscription.outsideOnlyQuota > 0 && (
                          <div className="flex justify-between text-sm sm:text-base">
                            <span className="text-gray-600">
                              Outside Only Used:
                            </span>
                            <span className="font-semibold">
                              {currentCode.subscription.outsideOnlyUsed} /{" "}
                              {currentCode.subscription.outsideOnlyQuota}
                            </span>
                          </div>
                        )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div >
  );
};

export default QRCodePage;
