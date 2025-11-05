import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import MyInquiries from "../components/MyInquiries";

export default function Dashboard() {
  const [createdRides, setCreatedRides] = useState([]);
  const [requestedRides, setRequestedRides] = useState([]);
  const [approvedRides, setApprovedRides] = useState([]);
  const [canceledRides, setCanceledRides] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRideIds, setExpandedRideIds] = useState([]);
  const [expandedUserIds, setExpandedUserIds] = useState([]);
  const [rideDetails, setRideDetails] = useState({});
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [editRideId, setEditRideId] = useState(null);
  const [rideEditForm, setRideEditForm] = useState({});
  const [editUserId, setEditUserId] = useState(null);
  const [userEditForm, setUserEditForm] = useState({});
  const rideEditFormRef = useRef(null);
  const userEditFormRef = useRef(null);
  const [userSearch, setUserSearch] = useState("");
  const [canceledRequests, setCanceledRequests] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (editRideId && rideEditFormRef.current) {
      rideEditFormRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [editRideId]);

  useEffect(() => {
    if (editUserId && userEditFormRef.current) {
      userEditFormRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [editUserId]);

  // === Inquiry Management ===
  const [inquiries, setInquiries] = useState([]);
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquiryError, setInquiryError] = useState(null);

  const fetchInquiries = async () => {
    if (user.role !== "ADMIN") return;
    setInquiryLoading(true);
    try {
      const res = await api.get("/inquiries/all", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const mapped = (res.data || []).map((inq) => ({
        ...inq,
        id: inq._id,
      }));

      setInquiries(mapped);
    } catch (err) {
      console.error(err);
      setInquiryError(err.response?.data?.message || "Failed to load inquiries");
    } finally {
      setInquiryLoading(false);
    }
  };

  useEffect(() => {
    fetchRidesAndUsers();
    if (user.role === "ADMIN") fetchInquiries();
  }, []);

  const handleResolveInquiry = async (inquiry) => {
    if (!inquiry?.userEmail) {
      alert("Invalid inquiry data: missing user email");
      return;
    }

    try {
      const res = await api.put(`/inquiries/resolve`, { userEmail: inquiry.userEmail }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200) {
        setInquiries((prev) =>
          prev.map((inq) =>
            inq.userEmail === inquiry.userEmail ? { ...inq, resolved: true } : inq
          )
        );
        alert("Inquiry resolved successfully!");
      } else {
        alert("Failed to resolve inquiry. Please try again.");
      }
    } catch (err) {
      console.error("Failed to resolve inquiry:", err);
      alert(err.response?.data?.message || "Error resolving inquiry");
    }
  };

  const normalizeRides = (rides) =>
    rides.map((ride) => {
      const acceptedPassengers = Array.from(
        new Map(
          (ride.acceptedPassengers || []).map((p) =>
            typeof p === "object"
              ? [p.id, { id: p.id, name: p.name || "Unknown User" }]
              : [p, { id: p, name: "Unknown User" }]
          )
        ).values()
      );

      const requests = Array.from(
        new Map(
          (ride.requests || []).map((r) =>
            typeof r === "object"
              ? [r.id, { id: r.id, name: r.name || "Unknown User" }]
              : [r, { id: r, name: "Unknown User" }]
          )
        ).values()
      );

      return { ...ride, acceptedPassengers, requests };
    });

  const fetchRidesAndUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      let created = [];
      let requested = [];
      let approved = [];
      let canceled = [];
      let canceledRequests = [];

      if (user.role === "OWNER") {
        const createdRes = await api.get("/rides/my-offers", { headers: { Authorization: `Bearer ${token}` } });
        const allCreated = createdRes.data || [];
        created = allCreated.filter(r => r.active !== false);
        canceled = allCreated.filter(r => r.active === false);

        const passengerRes = await api.get("/rides/my-rides", { headers: { Authorization: `Bearer ${token}` } });
        requested = passengerRes.data?.pendingRequests || [];
        approved = passengerRes.data?.approvedRides || [];
        canceledRequests = passengerRes.data?.canceledRides || [];
      } else if (user.role === "ADMIN") {
        const allRidesRes = await api.get("/rides/all", { headers: { Authorization: `Bearer ${token}` } });
        const allRides = allRidesRes.data || [];
        created = allRides.filter(r => r.active !== false);
        canceled = allRides.filter(r => r.active === false);

        const allUsersRes = await api.get("/users/all", { headers: { Authorization: `Bearer ${token}` } });
        setUsers(allUsersRes.data || []);
      } else {
        const res = await api.get("/rides/my-rides", { headers: { Authorization: `Bearer ${token}` } });
        requested = res.data?.pendingRequests || [];
        approved = res.data?.approvedRides || [];
        canceledRequests = res.data?.canceledRides || [];
      }

      const filterFn = (ride) =>
        (!origin || ride.origin.toLowerCase().includes(origin.toLowerCase())) &&
        (!destination || ride.destination.toLowerCase().includes(destination.toLowerCase()));

      setCreatedRides(normalizeRides(created.filter(filterFn)));
      setCanceledRides(normalizeRides(canceled.filter(filterFn)));
      setRequestedRides(normalizeRides(requested.filter(filterFn)));
      setApprovedRides(normalizeRides(approved.filter(filterFn)));
      setCanceledRequests(normalizeRides(canceledRequests.filter(filterFn)));

    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error loading rides/users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRidesAndUsers(); }, []);

  const toggleDetails = (rideId) => {
    if (!rideDetails[rideId]) fetchRideDetails(rideId);
    setExpandedRideIds((prev) => prev.includes(rideId) ? prev.filter((id) => id !== rideId) : [...prev, rideId]);
  };

  const toggleUserDetails = (userId) => {
    setExpandedUserIds((prev) => prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]);
  };

  const fetchRideDetails = async (rideId) => {
    try {
      const res = await api.get(`/rides/${rideId}`, { headers: { Authorization: `Bearer ${token}` } });
      setRideDetails(prev => ({ ...prev, [rideId]: res.data }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptPassenger = async (rideId, passengerId) => {
    try {
      await api.post(`/rides/${rideId}/accept/${passengerId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchRidesAndUsers();
    } catch (err) {
      console.error(err); alert(err.response?.data?.message || "Failed to accept passenger");
    }
  };

  const handleCancelRequest = async (rideId, passengerId = null) => {
    if (!window.confirm("Are you sure you want to cancel this ride/request?")) return;
    try {
      if (passengerId) await api.post(`/rides/${rideId}/cancel-passenger/${passengerId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      else await api.post(`/rides/${rideId}/cancel`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchRidesAndUsers();
    } catch (err) {
      console.error(err); alert(err.response?.data?.message || "Failed to cancel request");
    }
  };

  const handleCancelRide = async (rideId) => {
    if (!window.confirm("Are you sure you want to cancel this ride?")) return;
    try {
      const res = await api.post(`/rides/${rideId}/cancel-ride`, {}, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 200) {
        alert(res.data?.message || "Ride canceled successfully");
        fetchRidesAndUsers();
      } else alert(res.data?.message || "Unexpected response from server");
    } catch (err) { console.error(err); alert(err?.response?.data?.message || "Failed to cancel ride"); }
  };

  const handleRemovePassenger = async (rideId, passengerId) => {
    if (!window.confirm("Remove this passenger from the ride?")) return;
    try {
      await api.post(`/rides/${rideId}/remove-passenger/${passengerId}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      fetchRidesAndUsers();
      alert("Passenger removed successfully");
    } catch (err) { console.error(err); alert(err.response?.data?.message || "Failed to remove passenger"); }
  };

  const handleEditRide = (ride) => {
    setEditRideId(ride.id);
    setRideEditForm({
      origin: ride.origin || "",
      destination: ride.destination || "",
      pricePerSeat: ride.pricePerSeat || 0,
      totalSeats: ride.totalSeats || 0,
      schedule: ride.schedule || "",
      startTime: ride.startTime ? new Date(ride.startTime).toISOString().slice(0,16) : ""
    });
  };

  const handleRideFormChange = (e) => setRideEditForm({ ...rideEditForm, [e.target.name]: e.target.value });
  const handleRideFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/rides/${editRideId}`, rideEditForm, { headers: { Authorization: `Bearer ${token}` } });
      setEditRideId(null);
      fetchRidesAndUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update ride");
    }
  };

  const handleEditUser = (u) => {
    setEditUserId(u.id);
    setUserEditForm({ name: u.name || "", email: u.email || "", role: u.role || "USER" });
  };

  const handleUserFormChange = (e) => setUserEditForm({ ...userEditForm, [e.target.name]: e.target.value });
  const handleUserFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${editUserId}`, userEditForm, { headers: { Authorization: `Bearer ${token}` } });
      setEditUserId(null);
      fetchRidesAndUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update user");
    }
  };

  const handleSearch = () => fetchRidesAndUsers();

  // ===================== RIDE CARD UI =====================
  const renderRideCard = (ride, isOwnerView = false, showCancelButton = false) => {
    const isCanceled = ride.active === false;

    const approvedPassengers = (ride.acceptedPassengers || []).map((p) =>
      typeof p === "object"
        ? { id: p.id, name: p.name || `User (${p.id})` }
        : { id: p, name: `User (${p})` }
    );

    const pendingRequests =
      ride.requests && ride.requests.length > 0
        ? ride.requests
        : (ride.requestedUserIds || []).map((id) => {
            const matchedUser = users.find((u) => u.id === id);
            return {
              id,
              name: matchedUser ? matchedUser.name : `User (${id})`,
            };
          });

    return (
      <div
        key={ride.id}
        className={`relative bg-white shadow-md rounded-2xl p-5 border transition-all duration-200 hover:shadow-xl hover:scale-[1.02] ${
          isCanceled ? "border-red-500 bg-red-50 opacity-90" : "border-gray-200"
        }`}
      >
        {isCanceled && (
          <div className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
            Canceled
          </div>
        )}

        <h2 className="text-lg font-bold mb-2 text-gray-800">{ride.origin} → {ride.destination}</h2>
        <p className="text-sm text-gray-600">Owner: {ride.ownerName || "N/A"}</p>
        <p className="text-sm text-gray-600">Price: Rs {ride.pricePerSeat || "N/A"}</p>
        <p className="text-sm text-gray-600">Seats: {ride.seatsAvailable || 0}/{ride.totalSeats || 0}</p>

        {!isCanceled && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => toggleDetails(ride.id)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition"
            >
              {expandedRideIds.includes(ride.id) ? "Hide Details" : "View Details"}
            </button>

            {/* ADMIN buttons */}
            {user.role === "ADMIN" && (
              <>
                <button
                  onClick={() => handleEditRide(ride)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition"
                >
                  Edit Ride
                </button>
                <button
                  onClick={() => handleCancelRide(ride.id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition"
                >
                  Cancel Ride
                </button>
              </>
            )}
            {user.role === "OWNER" && (
              <button
                onClick={() => handleCancelRide(ride.id)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition"
              >
                Cancel Ride
              </button>
            )}
          </div>
        )}

        {expandedRideIds.includes(ride.id) && (
          <div className="mt-3 border-t pt-3 text-gray-700 space-y-1 text-sm">
            <p>Contact: {rideDetails[ride.id]?.ownerContact || "N/A"}</p>
            <p>Start Time: {rideDetails[ride.id]?.startTime ? new Date(rideDetails[ride.id].startTime).toLocaleString() : ride.startTime ? new Date(ride.startTime).toLocaleString() : "N/A"}</p>
            <p>Schedule: {rideDetails[ride.id]?.schedule || ride.schedule || "N/A"}</p>
            <p>Created At: {rideDetails[ride.id]?.createdAt ? new Date(rideDetails[ride.id].createdAt).toLocaleString() : ride.createdAt ? new Date(ride.createdAt).toLocaleString() : "N/A"}</p>
          </div>
        )}

        {pendingRequests.length > 0 && user.role !== "ADMIN" && (
          <div className="mt-3">
            <h3 className="font-semibold text-blue-600 mb-2 text-sm uppercase tracking-wide">Pending Requests</h3>
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                className="flex flex-col border border-gray-200 p-3 rounded-xl mb-2 bg-gray-50 shadow-sm hover:shadow-md transition"
              >
                <span className="mb-1 font-medium text-gray-800 text-sm truncate">{req.name} ({req.id})</span>
                {isOwnerView && (
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => handleAcceptPassenger(ride.id, req.id)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded-lg text-xs font-medium transition"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleCancelRequest(ride.id, req.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg text-xs font-medium transition"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {ride.acceptedPassengers?.length > 0 && (
          <div className="mt-3 text-sm">
            <div className="font-medium text-green-700 mb-1">Approved Passengers:</div>
            <div className="flex flex-col gap-1">
              {ride.acceptedPassengers.map((p) => (
                <div key={p.id} className="flex justify-between items-center">
                  <span className="text-gray-800 text-xs">{p.name} ({p.id})</span>
                  {(user.role === "ADMIN" || ride.ownerId === user.id) && (
                    <button
                      onClick={() => handleRemovePassenger(ride.id, p.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 text-xs rounded-lg transition"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderSection = (title, ridesArray, isOwnerView = false, showCancelButton = false) => (
    <>
      <h2 className={`text-xl font-semibold mt-8 mb-4 ${title.includes("Canceled") ? "text-red-500" : title.includes("Approved") ? "text-green-600" : title.includes("Requested") || title.includes("Pending") ? "text-blue-600" : "text-gray-700"}`}>
        {title}
      </h2>
      {ridesArray.length === 0 ? (
        <p className="text-gray-500 italic">No {title.toLowerCase()}.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{ridesArray.map(ride => renderRideCard(ride, isOwnerView, showCancelButton))}</div>
      )}
    </>
  );

  const renderAdminUserCard = (u) => (
    <div key={u.id} className="bg-white shadow-md rounded-2xl p-5 border flex flex-col transition hover:shadow-xl hover:scale-[1.02]">
      <div>
        <h3 className="text-lg font-bold mb-2">{u.name} ({u.role})</h3>
        <p className="text-sm text-gray-600">Email: {u.email}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={() => handleEditUser(u)} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded-lg text-sm transition">Edit User</button>
        </div>
        {expandedUserIds.includes(u.id) && (
          <div className="mt-3 border-t pt-3 text-gray-700 space-y-1 text-sm">
            <p>ID: {u.id}</p>
            <p>Name: {u.name}</p>
            <p>Email: {u.email}</p>
            <p>Role: {u.role}</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center gap-2">
        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18M3 17h18" />
        </svg>
        {user.role} Dashboard
      </h1>

      {/* Search */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <input placeholder="Origin (e.g., Colombo)" value={origin} onChange={(e) => setOrigin(e.target.value)} className="border border-gray-300 p-3 rounded-xl w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white transition duration-200"/>
        <input placeholder="Destination (e.g., Matara)" value={destination} onChange={(e) => setDestination(e.target.value)} className="border border-gray-300 p-3 rounded-xl w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white transition duration-200"/>
        <button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl transition duration-200 shadow-md flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
          </svg>
          Search
        </button>
        {user?.role === "OWNER" && <Link to="/create-ride" className="ml-auto bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-xl transition duration-200 shadow-md flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Create Ride
        </Link>}

      </div>

      {loading && <div className="text-center py-6 text-gray-500 font-medium">Loading rides/users...</div>}
      {error && <div className="text-center py-2 text-red-600 font-medium">{error}</div>}

      {/* OWNER Sections */}
      {user.role === "OWNER" && <>
        {renderSection("🚗 Created Rides as Owner", createdRides, true)}
        {renderSection("📝 Requested Rides as User", requestedRides, false, true)}
        {renderSection("✅ Approved Rides as User", approvedRides)}
        {renderSection("❌ Canceled Ride Requests as User", canceledRequests, false)}
      </>}

      {/* USER Sections */}
      {user.role === "USER" && <>
        {renderSection("⏳ Pending Ride Requests", requestedRides, false, true)}
        {renderSection("✅ Approved Rides", approvedRides)}
        {renderSection("❌ Canceled Ride Requests", canceledRequests)}
      </>}


      {user && (user.role === "OWNER" || user.role === "USER") && <MyInquiries />}

      {/* ================= ADMIN DASHBOARD TOTAL ================= */}
      {user.role === "ADMIN" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-purple-100 p-5 rounded-2xl shadow-md flex flex-col items-center justify-center transition hover:shadow-xl hover:scale-[1.02]">
            <svg className="w-10 h-10 mb-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A9.969 9.969 0 0012 20a9.969 9.969 0 006.879-2.196M15 11a3 3 0 11-6 0 3 3 0 016 0zM19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2" />
            </svg>
            <h3 className="text-lg font-semibold">Total Users</h3>
            <p className="text-gray-700 text-xl font-bold">{users.length}</p>
          </div>

          {/* Total Rides */}
          <div className="bg-blue-100 p-5 rounded-2xl shadow-md flex flex-col items-center justify-center transition hover:shadow-xl hover:scale-[1.02]">
            <svg className="w-10 h-10 mb-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 13l1.5-2.5a2 2 0 012-1h13a2 2 0 012 2v5a2 2 0 01-2 2H6l-3 3v-7z" />
            </svg>
            <h3 className="text-lg font-semibold">Total Rides</h3>
            <p className="text-gray-700 text-xl font-bold">{createdRides.length + canceledRides.length}</p>
          </div>

          {/* Total Canceled Rides */}
          <div className="bg-red-100 p-5 rounded-2xl shadow-md flex flex-col items-center justify-center transition hover:shadow-xl hover:scale-[1.02]">
            <svg className="w-10 h-10 mb-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <h3 className="text-lg font-semibold">Canceled Rides</h3>
            <p className="text-gray-700 text-xl font-bold">{canceledRides.length}</p>
          </div>

          {/* Total Requested Rides */}
          <div className="bg-green-100 p-5 rounded-2xl shadow-md flex flex-col items-center justify-center transition hover:shadow-xl hover:scale-[1.02]">
            <svg className="w-10 h-10 mb-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold">Pending Requests</h3>
            <p className="text-gray-700 text-xl font-bold">{requestedRides.length}</p>
          </div>
        </div>
      )}

      {/* ADMIN Section */}
      {user.role === "ADMIN" && (
        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-purple-700 mb-4">📩 User Inquiries & Issue Reports</h2>
          {inquiryLoading && <p className="text-gray-500">Loading inquiries...</p>}
          {inquiryError && <p className="text-red-600">{inquiryError}</p>}
          {inquiries.length === 0 ? <p className="text-gray-500 italic">No inquiries found.</p> :
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {inquiries.map((inq) => (
                <div key={inq._id} className="p-5 rounded-2xl shadow-md border transition hover:shadow-xl hover:scale-[1.02] bg-white">
                  <h3 className="font-semibold text-lg mb-1">{inq.subject || "No Subject"}</h3>
                  <p className="text-sm text-gray-700 mb-2"><span className="font-medium">From:</span> {inq.userName || "Anonymous"} ({inq.userEmail})</p>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">{inq.message}</p>
                  <div className="flex justify-between items-center">
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${inq.resolved ? "bg-green-500 text-white" : "bg-yellow-500 text-white"}`}>
                      {inq.resolved ? "Resolved" : "Pending"}
                    </span>
                    {!inq.resolved && (
                      <button
                        onClick={() => handleResolveInquiry(inq)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          }
        </div>
      )}

      {/* Admin Rides & Users */}
      {user.role === "ADMIN" && <>
        {renderSection("All Rides", createdRides, false, true)}
        {editRideId && (
          <div ref={rideEditFormRef} className="mt-6 bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Edit Ride</h3>
            <form onSubmit={handleRideFormSubmit} className="flex flex-col gap-3">
              <input name="origin" value={rideEditForm.origin} onChange={handleRideFormChange} placeholder="Origin" className="border p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-400"/>
              <input name="destination" value={rideEditForm.destination} onChange={handleRideFormChange} placeholder="Destination" className="border p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-400"/>
              <input name="pricePerSeat" value={rideEditForm.pricePerSeat} onChange={handleRideFormChange} placeholder="Price" type="number" className="border p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-400"/>
              <input name="totalSeats" value={rideEditForm.totalSeats} onChange={handleRideFormChange} placeholder="Seats" type="number" className="border p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-400"/>
              <select name="schedule" value={rideEditForm.schedule} onChange={handleRideFormChange} className="border p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-400">
                <option value="ONETIME">One-time</option>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
              </select>
              <DatePicker
                selected={rideEditForm.startTime ? new Date(rideEditForm.startTime) : null}
                onChange={(date) => setRideEditForm({ ...rideEditForm, startTime: date ? date.toISOString() : "" })}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="yyyy-MM-dd HH:mm"
                placeholderText="Select date and time"
                className="border p-3 rounded-xl w-full bg-white focus:ring-2 focus:ring-blue-400"
              />
              <div className="flex gap-3">
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl transition">Update Ride</button>
                <button type="button" onClick={() => setEditRideId(null)} className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-xl transition">Cancel</button>
              </div>
            </form>
          </div>
        )}
        {renderSection("Canceled Rides", canceledRides, true)}

        <h2 className="text-xl font-semibold mt-8 mb-4">All Users</h2>
        <div className="flex flex-wrap items-center gap-4 mb-6 mt-4">
          <input
            type="text"
            placeholder="Search users by name or email"
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            className="border border-gray-300 p-3 rounded-xl w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white"
          />
          <button
            onClick={() => setUserSearch("")}
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded-xl text-sm transition"
          >
            Clear
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {users
              .filter(u =>
                    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                    u.email.toLowerCase().includes(userSearch.toLowerCase())
                  )
              .map(u => renderAdminUserCard(u))}
        </div>

        {editUserId && (
          <div ref={userEditFormRef} className="mt-6 bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Edit User</h3>
            <form onSubmit={handleUserFormSubmit} className="flex flex-col gap-3">
              <input name="name" value={userEditForm.name} onChange={handleUserFormChange} placeholder="Name" className="border p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-400"/>
              <input name="email" value={userEditForm.email} onChange={handleUserFormChange} placeholder="Email" className="border p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-400"/>
              <select name="role" value={userEditForm.role} onChange={handleUserFormChange} className="border p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-400">
                <option value="USER">USER</option>
                <option value="OWNER">OWNER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              <div className="flex gap-3">
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl transition">Update User</button>
                <button type="button" onClick={() => setEditUserId(null)} className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-xl transition">Cancel</button>
              </div>
            </form>
          </div>
        )}
      </>}
    </div>
  );
}
