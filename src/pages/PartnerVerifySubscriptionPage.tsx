import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrCode, Keyboard, Search, AlertCircle } from 'lucide-react';

const PartnerVerifySubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');

  const handleManualEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!verificationCode.trim()) {
      setError('Please enter a verification code');
      return;
    }

    // Navigate to verification page with the entered code
    navigate(`/partner/verify/${verificationCode.trim()}`);
  };

  const handleScanQR = () => {
    // Navigate to QR scanner page
    navigate('/partner/scan');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Subscription</h1>
          <p className="text-gray-600">Scan QR code or manually enter verification code</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scan QR Code Option */}
          <div className="bg-white rounded-xl shadow-sm p-8 hover:shadow-md transition-shadow cursor-pointer" onClick={handleScanQR}>
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                <QrCode className="w-10 h-10 text-blue-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Scan QR Code</h2>
              <p className="text-gray-600 mb-6">
                Ask the customer to show their QR code and scan it with your camera
              </p>
              <button
                onClick={handleScanQR}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
              >
                <QrCode className="w-5 h-5" />
                <span>Open QR Scanner</span>
              </button>
            </div>
          </div>

          {/* Manual Entry Option */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <Keyboard className="w-10 h-10 text-purple-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">Manual Entry</h2>
              <p className="text-gray-600 mb-6">
                Enter the verification code shown below the customer's QR code
              </p>

              <form onSubmit={handleManualEntry} className="w-full space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-left">
                    Verification Code
                  </label>
                  <div className="relative">
                    <Keyboard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => {
                        setVerificationCode(e.target.value);
                        setError('');
                      }}
                      placeholder="Enter code (e.g., ABC123XYZ)"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-center font-mono text-lg uppercase"
                      maxLength={20}
                    />
                  </div>
                  {error && (
                    <div className="mt-2 flex items-center space-x-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <Search className="w-5 h-5" />
                  <span>Verify Code</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-4 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5" />
            <span>Verification Guidelines</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">QR Code Scanning</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Hold the camera steady for best results</li>
                <li>Ensure good lighting on the QR code</li>
                <li>Keep the code within the frame</li>
                <li>QR code expires after 5 minutes</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Manual Entry</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li>Code is case-insensitive</li>
                <li>Enter code exactly as shown</li>
                <li>Code must be currently active</li>
                <li>Spaces will be ignored</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Status Messages */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-green-800 mb-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium text-sm">Valid Code</span>
            </div>
            <p className="text-xs text-green-700">Subscription is active with remaining washes</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-yellow-800 mb-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="font-medium text-sm">Expired Code</span>
            </div>
            <p className="text-xs text-yellow-700">Code has expired, customer needs new QR</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-red-800 mb-1">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="font-medium text-sm">Invalid Code</span>
            </div>
            <p className="text-xs text-red-700">Code not found or subscription inactive</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerVerifySubscriptionPage;
