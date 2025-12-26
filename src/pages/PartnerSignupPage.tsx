import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Store,
  Mail,
  Lock,
  Phone,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building,
  User,
  Briefcase,
} from "lucide-react";
import { getApiUrl } from "../config/api";
import { PostcodeLookup } from "../components/PostcodeLookup";

const PartnerSignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Business Information
    name: "",
    tradingName: "",
    companyRegistrationNumber: "",
    postcode: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    county: "",
    country: "United Kingdom",
    latitude: 0,
    longitude: 0,

    // Step 2: Contact Information
    contactPersonName: "",
    email: "",
    phone: "",

    // Step 3: Business Details
    openingHours: "",
    servicesOffered: "",

    // Step 4: Account Security
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(getApiUrl("partners/apply"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          tradingName: formData.tradingName || undefined,
          companyRegistrationNumber:
            formData.companyRegistrationNumber || undefined,
          contactPersonName: formData.contactPersonName || undefined,
          email: formData.email,
          phone: formData.phone || undefined,
          openingHours: formData.openingHours || undefined,
          servicesOffered: formData.servicesOffered || undefined,
          password: formData.password,
          // Location data as separate object
          location: formData.postcode
            ? {
                name: `${formData.name} - Main Location`,
                postcode: formData.postcode,
                addressLine1: formData.addressLine1,
                addressLine2: formData.addressLine2 || undefined,
                city: formData.city,
                county: formData.county || undefined,
                country: formData.country || "United Kingdom",
                latitude: formData.latitude,
                longitude: formData.longitude,
              }
            : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Application submission failed");
      }

      setSuccess(true);
    } catch (err: any) {
      const errorMessage =
        err.message || "Application submission failed. Please try again.";
      setError(errorMessage);
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const nextStep = () => {
    // Validate current step before moving forward
    if (step === 1) {
      if (!formData.name) {
        setError("Business name is required");
        return;
      }
      if (!formData.postcode || !formData.addressLine1) {
        setError("Please enter a valid UK postcode and address");
        return;
      }
      if (formData.latitude === 0 || formData.longitude === 0) {
        setError("Please ensure the postcode is validated");
        return;
      }
    } else if (step === 2) {
      if (!formData.email || !formData.contactPersonName) {
        setError("Email and contact person name are required");
        return;
      }
    }
    setError("");
    setStep(step + 1);
  };

  const prevStep = () => {
    setError("");
    setStep(step - 1);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-lg shadow-xl p-8 border border-orange-100">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Application Submitted!
              </h2>
              <p className="text-gray-600 mb-6">
                Thank you for your interest in becoming a Bella partner. Your
                application has been submitted successfully.
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-orange-800">
                  <strong>What's Next?</strong>
                  <br />
                  Our admin team will review your application. You'll receive an
                  email once your application is approved, and then you can log
                  in to access your partner dashboard.
                </p>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => navigate("/partner-login")}
                  className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  Go to Login Page
                </button>
                <button
                  onClick={() => navigate("/")}
                  className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4 py-8">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-600 rounded-full mb-4">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Partner with Bella
          </h1>
          <p className="text-gray-600">
            Join our network of premium car wash locations
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8 hidden md:block">
          <div className="flex items-center">
            {[1, 2, 3, 4].map((stepNum) => (
              <div
                key={stepNum}
                className="flex items-center flex-1 first:flex-none last:flex-none"
              >
                <div className="flex flex-col items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      step >= stepNum
                        ? "bg-orange-600 border-orange-600 text-white"
                        : "bg-white border-gray-300 text-gray-400"
                    } font-semibold text-sm`}
                  >
                    {stepNum}
                  </div>
                  <span
                    className={`mt-2 text-xs text-gray-600 whitespace-nowrap ${
                      step === stepNum ? "font-semibold" : ""
                    }`}
                  >
                    {stepNum === 1 && "Business"}
                    {stepNum === 2 && "Contact"}
                    {stepNum === 3 && "Details"}
                    {stepNum === 4 && "Security"}
                  </span>
                </div>
                {stepNum < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 w-[93px] ${
                      step > stepNum ? "bg-orange-600" : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-lg shadow-xl p-8 border border-orange-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Error Alert */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Step 1: Business Information */}
            {step === 1 && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-4">
                  <Building className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Business Information
                  </h3>
                </div>

                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Business Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Your Car Wash Business Ltd"
                  />
                </div>

                <div>
                  <label
                    htmlFor="tradingName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Trading Name{" "}
                    <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    id="tradingName"
                    name="tradingName"
                    type="text"
                    value={formData.tradingName}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Bella Car Wash"
                  />
                </div>

                <div>
                  <label
                    htmlFor="companyRegistrationNumber"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Company Registration Number (CRN){" "}
                    <span className="text-gray-400">(optional)</span>
                  </label>
                  <input
                    id="companyRegistrationNumber"
                    name="companyRegistrationNumber"
                    type="text"
                    value={formData.companyRegistrationNumber}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="12345678"
                  />
                </div>

                <div>
                  <PostcodeLookup
                    onAddressSelected={(address) => {
                      setFormData({
                        ...formData,
                        postcode: address.postcode,
                        addressLine1: address.addressLine1,
                        addressLine2: address.addressLine2 || "",
                        city: address.city,
                        county: address.county || "",
                        country: address.country,
                        latitude: address.latitude,
                        longitude: address.longitude,
                      });
                    }}
                    initialPostcode={formData.postcode}
                    required={true}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Contact Information */}
            {step === 2 && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Contact Information
                  </h3>
                </div>

                <div>
                  <label
                    htmlFor="contactPersonName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Contact Person Name *
                  </label>
                  <input
                    id="contactPersonName"
                    name="contactPersonName"
                    type="text"
                    required
                    value={formData.contactPersonName}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="John Smith"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Business Email *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="business@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Phone Number *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="075-111-72-233"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Business Details */}
            {step === 3 && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Business Details
                  </h3>
                </div>

                <div>
                  <label
                    htmlFor="openingHours"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Opening Hours *
                  </label>
                  <textarea
                    id="openingHours"
                    name="openingHours"
                    rows={3}
                    value={formData.openingHours}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Mon-Fri: 8am-6pm, Sat: 9am-5pm, Sun: Closed"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Enter your regular business hours
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="servicesOffered"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Services Offered{" "}
                    <span className="text-gray-400">(optional)</span>
                  </label>
                  <textarea
                    id="servicesOffered"
                    name="servicesOffered"
                    rows={3}
                    value={formData.servicesOffered}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Exterior wash, Interior cleaning, Wax & polish, Vacuum service"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    List the services you provide (comma separated)
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Account Security */}
            {step === 4 && (
              <div className="space-y-5">
                <div className="flex items-center gap-2 mb-4">
                  <Lock className="w-5 h-5 text-orange-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Account Security
                  </h3>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Min. 8 characters"
                    />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Use a strong password with letters, numbers, and symbols
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="Re-enter password"
                    />
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-orange-900 mb-2">
                    Review Your Application
                  </h4>
                  <div className="text-xs text-orange-800 space-y-1">
                    <p>• Business: {formData.name || "Not provided"}</p>
                    <p>
                      • Contact: {formData.contactPersonName || "Not provided"}
                    </p>
                    <p>• Email: {formData.email || "Not provided"}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </button>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="flex-1 flex items-center justify-center gap-2 bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    "Submit Application"
                  )}
                </button>
              )}
            </div>
          </form>

          {/* Benefits Info */}
          {step === 1 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="bg-orange-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-orange-900 mb-2">
                  Benefits of Partnering
                </h4>
                <ul className="text-xs text-orange-800 space-y-1">
                  <li>• Access to thousands of premium subscribers</li>
                  <li>• Easy QR code verification system</li>
                  <li>• Automated payout management</li>
                  <li>• Real-time analytics and insights</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer Links */}
        <div className="mt-6 text-center space-y-2">
          <Link
            to="/partner-login"
            className="text-sm text-gray-600 hover:text-gray-800 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Already have an account? Sign in
          </Link>
          <div className="text-xs text-gray-500">
            <Link to="/" className="hover:text-gray-700 transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerSignupPage;
