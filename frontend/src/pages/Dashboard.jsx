import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import MyInquiries from "../components/MyInquiries";
import PaymentModal from "../components/PaymentModal";
import CardPaymentGateway from "../components/CardPaymentGateway";

export default function Dashboard() {
  const navigate = useNavigate();
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
  const inquirySectionRef = useRef(null);
  const [userSearch, setUserSearch] = useState("");
  const [canceledRequests, setCanceledRequests] = useState([]);
  
  // Payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCardGateway, setShowCardGateway] = useState(false);
  const [selectedRideForPayment, setSelectedRideForPayment] = useState(null);
  const [paymentStatuses, setPaymentStatuses] = useState({}); // Track payment status per ride

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  // Check authentication on component mount
  useEffect(() => {
    if (!token || !user) {
      console.error("No authentication token found. Redirecting to login...");
      navigate("/login");
    }
  }, [token, user, navigate]);

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
      const res = await api.get("/inquiries", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setInquiries(res.data || []);
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
    if (!inquiry?.id) {
      alert("Invalid inquiry data: missing inquiry ID");
      return;
    }

    const inquiryId = inquiry.id;

    try {
      const res = await api.put(`/inquiries/${inquiryId}`, { resolved: true }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 200) {
        setInquiries((prev) =>
          prev.map((inq) =>
            inq.id === inquiryId ? { ...inq, resolved: true } : inq
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

  const enrichRidesWithUserDetails = async (rides) => {
    return Promise.all(
      rides.map(async (ride) => {
        const enrichedRide = { ...ride };

        // Fetch user details for requests
        if (ride.requests && ride.requests.length > 0) {
          enrichedRide.requests = await Promise.all(
            ride.requests.map(async (reqId) => {
              const userId = typeof reqId === "object" ? reqId.id : reqId;
              try {
                const userRes = await api.get(`/users/${userId}`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                return { id: userId, name: userRes.data.name, email: userRes.data.email };
              } catch (err) {
                // Silently handle missing users - they may have been deleted
                return { id: userId, name: "Unknown User", email: "" };
              }
            })
          );
        }

        // Fetch user details for accepted passengers
        if (ride.acceptedPassengers && ride.acceptedPassengers.length > 0) {
          enrichedRide.acceptedPassengers = await Promise.all(
            ride.acceptedPassengers.map(async (passengerId) => {
              const userId = typeof passengerId === "object" ? passengerId.id : passengerId;
              try {
                const userRes = await api.get(`/users/${userId}`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                return { id: userId, name: userRes.data.name, email: userRes.data.email };
              } catch (err) {
                // Silently handle missing users - they may have been deleted
                return { id: userId, name: "Unknown User", email: "" };
              }
            })
          );
        }

        return enrichedRide;
      })
    );
  };

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
        // Fetch rides created by owner
        const createdRes = await api.get("/rides/my-offers", { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        const allCreated = createdRes.data || [];
        created = allCreated.filter(r => r.active !== false);
        canceled = allCreated.filter(r => r.active === false);

        // Enrich created rides with user details
        created = await enrichRidesWithUserDetails(created);
        canceled = await enrichRidesWithUserDetails(canceled);

        // Fetch rides where owner is a passenger
        const passengerRes = await api.get("/rides/my-rides", { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        requested = passengerRes.data?.pendingRequests || [];
        approved = passengerRes.data?.approvedRides || [];
        canceledRequests = passengerRes.data?.canceledRides || [];

        // Enrich passenger rides with user details
        requested = await enrichRidesWithUserDetails(requested);
        approved = await enrichRidesWithUserDetails(approved);
        canceledRequests = await enrichRidesWithUserDetails(canceledRequests);

      } else if (user.role === "ADMIN") {
        const allRidesRes = await api.get("/rides", { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        const allRides = allRidesRes.data || [];
        created = allRides.filter(r => r.active !== false);
        canceled = allRides.filter(r => r.active === false);

        // Enrich rides with user details for admin
        created = await enrichRidesWithUserDetails(created);
        canceled = await enrichRidesWithUserDetails(canceled);

        const allUsersRes = await api.get("/users/all", { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        setUsers(allUsersRes.data || []);

      } else {
        // USER role
        const res = await api.get("/rides/my-rides", { 
          headers: { Authorization: `Bearer ${token}` } 
        });
        requested = res.data?.pendingRequests || [];
        approved = res.data?.approvedRides || [];
        canceledRequests = res.data?.canceledRides || [];

        // Enrich user rides with passenger details
        requested = await enrichRidesWithUserDetails(requested);
        approved = await enrichRidesWithUserDetails(approved);
        canceledRequests = await enrichRidesWithUserDetails(canceledRequests);
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
      setError(err.response?.data || err.response?.data?.message || "Error loading rides/users");
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
      const res = await api.get(`/rides/${rideId}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      const rideData = res.data;
      
      // Fetch owner details to get vehicle information
      if (rideData.ownerId) {
        try {
          const ownerRes = await api.get(`/users/${rideData.ownerId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          rideData.ownerDetails = ownerRes.data;
        } catch (err) {
          console.error("Failed to fetch owner details:", err);
        }
      }

      // Fetch user details for pending requests
      if (rideData.requests && rideData.requests.length > 0) {
        const requestsWithDetails = await Promise.all(
          rideData.requests.map(async (reqId) => {
            try {
              const userRes = await api.get(`/users/${reqId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              return { id: reqId, name: userRes.data.name, email: userRes.data.email };
            } catch (err) {
              if (err.response?.status !== 404) {
                console.error(`Failed to fetch user ${reqId}:`, err);
              }
              return { id: reqId, name: "Unknown User", email: "" };
            }
          })
        );
        rideData.requests = requestsWithDetails;
      }

      // Fetch user details for accepted passengers
      if (rideData.acceptedPassengers && rideData.acceptedPassengers.length > 0) {
        const passengersWithDetails = await Promise.all(
          rideData.acceptedPassengers.map(async (passengerId) => {
            try {
              const userRes = await api.get(`/users/${passengerId}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              return { id: passengerId, name: userRes.data.name, email: userRes.data.email };
            } catch (err) {
              if (err.response?.status !== 404) {
                console.error(`Failed to fetch user ${passengerId}:`, err);
              }
              return { id: passengerId, name: "Unknown User", email: "" };
            }
          })
        );
        rideData.acceptedPassengers = passengersWithDetails;
      }
      
      setRideDetails(prev => ({ ...prev, [rideId]: rideData }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcceptPassenger = async (rideId, passengerId) => {
    try {
      await api.post(`/rides/${rideId}/accept/${passengerId}`, {}, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      alert("Passenger accepted successfully!");
      fetchRidesAndUsers();
    } catch (err) {
      console.error(err); 
      alert(err.response?.data || err.response?.data?.message || "Failed to accept passenger");
    }
  };

  const handleRejectRequest = async (rideId, passengerId) => {
    if (!window.confirm("Are you sure you want to reject this request?")) return;
    try {
      await api.post(`/rides/${rideId}/reject/${passengerId}`, {}, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      alert("Request rejected successfully!");
      fetchRidesAndUsers();
    } catch (err) {
      console.error(err); 
      alert(err.response?.data || err.response?.data?.message || "Failed to reject request");
    }
  };

  const handleCancelRequest = async (rideId) => {
    if (!window.confirm("Are you sure you want to cancel your booking request?")) return;
    try {
      await api.delete(`/rides/${rideId}/cancel-request`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      alert("Booking request canceled successfully!");
      fetchRidesAndUsers();
    } catch (err) {
      console.error(err); 
      alert(err.response?.data || err.response?.data?.message || "Failed to cancel request");
    }
  };

  const handleContactAdminForCancellation = (rideId) => {
    if (inquirySectionRef.current) {
      inquirySectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      alert("Please submit an inquiry below to request ride cancellation. Include the ride details in your message.");
    }
  };

  const handleCancelRide = async (rideId) => {
    if (!window.confirm("Are you sure you want to cancel this ride? This will set the ride to inactive.")) return;
    try {
      await api.put(`/rides/${rideId}`, { active: false }, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      alert("Ride canceled successfully!");
      fetchRidesAndUsers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to cancel ride");
    }
  };

  const handleRemovePassenger = async (rideId, passengerId) => {
    if (!window.confirm("Remove this passenger from the ride?")) return;
    try {
      await api.delete(`/rides/${rideId}/remove-passenger/${passengerId}`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      fetchRidesAndUsers();
      alert("Passenger removed successfully");
    } catch (err) { 
      console.error(err); 
      alert(err.response?.data || err.response?.data?.message || "Failed to remove passenger"); 
    }
  };

  // Payment handlers
  const handlePayNow = (ride) => {
    setSelectedRideForPayment(ride);
    setShowPaymentModal(true);
  };

  const handlePaymentSelection = async (paymentMethod) => {
    try {
      if (paymentMethod === "CASH") {
        // Update payment status to CASH (will pay driver in person)
        setPaymentStatuses(prev => ({
          ...prev,
          [selectedRideForPayment.id]: { method: "CASH", status: "PENDING" }
        }));
        
        setShowPaymentModal(false);
        alert("Payment method set to CASH. You'll pay the driver directly during the ride.");
      } else if (paymentMethod === "CARD") {
        // Open card gateway for online payment
        setShowPaymentModal(false);
        setShowCardGateway(true);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to process payment selection");
    }
  };

  const handleCardPaymentSuccess = (paymentResult) => {
    // Update payment status to COMPLETED
    setPaymentStatuses(prev => ({
      ...prev,
      [selectedRideForPayment.id]: { 
        method: "CARD", 
        status: "COMPLETED",
        transactionId: paymentResult.transactionId
      }
    }));
    
    setShowCardGateway(false);
    alert(`Payment successful! Transaction ID: ${paymentResult.transactionId}`);
    setSelectedRideForPayment(null);
  };

  const handleClosePaymentModal = () => {
    setShowPaymentModal(false);
    setSelectedRideForPayment(null);
  };

  const handleCloseCardGateway = () => {
    setShowCardGateway(false);
  };

  const handleEditRide = async (ride) => {
    setEditRideId(ride.id);
    
    // Fetch owner details to get vehicle info
    let ownerDetails = {};
    try {
      const ownerRes = await api.get(`/users/${ride.ownerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      ownerDetails = ownerRes.data;
    } catch (err) {
      console.error("Failed to fetch owner details:", err);
    }
    
    setRideEditForm({
      origin: ride.origin || "",
      destination: ride.destination || "",
      pricePerSeat: ride.pricePerSeat || 0,
      totalSeats: ride.totalSeats || 0,
      schedule: ride.schedule || "",
      startTime: ride.startTime ? new Date(ride.startTime).toISOString() : "",
      ownerName: ownerDetails.name || ride.ownerName || "",
      ownerContact: ride.ownerContact || ownerDetails.phone || "",
      vehicleNumber: ownerDetails.vehicleNumber || "",
      vehicleType: ownerDetails.vehicleType || "",
      ownerId: ride.ownerId || ""
    });
  };

  const handleRideFormChange = (e) => setRideEditForm({ ...rideEditForm, [e.target.name]: e.target.value });
  const handleRideFormSubmit = async (e) => {
    e.preventDefault();
    try {
      // Update ride details
      await api.put(`/rides/${editRideId}`, rideEditForm, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      
      // If admin edited owner/vehicle details, update the owner's user record too
      if (user.role === "ADMIN" && rideEditForm.ownerId) {
        await api.put(`/users/${rideEditForm.ownerId}`, {
          name: rideEditForm.ownerName,
          vehicleType: rideEditForm.vehicleType,
          vehicleNumber: rideEditForm.vehicleNumber
        }, { 
          headers: { Authorization: `Bearer ${token}` } 
        });
      }
      
      setEditRideId(null);
      fetchRidesAndUsers();
      alert("Ride updated successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update ride");
    }
  };

  const handleEditUser = (u) => {
    setEditUserId(u.id);
    setUserEditForm({ 
      name: u.name || "", 
      email: u.email || "", 
      role: u.role || "USER",
      phone: u.phone || "",
      vehicleNumber: u.vehicleNumber || "",
      vehicleType: u.vehicleType || ""
    });
  };

  const handleUserFormChange = (e) => setUserEditForm({ ...userEditForm, [e.target.name]: e.target.value });
  const handleUserFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/users/${editUserId}`, userEditForm, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setEditUserId(null);
      fetchRidesAndUsers();
      alert("User updated successfully!");
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update user");
    }
  };

  const handleSearch = () => fetchRidesAndUsers();

  // ===================== RIDE CARD UI =====================
  const renderRideCard = (ride, isOwnerView = false, showCancelButton = false) => {
    const isCanceled = ride.active === false;

    // Use ride details if expanded, otherwise use the enriched ride data
    const displayRide = rideDetails[ride.id] || ride;

    // Map accepted passengers - they should already have name/email from enrichment
    const approvedPassengers = (displayRide.acceptedPassengers || []).map((p) => {
      if (typeof p === "object" && p.name) {
        return p;
      }
      return { id: typeof p === "object" ? p.id : p, name: "Unknown User", email: "" };
    });
    
    // Map pending requests - they should already have name/email from enrichment
    const pendingRequests = (displayRide.requests || []).map((req) => {
      if (typeof req === "object" && req.name) {
        return req;
      }
      return { id: typeof req === "object" ? req.id : req, name: "Unknown User", email: "" };
    });

    return (
      <div
        key={ride.id}
        className={`relative bg-white shadow-lg rounded-2xl p-6 border transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
          isCanceled ? "border-red-300 bg-red-50 opacity-90" : "border-gray-100"
        }`}
      >
        {isCanceled && (
          <span className="absolute top-4 right-4 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
            ❌ Canceled
          </span>
        )}

        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-800 pr-20">{ride.origin} → {ride.destination}</h2>
        </div>

        <div className="space-y-2 text-gray-600 mb-4">
          <p className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            {ride.ownerName || "N/A"}
          </p>
          <p className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Rs {ride.pricePerSeat || "N/A"}
          </p>
          <p className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {ride.seatsAvailable || 0} / {ride.totalSeats || 0} seats
          </p>
        </div>

        {!isCanceled && (
          <div className="pt-4 border-t">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => toggleDetails(ride.id)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-md flex items-center gap-1"
              >
                {expandedRideIds.includes(ride.id) ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                    </svg>
                    Hide Details
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                    View Details
                  </>
                )}
              </button>

              {showCancelButton && user.role !== "ADMIN" && (
                <button
                  onClick={() => handleCancelRequest(ride.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-md"
                >
                  Cancel Request
                </button>
              )}

              {/* Pay Now button for approved rides */}
              {!isOwnerView && !showCancelButton && approvedPassengers.some(p => p.id === user.id) && (
                <>
                  {!paymentStatuses[ride.id] || paymentStatuses[ride.id].status === "PENDING" ? (
                    <button
                      onClick={() => handlePayNow(ride)}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-md flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      Pay Now (Rs {ride.pricePerSeat})
                    </button>
                  ) : paymentStatuses[ride.id].method === "CASH" ? (
                    <div className="bg-yellow-50 border border-yellow-300 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                      <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span className="text-yellow-800 font-medium">Cash payment - Pay driver</span>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-300 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-green-800 font-medium">Paid ✓</span>
                    </div>
                  )}
                </>
              )}

              {user.role === "ADMIN" && (
                <>
                  <button
                    onClick={() => handleEditRide(ride)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-md"
                  >
                    Edit
                  </button>
                  {ride.active && (
                    <button
                      onClick={() => handleCancelRide(ride.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-md"
                    >
                      Cancel Ride
                    </button>
                  )}
                </>
              )}
              {user.role === "OWNER" && isOwnerView && (
                <button
                  onClick={() => handleContactAdminForCancellation(ride.id)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-md"
                >
                  Cancel Ride
                </button>
              )}
            </div>
          </div>
        )}

        {expandedRideIds.includes(ride.id) && (
          <div className="mt-4 border-t pt-6 space-y-6">
            {/* Ride Information Section */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ride Information
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500">Route</p>
                    <p className="font-semibold text-gray-800">{ride.origin} → {ride.destination}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500">Departure Time</p>
                    <p className="font-semibold text-gray-800">{ride.startTime ? new Date(ride.startTime).toLocaleString() : "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500">Seats</p>
                    <p className="font-semibold text-gray-800">{ride.seatsAvailable} / {ride.totalSeats} available</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500">Price per Seat</p>
                    <p className="font-semibold text-green-600 text-lg">Rs {ride.pricePerSeat}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500">Created</p>
                    <p className="font-semibold text-gray-800">{ride.createdAt ? new Date(ride.createdAt).toLocaleDateString() : "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <div>
                    <p className="text-xs text-gray-500">Schedule</p>
                    <p className="font-semibold text-gray-800">{ride.schedule || "One-time"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Driver Information Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Driver Information
              </h3>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {ride.ownerName?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-lg">{ride.ownerName || "N/A"}</p>
                    <p className="text-sm text-gray-600">Ride Owner</p>
                  </div>
                </div>
                
                {/* Vehicle Details */}
                {rideDetails[ride.id]?.ownerDetails?.vehicleType && (
                  <div className="mt-3 pt-3 border-t border-blue-200">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Vehicle Details</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-lg text-sm font-medium text-gray-700 shadow-sm">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z"/>
                          <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0h2.1a2.5 2.5 0 014.9 0H17a1 1 0 001-1v-5l-3-4H3zm1.5 2h10l2.25 3H4.5V6z"/>
                        </svg>
                        {rideDetails[ride.id].ownerDetails.vehicleType}
                      </span>
                      {rideDetails[ride.id].ownerDetails.vehicleNumber && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-white rounded-lg text-sm font-medium text-gray-700 shadow-sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          {rideDetails[ride.id].ownerDetails.vehicleNumber}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Status & Bookings</h3>
              <div className="grid md:grid-cols-3 gap-3">
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-xs text-gray-500 mb-1">Ride Status</p>
                  <p className={`font-bold ${ride.active ? "text-green-600" : "text-red-600"}`}>
                    {ride.active ? "✅ Active" : "❌ Canceled"}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-xs text-gray-500 mb-1">Pending Requests</p>
                  <p className="font-bold text-blue-600">{ride.requests?.length || 0}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-xs text-gray-500 mb-1">Accepted Passengers</p>
                  <p className="font-bold text-green-600">{ride.acceptedPassengers?.length || 0}</p>
                </div>
              </div>
            </div>

            {/* Pending Requests Section - Only for Owners */}
            {pendingRequests.length > 0 && isOwnerView && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Pending Booking Requests ({pendingRequests.length})
                </h3>
                <div className="space-y-3">
                  {pendingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="border border-blue-200 bg-blue-50 p-4 rounded-xl shadow-sm hover:shadow-md transition"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {req.name?.charAt(0).toUpperCase() || "U"}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{req.name}</p>
                            <p className="text-xs text-gray-600">User ID: {req.id}</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                          Pending
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptPassenger(ride.id, req.id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectRequest(ride.id, req.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Accepted Passengers Section */}
            {ride.acceptedPassengers?.length > 0 && (
              <div className="border-t pt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Approved Passengers ({ride.acceptedPassengers.length})
                </h3>
                <div className="space-y-2">
                  {ride.acceptedPassengers.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {p.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">{p.name}</p>
                          <p className="text-xs text-gray-600">User ID: {p.id}</p>
                        </div>
                      </div>
                      {(user.role === "ADMIN" || ride.ownerId === user.id) && (
                        <button
                          onClick={() => handleRemovePassenger(ride.id, p.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm rounded-lg transition font-medium"
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
        )}
      </div>
    );
  };

  const renderSection = (title, ridesArray, isOwnerView = false, showCancelButton = false) => (
    <>
      <h2 className={`text-2xl font-bold mt-8 mb-6 flex items-center gap-2 ${
        title.includes("Canceled") ? "text-red-600" : 
        title.includes("Approved") ? "text-green-600" : 
        title.includes("Requested") || title.includes("Pending") ? "text-blue-600" : 
        "text-gray-800"
      }`}>
        {title}
        <span className="text-sm font-normal text-gray-600">({ridesArray.length})</span>
      </h2>
      {ridesArray.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-md p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-600 font-medium">No {title.toLowerCase().replace(/[🚗📝✅❌⏳]/g, '').trim()}</p>
        </div>
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-extrabold mb-2 flex items-center gap-3">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18M3 17h18" />
            </svg>
            {user.role} Dashboard
          </h1>
          <p className="text-lg opacity-90">Manage your rides and bookings</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">

      {/* Search Section */}
      <div className="bg-white shadow-2xl rounded-2xl p-6 mb-6 -mt-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Search Rides
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <input 
            placeholder="Origin (e.g., Colombo)" 
            value={origin} 
            onChange={(e) => setOrigin(e.target.value)} 
            className="border border-gray-300 p-4 rounded-xl w-full md:flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition"
          />
          <input 
            placeholder="Destination (e.g., Matara)" 
            value={destination} 
            onChange={(e) => setDestination(e.target.value)} 
            className="border border-gray-300 p-4 rounded-xl w-full md:flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white transition"
          />
          <button 
            onClick={handleSearch} 
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl transition shadow-lg flex items-center gap-2 font-semibold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </button>
          {user?.role === "OWNER" && (
            <Link 
              to="/create-ride" 
              className="bg-green-600 hover:bg-green-700 text-white hover:text-white active:text-white focus:text-white px-6 py-4 rounded-xl transition shadow-lg flex items-center gap-2 font-semibold"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Create Ride
            </Link>
          )}
        </div>
      </div>

      {loading && (
        <div className="text-center py-8 bg-white rounded-2xl shadow-md">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading...</h3>
          <p className="text-gray-600">Please wait while we fetch your rides and bookings</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl shadow-md p-6 text-center">
          <svg className="mx-auto h-12 w-12 text-red-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-red-700 font-semibold">{error}</p>
        </div>
      )}

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

      {user && (user.role === "OWNER" || user.role === "USER") && (
        <div ref={inquirySectionRef} className="mt-8">
          <MyInquiries />
        </div>
      )}

      {/* ================= ADMIN DASHBOARD ================= */}
      {user.role === "ADMIN" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-purple-100 p-5 rounded-2xl shadow-md flex flex-col items-center justify-center transition hover:shadow-xl hover:scale-[1.02]">
            <svg className="w-10 h-10 mb-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A9.969 9.969 0 0012 20a9.969 9.969 0 006.879-2.196M15 11a3 3 0 11-6 0 3 3 0 016 0zM19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2" />
            </svg>
            <h3 className="text-lg font-semibold">Total Users</h3>
            <p className="text-gray-700 text-xl font-bold">{users.length}</p>
          </div>

          <div className="bg-blue-100 p-5 rounded-2xl shadow-md flex flex-col items-center justify-center transition hover:shadow-xl hover:scale-[1.02]">
            <svg className="w-10 h-10 mb-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 13l1.5-2.5a2 2 0 012-1h13a2 2 0 012 2v5a2 2 0 01-2 2H6l-3 3v-7z" />
            </svg>
            <h3 className="text-lg font-semibold">Total Rides</h3>
            <p className="text-gray-700 text-xl font-bold">{createdRides.length + canceledRides.length}</p>
          </div>

          <div className="bg-red-100 p-5 rounded-2xl shadow-md flex flex-col items-center justify-center transition hover:shadow-xl hover:scale-[1.02]">
            <svg className="w-10 h-10 mb-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <h3 className="text-lg font-semibold">Canceled Rides</h3>
            <p className="text-gray-700 text-xl font-bold">{canceledRides.length}</p>
          </div>

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
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            User Inquiries & Issue Reports
            <span className="text-sm font-normal text-gray-600">({inquiries.length})</span>
          </h2>
          {inquiryLoading && (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
              <p className="text-gray-500 mt-3">Loading inquiries...</p>
            </div>
          )}
          {inquiryError && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
              <svg className="mx-auto h-12 w-12 text-red-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-red-600 font-semibold">{inquiryError}</p>
            </div>
          )}
          {!inquiryLoading && !inquiryError && inquiries.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="text-gray-600 font-medium">No inquiries found</p>
              <p className="text-gray-400 text-sm mt-1">All user inquiries will appear here</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {inquiries.map((inq) => (
                <div key={inq.id} className={`relative bg-white shadow-lg rounded-2xl p-6 border transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                  inq.resolved ? "border-green-200 bg-green-50" : "border-purple-200 bg-purple-50"
                }`}>
                  {/* Status Badge */}
                  <span className={`absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full shadow-md ${
                    inq.resolved ? "bg-green-600 text-white" : "bg-yellow-500 text-white"
                  }`}>
                    {inq.resolved ? "✓ Resolved" : "⏳ Pending"}
                  </span>

                  {/* Subject */}
                  <div className="pr-20 mb-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      <svg className="w-5 h-5 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                      <span className="line-clamp-1">{inq.subject || "No Subject"}</span>
                    </h3>
                  </div>

                  {/* User Info */}
                  <div className="mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {(inq.userName || "A").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{inq.userName || "Anonymous"}</p>
                        <p className="text-xs text-gray-500 truncate">{inq.userEmail}</p>
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="mb-4">
                    <p className="text-gray-700 text-sm line-clamp-4 leading-relaxed">{inq.message}</p>
                  </div>

                  {/* Action Button */}
                  {!inq.resolved && (
                    <button
                      onClick={() => handleResolveInquiry(inq)}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition shadow-md flex items-center justify-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Mark as Resolved
                    </button>
                  )}
                  {inq.resolved && (
                    <div className="w-full bg-green-100 text-green-700 px-4 py-2 rounded-xl text-sm font-medium text-center flex items-center justify-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Inquiry Resolved
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {/* Admin Rides & Users */}
      {user.role === "ADMIN" && <>
        {renderSection("All Rides", createdRides, false, true)}
        {editRideId && (
          <div ref={rideEditFormRef} className="mt-6 bg-white p-6 rounded-2xl shadow-lg">
            <h3 className="text-xl font-semibold mb-4">Edit Ride - Admin Mode</h3>
            <form onSubmit={handleRideFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <h4 className="text-lg font-semibold mb-2 text-blue-600">Route Details</h4>
              </div>
              <input name="origin" value={rideEditForm.origin} onChange={handleRideFormChange} placeholder="Origin" className="border p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-400"/>
              <input name="destination" value={rideEditForm.destination} onChange={handleRideFormChange} placeholder="Destination" className="border p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-400"/>
              
              <div className="md:col-span-2">
                <h4 className="text-lg font-semibold mb-2 mt-2 text-blue-600">Schedule & Pricing</h4>
              </div>
              <DatePicker
                selected={rideEditForm.startTime ? new Date(rideEditForm.startTime) : null}
                onChange={(date) => setRideEditForm({ ...rideEditForm, startTime: date ? date.toISOString() : "" })}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="yyyy-MM-dd HH:mm"
                placeholderText="Select date and time"
                className="border p-3 rounded-xl w-full bg-white focus:ring-2 focus:ring-blue-400"
                calendarClassName="datepicker-black-icon"
              />
              <select name="schedule" value={rideEditForm.schedule} onChange={handleRideFormChange} className="border p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-400">
                <option value="ONETIME">One-time</option>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
              </select>
              <input name="pricePerSeat" value={rideEditForm.pricePerSeat} onChange={handleRideFormChange} placeholder="Price per Seat (Rs)" type="number" className="border p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-400"/>
              <input name="totalSeats" value={rideEditForm.totalSeats} onChange={handleRideFormChange} placeholder="Total Seats" type="number" className="border p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-400"/>
              
              <div className="md:col-span-2">
                <h4 className="text-lg font-semibold mb-2 mt-2 text-blue-600">Owner Details</h4>
              </div>
              <input name="ownerName" value={rideEditForm.ownerName} onChange={handleRideFormChange} placeholder="Owner Name" className="border p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-400"/>
              <input name="ownerContact" value={rideEditForm.ownerContact} onChange={handleRideFormChange} placeholder="Owner Contact" className="border p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-400"/>
              
              <div className="md:col-span-2">
                <h4 className="text-lg font-semibold mb-2 mt-2 text-blue-600">Vehicle Details</h4>
              </div>
              <select name="vehicleType" value={rideEditForm.vehicleType} onChange={handleRideFormChange} className="border p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-400">
                <option value="">Select Vehicle Type</option>
                <option value="Car">Car</option>
                <option value="Van">Van</option>
                <option value="SUV">SUV</option>
                <option value="Mini Van">Mini Van</option>
                <option value="Bus">Bus</option>
                <option value="Motorcycle">Motorcycle</option>
              </select>
              <input name="vehicleNumber" value={rideEditForm.vehicleNumber} onChange={handleRideFormChange} placeholder="Vehicle Number" className="border p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-400"/>
              
              <div className="flex gap-3 md:col-span-2 mt-4">
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
            <h3 className="text-xl font-semibold mb-4">Edit User - Admin Mode</h3>
            <form onSubmit={handleUserFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <h4 className="text-lg font-semibold mb-2 text-purple-600">Basic Details</h4>
              </div>
              <input name="name" value={userEditForm.name} onChange={handleUserFormChange} placeholder="Name" className="border p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-400"/>
              <input name="email" value={userEditForm.email} onChange={handleUserFormChange} placeholder="Email" className="border p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-400"/>
              <input name="phone" value={userEditForm.phone} onChange={handleUserFormChange} placeholder="Phone Number" className="border p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-400"/>
              <select name="role" value={userEditForm.role} onChange={handleUserFormChange} className="border p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-400">
                <option value="USER">USER</option>
                <option value="OWNER">OWNER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
              
              {userEditForm.role === "OWNER" && (
                <>
                  <div className="md:col-span-2">
                    <h4 className="text-lg font-semibold mb-2 mt-2 text-purple-600">Vehicle Details (OWNER only)</h4>
                  </div>
                  <select name="vehicleType" value={userEditForm.vehicleType} onChange={handleUserFormChange} className="border p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-400">
                    <option value="">Select Vehicle Type</option>
                    <option value="Car">Car</option>
                    <option value="Van">Van</option>
                    <option value="SUV">SUV</option>
                    <option value="Mini Van">Mini Van</option>
                    <option value="Bus">Bus</option>
                    <option value="Motorcycle">Motorcycle</option>
                  </select>
                  <input name="vehicleNumber" value={userEditForm.vehicleNumber} onChange={handleUserFormChange} placeholder="Vehicle Number" className="border p-3 rounded-xl bg-white focus:ring-2 focus:ring-blue-400"/>
                </>
              )}
              
              <div className="flex gap-3 md:col-span-2 mt-4">
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-xl transition">Update User</button>
                <button type="button" onClick={() => setEditUserId(null)} className="bg-gray-500 hover:bg-gray-600 text-white px-5 py-2 rounded-xl transition">Cancel</button>
              </div>
            </form>
          </div>
        )}
      </>}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handleClosePaymentModal}
        onSelectPayment={handlePaymentSelection}
        rideDetails={selectedRideForPayment}
      />

      {/* Card Payment Gateway */}
      <CardPaymentGateway
        isOpen={showCardGateway}
        onClose={handleCloseCardGateway}
        onPaymentSuccess={handleCardPaymentSuccess}
        bookingDetails={{
          bookingId: selectedRideForPayment?.id,
          amount: selectedRideForPayment?.pricePerSeat || 0,
          rideId: selectedRideForPayment?.id
        }}
      />
    </div>
  );
}
