import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Loader2, Search, Crosshair } from "lucide-react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import { locationAPI } from "../../services/api";

interface PartnerLocation {
  id: number;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  hours?: string;
  partner: {
    name: string;
  };
}

const containerStyle = {
  width: "100%",
  height: "100%",
};

// UK center coordinates
const defaultCenter = {
  lat: 54.5,
  lng: -3.5,
};

export const LocationSearchSection: React.FC = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState<PartnerLocation[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
  const [selectedLocation, setSelectedLocation] =
    useState<PartnerLocation | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  const [map, setMap] = React.useState<google.maps.Map | null>(null);

  const onLoad = useCallback(function callback(map: google.maps.Map) {
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback() {
    setMap(null);
  }, []);

  // Handle search by address/postcode
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim() || !map) return;

    setIsSearching(true);
    try {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode(
        { address: searchQuery + ", UK" },
        (
          results: google.maps.GeocoderResult[] | null,
          status: google.maps.GeocoderStatus
        ) => {
          if (status === "OK" && results && results[0]) {
            const { location } = results[0].geometry;
            map.panTo(location);
            map.setZoom(12);
          } else {
            alert(
              "Location not found. Please try a different address or postcode."
            );
          }
          setIsSearching(false);
        }
      );
    } catch (error) {
      console.error("Geocoding error:", error);
      setIsSearching(false);
    }
  };

  // Handle "Use My Location"
  const handleUseMyLocation = () => {
    if (!map) return;

    if ("geolocation" in navigator) {
      setIsSearching(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const pos = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          map.panTo(pos);
          map.setZoom(12);
          setIsSearching(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          alert("Unable to retrieve your location.");
          setIsSearching(false);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  // Fetch partner locations
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await locationAPI.getLocations();
        if (response.data.success) {
          setLocations(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
      } finally {
        setLoadingLocations(false);
      }
    };

    fetchLocations();
  }, []);

  return (
    <section id="contact" className="bg-white text-black py-12 md:py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="uppercase text-xs tracking-widest text-gray-500 mb-2">
            Partner Locations
          </h3>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
            Find a Bella Partner Near You
          </h2>
          <p className="text-gray-600 mt-3">
            Over {locations.length || 6} partner locations across the UK
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="flex gap-2">
            <form onSubmit={handleSearch} className="flex-1 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter postcode or address..."
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </form>
            <button
              onClick={() => handleSearch()}
              disabled={isSearching}
              className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
            >
              {isSearching ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Search"
              )}
            </button>
            <button
              onClick={handleUseMyLocation}
              className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
              title="Use my location"
            >
              <Crosshair className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          className="rounded-lg overflow-hidden shadow-xl border border-gray-200"
          style={{ height: "500px" }}
        >
          {loadingLocations || !isLoaded ? (
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">
                  {!isLoaded
                    ? "Loading Maps..."
                    : "Loading partner locations..."}
                </p>
              </div>
            </div>
          ) : (
            <div className="relative h-full">
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={defaultCenter}
                zoom={6}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                  disableDefaultUI: false,
                  zoomControl: true,
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: true,
                }}
              >
                {locations.map((location) => (
                  <Marker
                    key={location.id}
                    position={{
                      lat: location.latitude,
                      lng: location.longitude,
                    }}
                    onClick={() => setSelectedLocation(location)}
                    icon={{
                      url: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
                      scaledSize: new window.google.maps.Size(25, 41),
                    }}
                  />
                ))}
              </GoogleMap>

              {/* Custom Info Window - rendering outside GoogleMap to use Tailwind properly */}
              {selectedLocation && (
                <div className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-auto md:top-4 md:w-80 bg-white p-4 rounded-lg shadow-xl z-10 border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold text-orange-600">
                      {selectedLocation.name}
                    </div>
                    <button
                      onClick={() => setSelectedLocation(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ×
                    </button>
                  </div>
                  <div className="text-sm text-gray-700 mb-2">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {selectedLocation.address}
                  </div>
                  {selectedLocation.phone && (
                    <div className="text-sm text-gray-700 mb-1">
                      📞 {selectedLocation.phone}
                    </div>
                  )}
                  {selectedLocation.hours && (
                    <div className="text-xs text-gray-500 mt-2">
                      🕒 {selectedLocation.hours}
                    </div>
                  )}
                  <button
                    onClick={() => {
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.latitude},${selectedLocation.longitude}`;
                      window.open(url, "_blank");
                    }}
                    className="mt-3 w-full px-3 py-2 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition-colors"
                  >
                    Get Directions
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={() => navigate("/login")}
            className="px-6 py-3 bg-yellow-500 text-black rounded hover:bg-yellow-600 transition-colors font-medium"
          >
            View Full Map & Subscribe
          </button>
        </div>
      </div>
    </section>
  );
};
