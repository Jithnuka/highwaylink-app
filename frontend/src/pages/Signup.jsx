import React, { useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, User, Car, Tag } from "lucide-react";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [role, setRole] = useState("USER"); 
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const { login } = useContext(AuthContext);
  const nav = useNavigate();

  const handleSubmit = async () => {
    if (!agreeTerms) {
      alert("Please agree to the Terms of Service and Privacy Policy");
      return;
    }

    if (!gender) {
      alert("Please select your gender");
      return;
    }

    if (!name || !email || !password || !phone) {
      alert("Please fill in all required fields");
      return;
    }

    if (role === "OWNER" && (!vehicleNumber || !vehicleType)) {
      alert("Please provide vehicle information");
      return;
    }

    try {
      const payload = {
        name,
        email,
        password,
        phone,
        gender,
        role
      };

      // Add vehicle info only if role is OWNER
      if (role === "OWNER") {
        payload.vehicleNumber = vehicleNumber;
        payload.vehicleType = vehicleType;
      }

      const res = await api.post("/auth/signup", payload);
      // Auto-login after successful signup
      if (res.data && res.data.token && res.data.user) {
        login(res.data.token, res.data.user);
        alert("Signup successful! Welcome to HighwayLink!");
        nav("/dashboard");
      } else {
        alert("Signup successful! Please login.");
        nav("/login");
      }
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || err?.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Brand Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-500 to-green-500 relative overflow-hidden">
        <div className="absolute top-10 left-10 w-64 h-64 bg-blue-400 rounded-full opacity-20 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 bg-green-400 rounded-full opacity-20 blur-3xl"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-center w-full text-white px-8">
          <div className="w-32 h-32 bg-blue-400 bg-opacity-30 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {role === "OWNER" ? "Become a Driver" : "Join HighwayLink"}
          </h1>
          <p className="text-sm text-center mb-4 text-purple-100 max-w-md">
            {role === "OWNER" 
              ? "Register your vehicle and start earning by offering rides to passengers."
              : "Create your account and start booking rides with just a few clicks."
            }
          </p>
          <p className="text-sm italic text-blue-100">
            {role === "OWNER" ? "Drive, Earn, Grow" : "Simple, Fast, Reliable"}
          </p>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 p-3 overflow-y-auto">
        <div className="w-full max-w-md my-4">
          <div className="bg-white rounded-3xl shadow-lg p-5">
            {/* Header */}
            <div className="mb-3">
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Create Account
              </h2>
              <p className="text-xs text-gray-500">Sign up to start booking rides</p>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              {/* Role Selection */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">
                  I want to sign up as:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("USER")}
                    className={`p-2 border-2 rounded-xl transition-all ${
                      role === "USER"
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-blue-300"
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <User className="h-6 w-6 text-gray-600" />
                      <span className="text-sm font-semibold text-gray-900">Passenger</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("OWNER")}
                    className={`p-2 border-2 rounded-xl transition-all ${
                      role === "OWNER"
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-blue-300"
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <Car className="h-6 w-6 text-gray-600" />
                      <span className="text-sm font-semibold text-gray-900">Vehicle Owner</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Full Name */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name"
                    className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Phone Number (10-15 digits)"
                    className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password (min 6 characters)"
                    className="w-full pl-12 pr-12 py-2.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 bg-transparent focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Gender Selection - Enhanced Tile Design */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Select Gender <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setGender("MALE")}
                    className={`p-3 border-2 rounded-xl transition-all transform hover:scale-105 ${
                      gender === "MALE"
                        ? "border-blue-600 bg-blue-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:shadow"
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        gender === "MALE" ? "bg-blue-100" : "bg-gray-100"
                      }`}>
                        <svg className={`h-6 w-6 ${gender === "MALE" ? "text-blue-600" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span className={`text-sm font-semibold ${
                        gender === "MALE" ? "text-blue-700" : "text-gray-700"
                      }`}>
                        Male
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGender("FEMALE")}
                    className={`p-3 border-2 rounded-xl transition-all transform hover:scale-105 ${
                      gender === "FEMALE"
                        ? "border-pink-600 bg-pink-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-pink-300 hover:shadow"
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        gender === "FEMALE" ? "bg-pink-100" : "bg-gray-100"
                      }`}>
                        <svg className={`h-6 w-6 ${gender === "FEMALE" ? "text-pink-600" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span className={`text-sm font-semibold ${
                        gender === "FEMALE" ? "text-pink-700" : "text-gray-700"
                      }`}>
                        Female
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setGender("OTHER")}
                    className={`p-3 border-2 rounded-xl transition-all transform hover:scale-105 ${
                      gender === "OTHER"
                        ? "border-purple-600 bg-purple-50 shadow-md"
                        : "border-gray-200 bg-white hover:border-purple-300 hover:shadow"
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        gender === "OTHER" ? "bg-purple-100" : "bg-gray-100"
                      }`}>
                        <svg className={`h-6 w-6 ${gender === "OTHER" ? "text-purple-600" : "text-gray-500"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span className={`text-sm font-semibold ${
                        gender === "OTHER" ? "text-purple-700" : "text-gray-700"
                      }`}>
                        Other
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Vehicle Information - Only for Vehicle Owners */}
              {role === "OWNER" && (
                <div className="space-y-3 pt-3 border-t-2 border-gray-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Car className="h-5 w-5 text-blue-600" />
                    <p className="text-sm font-semibold text-gray-900">Vehicle Information</p>
                  </div>
                  
                  {/* Vehicle Number */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Vehicle Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Tag className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        value={vehicleNumber}
                        onChange={(e) => setVehicleNumber(e.target.value)}
                        placeholder="e.g., CAB-1234"
                        className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900"
                      />
                    </div>
                  </div>

                  {/* Vehicle Type */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">
                      Vehicle Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Car className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        value={vehicleType}
                        onChange={(e) => setVehicleType(e.target.value)}
                        className="w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-gray-900 appearance-none cursor-pointer"
                      >
                        <option value="">Select Vehicle Type</option>
                        <option value="Car">🚗 Car</option>
                        <option value="Van">🚐 Van</option>
                        <option value="SUV">🚙 SUV</option>
                        <option value="Bus">🚌 Bus</option>
                        <option value="Motorcycle">🏍️ Motorcycle</option>
                        <option value="Other">🚘 Other</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Terms Agreement */}
              <div className="flex items-start pt-2">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                />
                <label className="ml-2 text-xs text-gray-600">
                  I agree to the{" "}
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium underline">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-blue-600 hover:text-blue-700 font-medium underline">
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Create Account Button */}
              <button
                onClick={handleSubmit}
                disabled={!agreeTerms || !gender}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-2.5 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                Create Account
              </button>
            </div>

            {/* Login Link */}
            <p className="text-center mt-3 text-xs text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="text-blue-600 hover:text-blue-700 font-semibold underline">
                Login here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
