import React, { useState, useEffect, useCallback } from "react";
import { Geolocation as CapacitorGeolocation } from "@capacitor/geolocation";
import { Loader2, AlertCircle, Crosshair } from "lucide-react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import { locationAPI } from "../services/api";
import { calculateDistance, formatDistance } from "../utils/distance";
import PartnerModal from "../components/PartnerModal";
import { toast } from "react-hot-toast";

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

interface UserLocation {
  lat: number;
  lng: number;
}

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = { lat: 54.5, lng: -3.5 }; // Center of UK

const MapPage: React.FC = () => {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locations, setLocations] = useState<PartnerLocation[]>([]);
  const [selectedLocation, setSelectedLocation] =
    useState<PartnerLocation | null>(null);
  const [nearestLocation, setNearestLocation] =
    useState<PartnerLocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [infoWindowLocation, setInfoWindowLocation] = useState<PartnerLocation | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Fetch all locations
  const fetchAllLocations = async () => {
    try {
      setLoading(true);
      const response = await locationAPI.getLocations();
      if (response.data.success) {
        const fetchedLocations = response.data.data;
        setLocations(fetchedLocations);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
      toast.error("Failed to load partner locations");
    } finally {
      setLoading(false);
    }
  };

  // Fetch nearby locations
  const fetchNearbyLocations = async (
    lat: number,
    lng: number,
    radius: number = 50
  ) => {
    console.log("Fetching nearby locations:", { lat, lng, radius });
    try {
      setLoading(true);
      const response = await locationAPI.getNearbyLocations(lat, lng, radius);
      console.log("Nearby locations response:", response.data);
      if (response.data.success) {
        const fetchedLocations = response.data.data;

        if (fetchedLocations.length === 0) {
          console.log("No nearby locations found. Fetching all locations.");
          toast("No partners found nearby. Showing all locations.", {
            icon: '🌍',
          });
          await fetchAllLocations();
        } else {
          setLocations(fetchedLocations);
        }
      }
    } catch (error) {
      console.error("Error fetching nearby locations:", error);
      toast.error("Failed to load nearby locations");
      fetchAllLocations();
    } finally {
      setLoading(false);
    }
  };

  // Get user's current location
  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const hasPermission = await CapacitorGeolocation.checkPermissions();

        if (hasPermission.location !== "granted") {
          const request = await CapacitorGeolocation.requestPermissions();
          if (request.location !== "granted") {
            throw new Error("PERMISSION_DENIED");
          }
        }

        const position = await CapacitorGeolocation.getCurrentPosition({
          enableHighAccuracy: false,
          timeout: 30000,
        });

        const userPos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        console.log("User location detected:", userPos);
        setUserLocation(userPos);
        setLocationError(null);
        fetchNearbyLocations(userPos.lat, userPos.lng);
      } catch (error: any) {
        console.error("Geolocation error full object:", error);
        console.error("Geolocation error:", error);
        let errorMessage =
          "Unable to get your location. Showing all locations.";

        if (error.message === "PERMISSION_DENIED" || error.code === 1) {
          errorMessage =
            "Location permission denied. Please allow location access in your device settings.";
        } else if (error.code === 2) {
          errorMessage = "Location information is unavailable.";
        } else if (error.code === 3) {
          errorMessage = "The request to get user location timed out.";
        }

        setLocationError(errorMessage);
        fetchAllLocations();
      }
    };

    getCurrentLocation();
  }, []);

  // Calculate nearest location
  useEffect(() => {
    if (locations.length > 0 && userLocation) {
      const nearest = locations.reduce((prev, curr) => {
        const prevDist = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          prev.latitude,
          prev.longitude
        );
        const currDist = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          curr.latitude,
          curr.longitude
        );
        return currDist < prevDist ? curr : prev;
      });
      setNearestLocation(nearest);
    } else {
      setNearestLocation(null);
    }
  }, [locations, userLocation]);

  // Fit bounds when locations change
  useEffect(() => {
    if (map && locations.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();

      if (userLocation) {
        bounds.extend(userLocation);
      }

      locations.forEach((loc) => {
        bounds.extend({ lat: loc.latitude, lng: loc.longitude });
      });

      map.fitBounds(bounds);
    }
  }, [map, locations, userLocation]);


  // Handle directions button click
  const handleGetDirections = (lat: number, lng: number) => {
    const confirmed = window.confirm(
      "Do you want to open directions to this partner station?"
    );

    if (confirmed) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
      window.open(url, "_blank");
    }
  };

  // Recenter map on user location
  const recenterMap = () => {
    if (userLocation && map) {
      map.setCenter({
        lat: userLocation.lat,
        lng: userLocation.lng,
      });
      map.setZoom(13);
    }
  };

  if (loadError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Error loading map</p>
        </div>
      </div>
    );
  }

  if (loading && !locations.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading partner locations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Partner Locations
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {locations.length} location{locations.length !== 1 ? "s" : ""}{" "}
                found
                {userLocation && nearestLocation && (
                  <span className="ml-2 text-orange-600 font-medium">
                    • Nearest: {nearestLocation.name} (
                    {formatDistance(
                      calculateDistance(
                        userLocation.lat,
                        userLocation.lng,
                        nearestLocation.latitude,
                        nearestLocation.longitude
                      )
                    )}
                    )
                  </span>
                )}
              </p>
            </div>

            {userLocation && (
              <button
                onClick={recenterMap}
                className="hidden sm:flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
              >
                <Crosshair className="w-4 h-4" />
                My Location
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Location Error Alert */}
      {locationError && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-yellow-400 mr-3" />
            <p className="text-sm text-yellow-800">{locationError}</p>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="flex-1 relative">
        {isLoaded ? (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={defaultCenter}
            zoom={6}
            onLoad={onLoad}
            onUnmount={onUnmount}
            options={{
              mapTypeControl: false,
              streetViewControl: false,
              fullscreenControl: true,
            }}
          >
            {/* User Location Marker */}
            {userLocation && (
              <Marker
                position={userLocation}
                title="Your Location"
                icon={{
                  url: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
                  scaledSize: new window.google.maps.Size(25, 41),
                }}
              />
            )}

            {locations.map((location) => {
              const isNearest = nearestLocation?.id === location.id;
              return (
                <Marker
                  key={location.id}
                  position={{ lat: location.latitude, lng: location.longitude }}
                  title={location.name}
                  icon={{
                    url: isNearest
                      ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png"
                      : "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
                    scaledSize: new window.google.maps.Size(25, 41),
                  }}
                  onClick={() => {
                    setInfoWindowLocation(location);
                  }}
                />
              );
            })}

            {infoWindowLocation && (
              <InfoWindow
                position={{
                  lat: infoWindowLocation.latitude,
                  lng: infoWindowLocation.longitude,
                }}
                onCloseClick={() => setInfoWindowLocation(null)}
              >
                <div style={{ minWidth: "200px" }}>
                  <div style={{ fontWeight: 600, color: "#111827", marginBottom: "4px" }}>
                    {infoWindowLocation.name}
                    {nearestLocation?.id === infoWindowLocation.id && (
                      <span style={{ marginLeft: "6px", fontSize: "10px", background: "#dcfce7", color: "#166534", padding: "2px 6px", borderRadius: "9999px" }}>
                        Nearest
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: "12px", color: "#4b5563", marginBottom: "6px" }}>
                    {infoWindowLocation.address}
                  </div>
                  {userLocation && (
                    <div style={{ fontSize: "11px", color: "#ea580c", fontWeight: 500, marginBottom: "6px" }}>
                      📍 {formatDistance(calculateDistance(userLocation.lat, userLocation.lng, infoWindowLocation.latitude, infoWindowLocation.longitude))} away
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setSelectedLocation(infoWindowLocation);
                      setInfoWindowLocation(null); // Optional: close info window when modal opens
                    }}
                    style={{ width: "100%", background: "#ea580c", color: "#fff", fontSize: "12px", padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer" }}
                  >
                    View Details
                  </button>
                </div>
              </InfoWindow>
            )}

          </GoogleMap>
        ) : (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin" />
          </div>
        )}

        {/* Mobile Recenter Button */}
        {userLocation && (
          <button
            onClick={recenterMap}
            className="sm:hidden absolute bottom-4 right-4 z-[1000] bg-white shadow-lg p-3 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
            aria-label="Recenter map"
          >
            <Crosshair className="w-6 h-6 text-orange-500" />
          </button>
        )}
      </div>

      {/* Partner Details Modal */}
      {selectedLocation && (
        <PartnerModal
          location={selectedLocation}
          distance={
            userLocation
              ? calculateDistance(
                userLocation.lat,
                userLocation.lng,
                selectedLocation.latitude,
                selectedLocation.longitude
              )
              : undefined
          }
          onClose={() => setSelectedLocation(null)}
          onGetDirections={handleGetDirections}
        />
      )}

      {/* Legend */}
      <div className="hidden sm:block absolute bottom-4 left-80 z-[100] bg-white shadow-lg rounded-lg p-4 border border-gray-200">
        <h3 className="text-sm font-semibold text-gray-900 mb-2">Legend</h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span className="text-gray-700">Your Location</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-700">Nearest Partner</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
            <span className="text-gray-700">Other Partners</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;