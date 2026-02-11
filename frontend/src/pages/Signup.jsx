import React, { useState, useContext } from "react";
import api from "../api/axios";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, User, Car, Tag, Mail, Phone, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";

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
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!agreeTerms) {
      toast.error("Please agree to the Terms of Service");
      return;
    }

    if (!gender) {
      toast.error("Please select your gender");
      return;
    }

    if (role === "OWNER" && (!vehicleNumber || !vehicleType)) {
      toast.error("Please provide vehicle information");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name,
        email,
        password,
        phone,
        gender,
        role
      };

      if (role === "OWNER") {
        payload.vehicleNumber = vehicleNumber;
        payload.vehicleType = vehicleType;
      }

      const res = await api.post("/auth/signup", payload);

      if (res.data && res.data.token && res.data.user) {
        login(res.data.token, res.data.user);
        toast.success("Welcome to HighwayLink!");
        nav("/dashboard");
      } else {
        toast.success("Signup successful! Please login.");
        nav("/login");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || err?.response?.data?.error || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-gray-50">
      {/* Left Panel - Brand Section */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden text-white items-center justify-center p-12"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-white opacity-5 rounded-full blur-3xl pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 1.5, 1], x: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
          className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-blue-400 opacity-10 rounded-full blur-3xl pointer-events-none"
        />

        <div className="relative z-10 max-w-lg text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-8 flex justify-center"
          >
            <div className="w-24 h-24 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-xl">
              <svg className="w-14 h-14" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
              </svg>
            </div>
          </motion.div>

          <motion.h1
            key={role}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-4xl font-extrabold mb-6 tracking-tight leading-tight"
          >
            {role === "OWNER" ? "Partner with Us" : "Join the Community"}
          </motion.h1>

          <motion.p
            key={`${role}-desc`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-lg text-blue-100/90 leading-relaxed font-light"
          >
            {role === "OWNER"
              ? "Turn your vehicle into an earning machine. Connect with passengers and grow your business."
              : "Experience comfortable, reliable, and safe travel across the island with HighwayLink."}
          </motion.p>
        </div>
      </motion.div>

      {/* Right Panel - Signup Form */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-8 bg-gray-50 overflow-y-auto"
      >
        <div className="w-full max-w-lg my-auto">
          <div className="text-center lg:text-left mb-8">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create Account</h2>
            <p className="mt-2 text-gray-500">Sign up to get started.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Switcher */}
            <div className="bg-gray-100 p-1.5 rounded-xl flex gap-x-3">
              <button
                type="button"
                onClick={() => setRole("USER")}
                className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-sm font-semibold transition-all ${role === "USER"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                  }`}
              >
                <User className="w-4 h-4 mr-2" />
                Passenger
              </button>
              <button
                type="button"
                onClick={() => setRole("OWNER")}
                className={`flex-1 flex items-center justify-center py-2.5 rounded-lg text-sm font-semibold transition-all ${role === "OWNER"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "bg-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                  }`}
              >
                <Car className="w-4 h-4 mr-2" />
                Vehicle Owner
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full Name"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none text-gray-900"
                />
              </div>

              {/* Phone */}
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone Number"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none text-gray-900"
                />
              </div>
            </div>

            {/* Email */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              </div>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none text-gray-900"
              />
            </div>

            {/* Password */}
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CheckCircle2 className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
              </div>
              <input
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create Password"
                className="w-full pl-10 pr-12 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none text-gray-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 outline-none bg-white"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Gender Selection */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Gender</label>
              <div className="grid grid-cols-3 gap-3">
                {["MALE", "FEMALE", "OTHER"].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-2.5 rounded-xl border transition-all text-sm font-semibold ${gender === g
                      ? "border-blue-600 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-gray-50"
                      }`}
                  >
                    {g.charAt(0) + g.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Vehicle Fields (Animated) */}
            <AnimatePresence>
              {role === "OWNER" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 overflow-hidden"
                >
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                      <Car className="w-4 h-4 mr-2 text-blue-600" />
                      Vehicle Details
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Tag className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                        </div>
                        <input
                          value={vehicleNumber}
                          onChange={(e) => setVehicleNumber(e.target.value)}
                          placeholder="Vehicle No (Ex:ABC-1234)"
                          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none text-gray-900"
                        />
                      </div>

                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Car className="h-5 w-5 text-gray-400 group-focus-within:text-blue-600 transition-colors" />
                        </div>
                        <select
                          value={vehicleType}
                          onChange={(e) => setVehicleType(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all outline-none text-gray-900 appearance-none bg-none"
                        >
                          <option value="">Select Type</option>
                          <option value="Car">Car</option>
                          <option value="Van">Van</option>
                          <option value="SUV">SUV</option>
                          <option value="Bus">Bus</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Terms */}
            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="w-4 h-4 mt-1 border-gray-300 rounded text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="terms" className="ml-2 text-sm text-gray-500">
                I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
              </label>
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent as rounded-full animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </motion.button>

            <p className="text-center text-sm text-gray-600 mt-6">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-500 hover:underline transition-colors">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}