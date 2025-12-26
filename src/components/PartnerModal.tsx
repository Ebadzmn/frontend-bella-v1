import React from 'react';
import { X, MapPin, Navigation, Clock, Phone } from 'lucide-react';

interface PartnerLocation {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  hours?: string;
  active: boolean;
  partner: {
    id: number;
    name: string;
    status: string;
  };
}

interface PartnerModalProps {
  location: PartnerLocation;
  distance?: number;
  onClose: () => void;
  onGetDirections: (lat: number, lng: number) => void;
}

const PartnerModal: React.FC<PartnerModalProps> = ({
  location,
  distance,
  onClose,
  onGetDirections,
}) => {
  const isOpen = location.partner.status === 'ACTIVE';

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h2 className="text-2xl font-bold mb-1">{location.name}</h2>
          <p className="text-orange-100 text-sm">{location.partner.name}</p>
          
          {distance !== undefined && (
            <div className="mt-3 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
              <MapPin className="w-4 h-4" />
              <span>{distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)}km`} away</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              isOpen 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isOpen ? 'bg-green-500' : 'bg-red-500'}`} />
              {isOpen ? 'Open' : 'Closed'}
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <MapPin className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Address</h3>
              <p className="text-gray-600 text-sm">{location.address}</p>
            </div>
          </div>

          {/* Hours */}
          {location.hours && (
            <div className="flex items-start gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Operating Hours</h3>
                <p className="text-gray-600 text-sm whitespace-pre-line">{location.hours}</p>
              </div>
            </div>
          )}

          {/* Phone */}
          {location.phone && (
            <div className="flex items-start gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Phone className="w-5 h-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">Phone</h3>
                <a 
                  href={`tel:${location.phone}`}
                  className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                >
                  {location.phone}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 space-y-3">
          <button
            onClick={() => onGetDirections(location.latitude, location.longitude)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <Navigation className="w-5 h-5" />
            Get Directions
          </button>
          
          <button
            onClick={onClose}
            className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 px-4 rounded-lg font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartnerModal;
