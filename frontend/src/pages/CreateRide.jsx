import React, { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import LocationPicker from "../components/LocationPicker";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import L from "leaflet";
import "leaflet-routing-machine";

export default function CreateRide() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [contact, setContact] = useState("");
  const [startDateTime, setStartDateTime] = useState(null);
  const [totalSeats, setTotalSeats] = useState(4);
  const [price, setPrice] = useState(150);
  const [schedule, setSchedule] = useState("ONETIME");
  // New state for route details
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState({ start: null, end: null });

  const nav = useNavigate();

  // Geocode locations when origin/dest changes
  useEffect(() => {
    const geocode = async (address, type) => {
      if (!address) return;
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&countrycodes=lk&limit=1`
        );
        const data = await response.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          setRouteCoordinates(prev => ({ ...prev, [type]: L.latLng(lat, lng) }));
        }
      } catch (error) {
        console.error("Geocoding failed for route:", error);
      }
    };

    // Debounce to prevent too many requests
    const timer = setTimeout(() => {
      if (origin) geocode(origin, 'start');
    }, 1000);

    const timer2 = setTimeout(() => {
      if (destination) geocode(destination, 'end');
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, [origin, destination]);


  // Component to handle routing
  const RoutingMachine = ({ start, end, setStats }) => {
    const map = useMap();
    const routingControlRef = useRef(null);

    useEffect(() => {
      if (!map || !start || !end) return;

      // Cleanup previous control
      if (routingControlRef.current) {
        try {
          map.removeControl(routingControlRef.current);
        } catch (e) {
          console.warn("Routing control cleanup error:", e);
        }
        routingControlRef.current = null;
      }

      const control = L.Routing.control({
        waypoints: [start, end],
        routeWhileDragging: false,
        showAlternatives: false,
        fitSelectedRoutes: true,
        show: false, // Hide the turn-by-turn instructions text
        lineOptions: {
          styles: [{ color: "#3B82F6", weight: 6 }]
        },
      });

      control.on('routesfound', function (e) {
        const routes = e.routes;
        const summary = routes[0].summary;
        // summary.totalDistance is in meters
        // summary.totalTime is in seconds
        const distKm = (summary.totalDistance / 1000).toFixed(1) + " km";
        const timeMin = Math.round(summary.totalTime / 60);
        const timeStr = timeMin > 60
          ? `${Math.floor(timeMin / 60)} hr ${timeMin % 60} min`
          : `${timeMin} min`;

        setStats({ distance: distKm, duration: timeStr });
      });

      control.on('routingerror', function (e) {
        console.warn("Routing error (OSRM demo server might be down):", e);

        // Fallback: Estimate distance using straight line
        if (start && end) {
          const dist = map.distance(start, end);
          const distKm = (dist / 1000).toFixed(1) + " km (Direct)";
          // Estimate duration: assume 60km/h avg speed -> 1 km = 1 min
          const timeMin = Math.round((dist / 1000) * 60 / 40); // 40km/h for safe estimate including traffic? or 60?
          // Let's use 50km/h average
          const estTimeMin = Math.round((dist / 1000) * 1.2 * 60); // 1.2 mins per km = 50km/h

          const timeStr = estTimeMin > 60
            ? `${Math.floor(estTimeMin / 60)} hr ${estTimeMin % 60} min (Est.)`
            : `${estTimeMin} min (Est.)`;

          setStats({ distance: distKm, duration: timeStr });

          // Draw fallback line
          L.polyline([start, end], {
            color: "#3B82F6",
            weight: 4,
            opacity: 0.7,
            dashArray: '10, 10'
          }).addTo(map);
        }
      });

      try {
        control.addTo(map);
        routingControlRef.current = control;
      } catch (e) {
        console.error("Error adding routing control:", e);
      }

      return () => {
        if (routingControlRef.current) {
          try {
            map.removeControl(routingControlRef.current);
          } catch (e) {
            console.warn("Routing control cleanup error:", e);
          }
          routingControlRef.current = null;
        }
      };
    }, [map, start, end]);

    return null;
  };

  // Component to auto-center map
  const MapReCenter = ({ start, end }) => {
    const map = useMap();
    useEffect(() => {
      if (start && !end) {
        map.setView(start, 13);
      } else if (!start && end) {
        map.setView(end, 13);
      } else if (start && end) {

        const bounds = L.latLngBounds([start, end]);
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }, [start, end, map]);
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!startDateTime) {
      toast.error("Please select date and time");
      return;
    }
    if (!contact) {
      toast.error("Please enter your contact number");
      return;
    }

    const startTime = startDateTime.toISOString();

    try {
      await api.post("/rides", {
        origin,
        destination,
        startTime,
        seatsAvailable: totalSeats,
        totalSeats,
        pricePerSeat: price,
        schedule,
        ownerContact: contact,
        distance,
        duration
      });
      toast.success("Ride created successfully!");
      nav("/dashboard");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || err?.response?.data?.error || "Error creating ride");
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-gray-50 p-8 rounded-xl shadow-lg mt-6 flex flex-col lg:flex-row gap-8">
      {/* Left Column: Form */}
      <div className="flex-1">
        <button
          onClick={() => nav(-1)}
          className="mb-4 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition font-medium bg-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Go Back
        </button>
        <h2 className="text-2xl font-bold mb-5 text-gray-800">Create Ride</h2>

        {/* Highway Note */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Please set <strong>Origin</strong> and <strong>Destination</strong> as the nearest <strong>Highway Entrance</strong> or <strong>Exit</strong> name (e.g., "Kottawa Interchange").
              </p>
            </div>
          </div>
        </div>

        <form className="space-y-4" onSubmit={submit}>
          {/* Origin */}
          <LocationPicker
            label="Origin"
            value={origin}
            onChange={setOrigin}
            placeholder="Enter starting location"
          />

          {/* Destination */}
          <LocationPicker
            label="Destination"
            value={destination}
            onChange={setDestination}
            placeholder="Enter destination"
          />

          {/* Route Stats */}
          {(distance || duration) && (
            <div className="flex gap-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              <div><strong>Distance:</strong> {distance}</div>
              <div><strong>Est. Time:</strong> {duration}</div>
            </div>
          )}

          {/* Date & Time Picker */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Date & Time</label>
            <DatePicker
              selected={startDateTime}
              onChange={(date) => setStartDateTime(date)}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              dateFormat="MMMM d, yyyy h:mm aa"
              placeholderText="Select date & time"
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Total Seats */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Seats</label>
              <input
                type="number"
                value={totalSeats}
                onChange={(e) => setTotalSeats(Number(e.target.value))}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Price (Rs)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Contact No */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Contact</label>
              <input
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="Mobile No"
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              />
            </div>

            {/* Schedule */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">Schedule</label>
              <select
                value={schedule}
                onChange={(e) => setSchedule(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              >
                <option value="ONETIME">One-time</option>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <button className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition font-bold text-lg mt-4">
            Create Ride
          </button>
        </form>
      </div>

      {/* Right Column: Map */}
      <div className="flex-1 h-[500px] sticky top-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Route Preview</h3>
        <div className="w-full h-full rounded-xl shadow-md border border-gray-200 overflow-hidden z-0">
          <MapContainer
            center={[6.9271, 79.8612]}
            zoom={9}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />

            {routeCoordinates.start && routeCoordinates.end && (
              <RoutingMachine
                start={routeCoordinates.start}
                end={routeCoordinates.end}
                setStats={({ distance, duration }) => {
                  setDistance(distance);
                  setDuration(duration);
                }}
              />
            )}
            <MapReCenter start={routeCoordinates.start} end={routeCoordinates.end} />
          </MapContainer>
        </div>
      </div>
    </div>
  );
}