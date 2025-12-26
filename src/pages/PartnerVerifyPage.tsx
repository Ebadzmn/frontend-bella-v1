import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, User, CreditCard, Loader, Play, CheckSquare } from 'lucide-react';
import { getApiUrl } from '../config/api';
import { toast } from 'react-hot-toast';

interface VerificationData {
  verificationId: string;
  code: string;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string;
  };
  subscription: {
    plan: string;
    quota: number;
    used: number;
    remaining: number | string;
  };
  status: string;
}

const PartnerVerifyPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verificationData, setVerificationData] = useState<VerificationData | null>(null);
  const [currentStatus, setCurrentStatus] = useState<'PENDING' | 'IN_PROGRESS' | 'COMPLETED'>('PENDING');

  useEffect(() => {
    const verifyCode = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(getApiUrl('verification/verify'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('partnerToken')}`,
          },
          body: JSON.stringify({ code }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || data.message || 'Verification failed');
        }

        if (!data.eligible) {
          throw new Error('Customer is not eligible for service');
        }

        setVerificationData(data.data);
        setCurrentStatus(data.data.status);
      } catch (err: any) {
        setError(err.message || 'Failed to verify code');
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      verifyCode();
    }
  }, [code]);

  const handleProcessService = async () => {
    if (!verificationData) return;

    if (!confirm('Start wash for this customer? 1 wash will be deducted.')) {
      return;
    }

    try {
      setCompleting(true);
      setError(null);

      // Call Complete Service directly (Backend handles the start logic if needed)
      const completeResponse = await fetch(getApiUrl('verification/complete'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('partnerToken')}`,
        },
        body: JSON.stringify({ verificationId: verificationData.verificationId }),
      });

      const completeData = await completeResponse.json();

      if (!completeResponse.ok) {
        throw new Error(completeData.error || 'Failed to process service');
      }

      setCurrentStatus('COMPLETED');

      // Show success message
      toast.success('Wash started and processed successfully!');

      // Redirect back to scan page
      navigate('/partner/scan');
    } catch (err: any) {
      setError(err.message || 'Failed to process service');
      toast.error(err.message || 'Failed to process service');
    } finally {
      setCompleting(false);
    }
  };

  // handleCompleteService is no longer needed as it's merged into handleStartService

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verifying code...</p>
        </div>
      </div>
    );
  }

  if (error && !verificationData) {
    return (
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 text-center">
            <XCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-sm sm:text-base text-red-600 mb-4 sm:mb-6">{error}</p>
            <button
              onClick={() => navigate('/partner/scan')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
            >
              Try Another Code
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Status Banner */}
        <div className={`mb-6 sm:mb-8 rounded-lg p-3 sm:p-4 ${currentStatus === 'COMPLETED'
          ? 'bg-green-50 border border-green-200'
          : currentStatus === 'IN_PROGRESS'
            ? 'bg-blue-50 border border-blue-200'
            : 'bg-yellow-50 border border-yellow-200'
          }`}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              {currentStatus === 'COMPLETED' && <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />}
              {currentStatus === 'IN_PROGRESS' && <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 animate-pulse" />}
              {currentStatus === 'PENDING' && <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />}
              <span className={`font-semibold text-sm sm:text-base ${currentStatus === 'COMPLETED' ? 'text-green-900'
                : currentStatus === 'IN_PROGRESS' ? 'text-blue-900'
                  : 'text-yellow-900'
                }`}>
                Status: {currentStatus === 'IN_PROGRESS' ? 'Service In Progress'
                  : currentStatus === 'COMPLETED' ? 'Service Completed'
                    : 'Ready to Start'}
              </span>
            </div>
            <span className="text-xs sm:text-sm font-mono bg-white px-2 sm:px-3 py-1 rounded border">
              {verificationData?.code}
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
            <p className="text-sm sm:text-base text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Customer Information</h2>
            </div>

            {verificationData && (
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="text-xs sm:text-sm text-gray-600">Name</label>
                  <p className="font-semibold text-sm sm:text-base text-gray-900">{verificationData.user.name}</p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm text-gray-600">Email</label>
                  <p className="font-semibold text-sm sm:text-base text-gray-900 break-words">{verificationData.user.email}</p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm text-gray-600">Phone</label>
                  <p className="font-semibold text-sm sm:text-base text-gray-900">{verificationData.user.phone || 'N/A'}</p>
                </div>
              </div>
            )}
          </div>

          {/* Subscription Details */}
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
              <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Subscription Details</h2>
            </div>

            {verificationData && (
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="text-xs sm:text-sm text-gray-600">Plan</label>
                  <p className="font-semibold text-sm sm:text-base text-gray-900">{verificationData.subscription.plan}</p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm text-gray-600">Total Quota</label>
                  <p className="font-semibold text-sm sm:text-base text-gray-900">
                    {verificationData.subscription.quota === 999 ? 'Unlimited' : verificationData.subscription.quota} washes
                  </p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm text-gray-600">Washes Used</label>
                  <p className="font-semibold text-sm sm:text-base text-gray-900">{verificationData.subscription.used}</p>
                </div>
                <div>
                  <label className="text-xs sm:text-sm text-gray-600">Remaining</label>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">
                    {verificationData.subscription.remaining}
                  </p>
                </div>

                {/* Progress Bar */}
                {verificationData.subscription.quota !== 999 && (
                  <div>
                    <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                      <div
                        className="bg-green-500 h-2 sm:h-3 rounded-full transition-all"
                        style={{
                          width: `${((verificationData.subscription.quota - verificationData.subscription.used) / verificationData.subscription.quota) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Service Actions</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {currentStatus === 'PENDING' && (
                  <button
                    onClick={handleProcessService}
                    disabled={completing}
                    className="flex items-center justify-center space-x-2 bg-blue-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg font-semibold md:col-span-2"
                  >
                    {completing ? (
                      <>
                        <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Start Wash</span>
                      </>
                    )}
                  </button>
                )}

                {currentStatus === 'IN_PROGRESS' && (
                  <button
                    onClick={handleProcessService}
                    disabled={completing}
                    className="flex items-center justify-center space-x-2 bg-green-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-lg font-semibold md:col-span-2"
                  >
                    {completing ? (
                      <>
                        <Loader className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                        <span>Completing...</span>
                      </>
                    ) : (
                      <>
                        <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="hidden sm:inline">Complete Service & Deduct Wash</span>
                        <span className="sm:hidden">Complete Service</span>
                      </>
                    )}
                  </button>
                )}

                {currentStatus === 'COMPLETED' && (
                  <div className="md:col-span-2 text-center py-4">
                    <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-green-600 mx-auto mb-4" />
                    <p className="text-lg sm:text-xl font-semibold text-green-900 mb-2">Service Completed!</p>
                    <p className="text-sm sm:text-base text-gray-600">Wash has been deducted from customer's subscription</p>
                  </div>
                )}

                <button
                  onClick={() => navigate('/partner/scan')}
                  className="md:col-span-2 border border-gray-300 text-gray-700 py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  Scan Another Code
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        {currentStatus !== 'COMPLETED' && (
          <div className="mt-6 sm:mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
            <h4 className="font-semibold text-blue-900 mb-3 text-sm sm:text-base">Next Steps</h4>
            <ol className="space-y-2 text-xs sm:text-sm text-blue-800">
              {currentStatus === 'PENDING' && (
                <>
                  <li>✓ Customer verification successful</li>
                  <li>→ Click "Start Service" to begin the car wash</li>
                  <li>• Customer will see the status update on their screen</li>
                  <li>• Complete the service and click "Complete Service" when done</li>
                </>
              )}
              {currentStatus === 'IN_PROGRESS' && (
                <>
                  <li>✓ Service is in progress</li>
                  <li>✓ Customer can see the status on their screen</li>
                  <li>→ Click "Complete Service" when the wash is finished</li>
                  <li>• This will deduct 1 wash from the customer's quota</li>
                </>
              )}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default PartnerVerifyPage;
