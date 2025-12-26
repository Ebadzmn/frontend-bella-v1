import React, { useState, useEffect } from 'react';
import { Search, MapPin, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { postcodeAPI, PostcodeValidation } from '../services/postcodeAPI';

interface PostcodeLookupProps {
  onAddressSelected: (address: {
    postcode: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    county?: string;
    country: string;
    latitude: number;
    longitude: number;
  }) => void;
  initialPostcode?: string;
  required?: boolean;
  disabled?: boolean;
}

export const PostcodeLookup: React.FC<PostcodeLookupProps> = ({
  onAddressSelected,
  initialPostcode = '',
  required = false,
  disabled = false,
}) => {
  const [postcode, setPostcode] = useState(initialPostcode);
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<PostcodeValidation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Debounced postcode validation
  useEffect(() => {
    if (!postcode || postcode.length < 5) {
      setSuggestions([]);
      setValidationResult(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsValidating(true);
        setError(null);

        // Get autocomplete suggestions
        const autocompleteSuggestions = await postcodeAPI.autocompletePostcode(postcode);
        setSuggestions(autocompleteSuggestions);

        // Try to validate the postcode
        const result = await postcodeAPI.validatePostcode(postcode);
        setValidationResult(result);
        setShowSuggestions(false);
        setError(null);
      } catch (err) {
        setValidationResult(null);
        if (postcode.length >= 6) {
          setError('Invalid postcode');
        }
      } finally {
        setIsValidating(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [postcode]);

  // Update parent when address is complete
  useEffect(() => {
    if (validationResult && addressLine1) {
      onAddressSelected({
        postcode: validationResult.postcode,
        addressLine1,
        addressLine2: addressLine2 || undefined,
        city: validationResult.city,
        county: validationResult.county,
        country: validationResult.country,
        latitude: validationResult.latitude,
        longitude: validationResult.longitude,
      });
    }
  }, [validationResult, addressLine1, addressLine2, onAddressSelected]);

  const handlePostcodeChange = (value: string) => {
    const upperValue = value.toUpperCase().trim();
    setPostcode(upperValue);
    setShowSuggestions(true);
  };

  const selectSuggestion = (suggestion: string) => {
    setPostcode(suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-4">
      {/* Postcode Input */}
      <div className="relative">
        <label htmlFor="postcode" className="block text-sm font-medium text-gray-700 mb-2">
          UK Postcode {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
          <input
            type="text"
            id="postcode"
            value={postcode}
            onChange={(e) => handlePostcodeChange(e.target.value)}
            placeholder="e.g., SW1A 1AA"
            disabled={disabled}
            className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed uppercase"
            required={required}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {isValidating && <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />}
            {!isValidating && validationResult && (
              <CheckCircle2 className="w-5 h-5 text-green-500" />
            )}
            {!isValidating && error && <AlertCircle className="w-5 h-5 text-red-500" />}
            {!isValidating && !validationResult && !error && (
              <Search className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>

        {/* Autocomplete Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => selectSuggestion(suggestion)}
                className="w-full px-4 py-2 text-left hover:bg-orange-50 focus:bg-orange-50 focus:outline-none"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{suggestion}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {error && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}
      </div>

      {/* Address Details (shown after valid postcode) */}
      {validationResult && (
        <div className="space-y-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700 font-medium">
            <CheckCircle2 className="w-5 h-5" />
            <span>Postcode validated</span>
          </div>

          <div className="grid gap-4">
            {/* Address Line 1 */}
            <div>
              <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 1 (Street) {required && <span className="text-red-500">*</span>}
              </label>
              <input
                type="text"
                id="addressLine1"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                placeholder="e.g., 123 High Street"
                disabled={disabled}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100"
                required={required}
              />
            </div>

            {/* Address Line 2 */}
            <div>
              <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-2">
                Address Line 2 (Optional)
              </label>
              <input
                type="text"
                id="addressLine2"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
                placeholder="e.g., Suite 4, Building B"
                disabled={disabled}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            {/* City/Town (Read-only from validation) */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                City/Town
              </label>
              <input
                type="text"
                id="city"
                value={validationResult.city}
                readOnly
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
              />
            </div>

            {/* County (Read-only from validation) */}
            {validationResult.county && (
              <div>
                <label htmlFor="county" className="block text-sm font-medium text-gray-700 mb-2">
                  County
                </label>
                <input
                  type="text"
                  id="county"
                  value={validationResult.county}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>
            )}

            {/* Location Info */}
            <div className="text-sm text-gray-600 bg-white p-3 rounded border border-gray-200">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 text-orange-500" />
                <div>
                  <p className="font-medium text-gray-700">Location Coordinates</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Lat: {validationResult.latitude.toFixed(6)}, Lon: {validationResult.longitude.toFixed(6)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    This will be used for precise map placement and distance calculations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
