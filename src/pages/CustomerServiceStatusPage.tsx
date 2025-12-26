import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, Loader, Car } from 'lucide-react';
import { getApiUrl } from '@/config/api';

interface ServiceStatus {
  verificationId: string;
  code: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED';
  startedAt?: string;
  completedAt?: string;
  partnerName?: string;
  subscription: {
    used: number;
    remaining: number | string;
  };
}

const CustomerServiceStatusPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<ServiceStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch(getApiUrl(`/verification/status/${code}`), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch status');
        }

        setStatus(data.data);
        setLoading(false);
      } catch (err: any) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (code) {
      fetchStatus();
      // Poll every 5 seconds for status updates
      const interval = setInterval(fetchStatus, 5000);
      return () => clearInterval(interval);
    }
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading status...</p>
        </div>
      </div>
    );
  }

  if (error || !status) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-red-600 mb-6">{error || 'Status not found'}</p>
            <button
              onClick={() => navigate('/app/qr-code')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to QR Code
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Status Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 relative">
            {status.status === 'PENDING' && (
              <div className="w-full h-full bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-12 h-12 text-yellow-600" />
              </div>
            )}
            {status.status === 'IN_PROGRESS' && (
              <div className="w-full h-full bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                <Car className="w-12 h-12 text-blue-600" />
              </div>
            )}
            {status.status === 'COMPLETED' && (
              <div className="w-full h-full bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            )}
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {status.status === 'PENDING' && 'Waiting for Partner'}
            {status.status === 'IN_PROGRESS' && 'Service In Progress'}
            {status.status === 'COMPLETED' && 'Service Completed!'}
          </h1>
          <p className="text-gray-600">
            {status.status === 'PENDING' && 'Please present your QR code to the partner'}
            {status.status === 'IN_PROGRESS' && 'Your car is being washed...'}
            {status.status === 'COMPLETED' && 'Thank you for using Bella Car Wash!'}
          </p>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Service Timeline</h3>

          <div className="space-y-6">
            {/* Code Generated */}
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="font-semibold text-gray-900">Code Generated</p>
                <p className="text-sm text-gray-600">Ready for partner verification</p>
              </div>
            </div>

            {/* Service Started */}
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${status.startedAt ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                  {status.startedAt ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
              <div className="ml-4">
                <p className={`font-semibold ${status.startedAt ? 'text-gray-900' : 'text-gray-400'}`}>
                  Service Started
                </p>
                {status.startedAt ? (
                  <p className="text-sm text-gray-600">
                    {new Date(status.startedAt).toLocaleString()}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">Waiting for partner to start</p>
                )}
              </div>
            </div>

            {/* Service Completed */}
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${status.completedAt ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                  {status.completedAt ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
              <div className="ml-4">
                <p className={`font-semibold ${status.completedAt ? 'text-gray-900' : 'text-gray-400'}`}>
                  Service Completed
                </p>
                {status.completedAt ? (
                  <p className="text-sm text-gray-600">
                    {new Date(status.completedAt).toLocaleString()}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">Service in progress...</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Remaining Washes */}
        {status.subscription && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Washes Used</p>
                <p className="text-2xl font-bold text-gray-900">{status.subscription.used}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Remaining</p>
                <p className="text-2xl font-bold text-green-600">{status.subscription.remaining}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-4">
          {status.status === 'COMPLETED' && (
            <button
              onClick={() => navigate('/app/qr-code')}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Generate New Code
            </button>
          )}

          <button
            onClick={() => navigate('/app/dashboard')}
            className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Auto-refresh notice */}
        {status.status === 'PENDING' || status.status === 'IN_PROGRESS' ? (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              <Loader className="w-4 h-4 inline animate-spin mr-2" />
              Status updates automatically every 5 seconds
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CustomerServiceStatusPage;
