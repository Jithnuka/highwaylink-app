import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet marker icon issue
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function LocationPicker({ label, value, onChange, placeholder }) {
  const [inputValue, setInputValue] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [coordinates, setCoordinates] = useState(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputValue && showSuggestions && document.activeElement === document.getElementById(`input-${label}`)) {
        searchPlaces(inputValue);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [inputValue]);

  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value || "");
    }
  }, [value]);

  const searchPlaces = async (query) => {
    if (!query) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=lk&limit=5`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Search error:", error);
    }
  };

  // Helper to simplify address (e.g. "Kadawatha, Sri Lanka" -> "Kadawatha")
  // Also removes "District" if present (e.g. "Hambantota District" -> "Hambantota")
  const formatLocationName = (displayName) => {
    if (!displayName) return "";
    let name = displayName.split(",")[0].trim();
    // Take part before semicolon if exists
    name = name.includes(";") ? name.split(";")[0] : name;
    // Take only the first word as requested
    return name.trim().split(/\s+/)[0];
  };

  const handleSelectPlace = (place) => {
    const name = formatLocationName(place.display_name);
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);

    setInputValue(name);
    onChange(name);
    setCoordinates({ lat, lng });
    setSuggestions([]);
    setShowSuggestions(false);

    if (showMap) {
      // Map will update automatically via MapUpdater component
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const newCoords = { lat: latitude, lng: longitude };
        setCoordinates(newCoords);

        // Reverse geocoding
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const fullName = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          const simpleName = formatLocationName(fullName);

          setInputValue(simpleName);
          onChange(simpleName);
        } catch (error) {
          console.error("Geocoding error:", error);
          setInputValue(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          onChange(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
        setLoadingLocation(false);
        setShowMap(true); // Open map when GPS is used
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to retrieve location.");
        setLoadingLocation(false);
      }
    );
  };

  // Component to handle map clicks
  const MapClickHandler = () => {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        setCoordinates({ lat, lng });

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await response.json();
          const fullName = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          const simpleName = formatLocationName(fullName);
          setInputValue(simpleName);
          onChange(simpleName);
        } catch (error) {
          console.error("Reverse geocode error:", error);
        }
      },
    });
    return null;
  };

  // Component to re-center map
  const MapUpdater = ({ center }) => {
    const map = useMapEvents({});
    useEffect(() => {
      if (center) map.setView(center, 14);
    }, [center]);
    return null;
  };

  return (
    <div className="relative">
      <label className="block text-gray-700 font-medium mb-1">{label}</label>

      <div className="flex gap-2 mb-2 relative">
        <input
          id={`input-${label}`}
          required
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        />

        {/* Nominatim Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto mt-1">
            {suggestions.map((place) => (
              <li
                key={place.place_id}
                onClick={() => handleSelectPlace(place)}
                className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0 text-sm text-gray-700"
              >
                {place.display_name}
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={getCurrentLocation}
          disabled={loadingLocation}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:bg-gray-400 whitespace-nowrap"
          title="Use current location"
        >
          {loadingLocation ? (
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )}
        </button>

        <button
          type="button"
          onClick={() => setShowMap(!showMap)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 whitespace-nowrap"
          title="Toggle map view"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span className="hidden sm:inline">{showMap ? 'Hide' : 'Map'}</span>
        </button>
      </div>

      {/* Click outside to close suggestions */}
      {showSuggestions && (
        <div className="fixed inset-0 z-40" onClick={() => setShowSuggestions(false)} />
      )}

      {showMap && (
        <div className="mt-3 border-2 border-blue-300 rounded-lg overflow-hidden shadow-lg h-[300px]">
          <MapContainer
            center={coordinates || { lat: 6.9271, lng: 79.8612 }}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapClickHandler />
            {coordinates && (
              <>
                <Marker position={coordinates} />
                <MapUpdater center={coordinates} />
              </>
            )}
          </MapContainer>
        </div>
      )}
    </div>
  );
}
