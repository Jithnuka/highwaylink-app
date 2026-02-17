import React, { useState, useEffect, useRef } from "react";

export default function LocationPicker({ label, value, onChange, placeholder }) {
  const [locationName, setLocationName] = useState(value || "");
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [coordinates, setCoordinates] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    setLocationName(value || "");
  }, [value]);

  const handleLocationNameChange = (name) => {
    setLocationName(name);
    onChange(name);
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
        
        // Reverse geocoding to get location name
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          const name = data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          handleLocationNameChange(name);
          
          // Update map if it's open
          if (showMap && mapInstanceRef.current) {
            updateMapLocation(newCoords);
          }
        } catch (error) {
          console.error("Geocoding error:", error);
          handleLocationNameChange(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
        }
        
        setLoadingLocation(false);
        setShowMap(true);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Unable to retrieve your location. Please enter it manually or check your location permissions.");
        setLoadingLocation(false);
      }
    );
  };

  const updateMapLocation = (coords) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setCenter(coords);
      if (markerRef.current) {
        markerRef.current.setPosition(coords);
      } else {
        markerRef.current = new window.google.maps.Marker({
          position: coords,
          map: mapInstanceRef.current,
        });
      }
    }
  };

  const initMap = () => {
    if (!window.google || !mapRef.current) return;

    const defaultCenter = coordinates || { lat: 6.9271, lng: 79.8612 }; // Colombo, Sri Lanka

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: 13,
    });

    // Add marker at current position
    if (coordinates) {
      markerRef.current = new window.google.maps.Marker({
        position: coordinates,
        map: mapInstanceRef.current,
      });
    }

    // Add click listener to map
    mapInstanceRef.current.addListener("click", async (event) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      const newCoords = { lat, lng };
      
      setCoordinates(newCoords);

      // Update or create marker
      if (markerRef.current) {
        markerRef.current.setPosition(newCoords);
      } else {
        markerRef.current = new window.google.maps.Marker({
          position: newCoords,
          map: mapInstanceRef.current,
        });
      }

      // Reverse geocoding
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await response.json();
        const name = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        handleLocationNameChange(name);
      } catch (error) {
        console.error("Geocoding error:", error);
        handleLocationNameChange(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    });
  };

  const toggleMap = () => {
    const newShowMap = !showMap;
    setShowMap(newShowMap);
    
    if (newShowMap) {
      // Load Google Maps script if not already loaded
      if (!window.google) {
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBR5iyCNoL9NI0NCV-LD4On6cdpDRF0QXc`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          setTimeout(initMap, 100);
        };
        document.head.appendChild(script);
      } else {
        setTimeout(initMap, 100);
      }
    }
  };

  return (
    <div>
      <label className="block text-gray-700 font-medium mb-1">{label}</label>
      
      <div className="flex gap-2 mb-2">
        <input
          required
          value={locationName}
          onChange={(e) => handleLocationNameChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        />
        {/*
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
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="hidden sm:inline">GPS</span>
            </>
          )}
        </button>
        
        <button
          type="button"
          onClick={toggleMap}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2 whitespace-nowrap"
          title="Toggle map view"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span className="hidden sm:inline">{showMap ? 'Hide' : 'Map'}</span>
        </button>
        */}
      </div>

      {coordinates && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
          <span className="font-medium">📍 Location:</span> {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
        </div>
      )}

      {showMap && (
        <div className="mt-3 border-2 border-blue-300 rounded-lg overflow-hidden shadow-lg">
          <div className="bg-blue-600 text-white p-2 text-sm">
            <p className="font-medium">Click anywhere on the map to select a location</p>
          </div>
          <div 
            ref={mapRef}
            style={{ height: "400px", width: "100%" }}
            className="bg-gray-100"
          />
        </div>
      )}
    </div>
  );
}
