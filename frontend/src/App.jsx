import React, { useContext } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import CreateRide from "./pages/CreateRide";
import RideDetails from "./pages/RideDetails";
import InfoSupport from "./pages/InfoSupport";
import SearchRides from "./pages/SearchRides";
import { AuthContext } from "./contexts/AuthContext";
import NavBar from "./components/NavBar";
import FloatingChatButton from "./components/FloatingChatButton";
import { Toaster } from 'react-hot-toast';

function PrivateRoute({ children }) {
  const { user } = useContext(AuthContext);
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <NavBar />
      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/info" element={<InfoSupport />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/create-ride"
            element={
              <PrivateRoute>
                <CreateRide />
              </PrivateRoute>
            }
          />
          <Route
            path="/search-rides"
            element={
              <PrivateRoute>
                <SearchRides />
              </PrivateRoute>
            }
          />
          <Route
            path="/ride/:id"
            element={
              <PrivateRoute>
                <RideDetails />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>

      {/* Global Toast Notifications */}
      <Toaster position="top-right" />

      {/* Floating Chatbot Button - Available on all pages */}
      <FloatingChatButton />
    </div>
  );
}