import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function CreateRide() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [contact, setContact] = useState("");
  const [startDateTime, setStartDateTime] = useState(null);
  const [totalSeats, setTotalSeats] = useState(4);
  const [price, setPrice] = useState(150);
  const [schedule, setSchedule] = useState("ONETIME");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (!startDateTime) {
      alert("Please select date and time");
      return;
    }
    if (!contact) {
      alert("Please enter your contact number");
      return;
    }

    const startTime = startDateTime.toISOString();

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/rides`, {
        origin,
        destination,
        startTime,
        seatsAvailable: totalSeats,
        totalSeats,
        pricePerSeat: price,
        schedule,
        ownerContact: contact,
      });
      alert("Ride created successfully!");
      nav("/dashboard");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Error creating ride");
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-gray-50 p-8 rounded-xl shadow-lg mt-6">
      <h2 className="text-2xl font-bold mb-5 text-gray-800">Create Ride</h2>
      <form className="space-y-4" onSubmit={submit}>
        {/* Origin */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Origin</label>
          <input
            required
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            placeholder="Enter starting location"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          />
        </div>

        {/* Destination */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Destination</label>
          <input
            required
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="Enter destination"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          />
        </div>

        {/* Contact No */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Contact No</label>
          <input
            required
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Enter your contact number"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          />
        </div>

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

        {/* Total Seats */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Total Seats</label>
          <input
            type="number"
            value={totalSeats}
            onChange={(e) => setTotalSeats(Number(e.target.value))}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Price per Seat (Rs)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
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

        {/* Submit Button */}
        <button className="w-full bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 transition">
          Create Ride
        </button>
      </form>
    </div>
  );
}
