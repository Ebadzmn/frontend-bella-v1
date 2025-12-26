import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Scan, Keyboard, ArrowRight, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PartnerScanPage: React.FC = () => {
  const [scanMode, setScanMode] = useState<'qr' | 'manual'>('qr');
  const [manualCode, setManualCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrReaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
      if (scannerRef.current) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setError(null);
      setScanning(true);

      // Wait for DOM to be ready
      await new Promise(resolve => setTimeout(resolve, 100));

      const element = document.getElementById('qr-reader');
      if (!element) {
        throw new Error('QR reader element not found');
      }

      const scanner = new Html5Qrcode('qr-reader');
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          // Successfully decoded QR code
          stopScanning();
          handleScan(decodedText);
        },
        () => {
          // QR code parsing error - ignore, it's scanning continuously
        }
      );
    } catch (err: any) {
      console.error('Scanner error:', err);
      let errorMessage = 'Failed to access camera. Please check permissions.';
      
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        errorMessage = 'Camera permission denied. Please allow camera access in your device settings.';
      } else if (err?.name === 'NotFoundError') {
        errorMessage = 'No camera found on this device.';
      } else if (err?.name === 'NotReadableError') {
        errorMessage = 'Camera is likely in use by another app or invalid.';
      }
      
      setError(errorMessage);
      setScanning(false);
    }
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current = null;
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setScanning(false);
  };

  const handleScan = (result: string) => {
    try {
      // Try to parse as JSON (from QR code)
      const data = JSON.parse(result);
      navigate(`/partner/verify/${data.code}`);
    } catch {
      // If it's just a plain code string, use it directly
      navigate(`/partner/verify/${result}`);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      navigate(`/partner/verify/${manualCode.trim()}`);
    }
  };

  const handleModeChange = async (mode: 'qr' | 'manual') => {
    if (scanning) {
      await stopScanning();
    }
    setScanMode(mode);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Verify Customer</h1>
          <p className="text-sm sm:text-base text-gray-600">Scan QR code or enter verification code manually</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex space-x-2 sm:space-x-4 mb-4 sm:mb-6">
          <button
            onClick={() => handleModeChange('qr')}
            className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base ${
              scanMode === 'qr'
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Scan className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Scan QR Code</span>
            <span className="sm:hidden">Scan</span>
          </button>
          <button
            onClick={() => handleModeChange('manual')}
            className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-6 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base ${
              scanMode === 'manual'
                ? 'bg-orange-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Keyboard className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Enter Code</span>
            <span className="sm:hidden">Manual</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
            <p className="text-sm sm:text-base text-red-800">{error}</p>
          </div>
        )}

        {/* QR Scanner Mode */}
        {scanMode === 'qr' && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="mb-4 text-center">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Position QR Code in Frame</h3>
              <p className="text-gray-600 text-xs sm:text-sm">The camera will automatically scan the code</p>
            </div>

            <div className="max-w-md mx-auto">
              {!scanning ? (
                <div className="text-center">
                  <button
                    onClick={startScanning}
                    className="bg-orange-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-orange-700 transition-colors text-base sm:text-lg font-semibold"
                  >
                    Start Camera
                  </button>
                </div>
              ) : (
                <div>
                  <div id="qr-reader" ref={qrReaderRef} className="border-4 border-orange-500 rounded-lg overflow-hidden"></div>
                </div>
              )}
            </div>

            {scanning && (
              <div className="mt-4 text-center">
                <button
                  onClick={stopScanning}
                  className="text-gray-600 hover:text-gray-800 underline flex items-center justify-center mx-auto space-x-2 text-sm sm:text-base"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Stop Camera</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Manual Entry Mode */}
        {scanMode === 'manual' && (
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="mb-4 sm:mb-6 text-center">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Enter Verification Code</h3>
              <p className="text-gray-600 text-xs sm:text-sm">Ask customer for their 8-character code</p>
            </div>

            <form onSubmit={handleManualSubmit} className="max-w-md mx-auto">
              <div className="mb-4 sm:mb-6">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value.toUpperCase())}
                  placeholder="A1B2C3D4"
                  maxLength={8}
                  className="w-full text-center text-2xl sm:text-3xl font-mono font-bold px-3 sm:px-4 py-3 sm:py-4 border-2 border-gray-300 rounded-lg focus:border-orange-500 focus:outline-none uppercase tracking-wider"
                  autoComplete="off"
                />
              </div>

              <button
                type="submit"
                disabled={manualCode.length !== 8}
                className="w-full bg-orange-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-base sm:text-lg font-semibold"
              >
                <span>Verify Code</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </form>
          </div>
        )}

        {/* Instructions */}
        <div className="mt-6 sm:mt-8 bg-orange-50 border border-orange-200 rounded-lg p-4 sm:p-6">
          <h4 className="font-semibold text-orange-900 mb-3 text-sm sm:text-base">How It Works</h4>
          <ol className="space-y-2 text-xs sm:text-sm text-orange-800">
            <li>1. Ask customer to open their verification code</li>
            <li>2. Scan their QR code or enter the code manually</li>
            <li>3. Verify their subscription and eligibility</li>
            <li>4. Start the car wash service</li>
            <li>5. Mark as complete when done to deduct a wash</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default PartnerScanPage;
