import React, { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import Chatbot from "../components/Chatbot";
import { Skeleton } from "../components/Skeleton";

export default function InfoSupport() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [inquiry, setInquiry] = useState({ subject: "", message: "" });
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) =>
    setInquiry({ ...inquiry, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inquiry.message.trim()) {
      setStatus("⚠️ Please enter a message before submitting.");
      return;
    }

    const inquiryData = {
      userId: user?.id || "anonymous",
      userName: user?.name || "Anonymous",
      userEmail: user?.email || "N/A",
      subject: inquiry.subject?.trim() || "No Subject",
      message: inquiry.message.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      await axios.post("/inquiries", inquiryData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStatus("Your inquiry has been sent successfully! Redirecting to Dashboard...");
      setInquiry({ subject: "", message: "" });

      // Redirect to Dashboard to view inquiry in My Inquiries section
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      setStatus("Failed to send inquiry. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  const faqs = [
    {
      q: "How do I book a ride?",
      a: "Go to the Home or Rides page, choose a ride, and click 'Request'.",
    },
    {
      q: "Can I cancel a ride request?",
      a: "Yes, you can cancel pending requests from your Dashboard.",
    },
    {
      q: "How do I contact the admin?",
      a: "Use the inquiry form below or email admin@highwaylink.com.",
    },
  ];

  const team = [
    {
      name: "Jithnuka Weerasinghe",
      role: "Founder & Developer",
      linkedin: "https://www.linkedin.com/in/jithnuka-weerasinghe/",
      image: "",
    },
    {
      name: "Samadhi Anusara",
      role: "Developer",
      linkedin: "https://www.linkedin.com/in/samadhi-jagathsiri-566931314/",
      image: "",
    },
    {
      name: "Movindu Anusara",
      role: "Developer",
      linkedin: "https://www.linkedin.com/in/movindu-anusara/",
      image: "",
    },
    {
      name: "Sandali Sewmini",
      role: "Developer",
      linkedin: "https://www.linkedin.com/in/movindu-anusara/",
      image: "",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-2 sm:px-2 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-4 mt-1 mb-8">
        <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-center gap-3 mb-6">
            <svg
              className="w-8 h-8 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h2 className="text-3xl font-bold text-blue-600">
              About HighwayLink
            </h2>
          </div>

          <div className="space-y-4 text-gray-700">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-11/12" />
                <Skeleton className="h-4 w-10/12" />
                <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg mt-4">
                  <Skeleton className="h-6 w-3/4" />
                </div>
              </div>
            ) : (
              <>
                <p className="text-lg leading-relaxed">
                  HighwayLink enables vehicle owners to earn extra income during daily rides —
                  promoting cost-efficient and eco-friendly travel. The platform offers responsive,
                  interactive dashboards for both Users and Vehicle Owners with secure authentication
                  and dynamic seat management.
                </p>
                <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
                  <p className="text-lg">
                    <strong className="text-blue-900">Our Mission:</strong>{" "}
                    <span className="text-blue-700 font-semibold">
                      Safe, Fast & Reliable rides for everyone.
                    </span>
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Team Section */}
          <div className="mt-10">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <svg
                className="w-7 h-7 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
              Meet Our Team
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {loading
                ? [...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                    <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
                    <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
                    <Skeleton className="h-4 w-1/2 mx-auto mb-4" />
                    <Skeleton className="h-5 w-24 mx-auto" />
                  </div>
                ))
                : team.map((t, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 border border-gray-200"
                  >
                    {t.image ? (
                      <img
                        src={t.image}
                        alt={t.name}
                        className="w-24 h-24 rounded-full border-2 border-blue-600 object-cover mx-auto"
                        style={{ padding: 0 }}
                      />
                    ) : (
                      <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <span className="text-white text-2xl font-bold">
                          {t.name.split(" ").map((n) => n[0]).join("")}
                        </span>
                      </div>
                    )}
                    <h4 className="font-bold text-gray-800 text-lg text-center mb-1">
                      {t.name}
                    </h4>
                    <p className="text-gray-600 text-sm text-center mb-4">{t.role}</p>
                    <a
                      href={t.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 transition font-medium"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                      LinkedIn
                    </a>
                  </div>
                ))}
            </div>
          </div>
        </section>

        {/* Inquiry Form */}
        <section className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-center gap-3 mb-6">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <h2 className="text-3xl font-bold text-green-600">
              Send us an Inquiry
            </h2>
          </div>

          {user ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  placeholder="Enter inquiry subject"
                  value={inquiry.subject}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  name="message"
                  placeholder="Describe your inquiry, ride request, or issue..."
                  value={inquiry.message}
                  onChange={handleChange}
                  className="w-full border-2 border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none bg-white"
                  rows={6}
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                    Submit Inquiry
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-xl">
              <div className="flex items-center gap-3">
                <svg
                  className="w-6 h-6 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <p className="text-red-700 font-semibold">
                  You must be logged in to send an inquiry. Please log in first.
                </p>
              </div>
            </div>
          )}

          {status && (
            <div
              className={`mt-4 p-4 rounded-xl ${status.includes("✅")
                ? "bg-green-50 border-l-4 border-green-500 text-green-700"
                : "bg-red-50 border-l-4 border-red-500 text-red-700"
                }`}
            >
              <p className="font-medium flex items-center gap-2">
                {status.includes("✅") ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
                {status}
              </p>
            </div>
          )}
        </section>

        {/* FAQ + Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* FAQ Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <svg
                className="w-8 h-8 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-2xl font-bold text-orange-600">
                FAQs
              </h2>
            </div>
            <div className="space-y-4">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="border-2 border-gray-100 rounded-xl p-4">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))
              ) : (
                faqs.map((f, idx) => (
                  <details
                    key={idx}
                    className="group border-2 border-gray-100 rounded-xl p-4 cursor-pointer hover:border-blue-200 transition"
                  >
                    <summary className="font-semibold text-gray-800 group-open:text-blue-600 transition flex items-center gap-2">
                      <svg
                        className="w-5 h-5 transform group-open:rotate-90 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                      {f.q}
                    </summary>
                    <p className="mt-3 text-gray-600 leading-relaxed pl-7">{f.a}</p>
                  </details>
                ))
              )}
            </div>
          </div>

          {/* Contact Info Section */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              <h2 className="text-2xl font-bold text-blue-600">
                Contact Info
              </h2>
            </div>

            <div className="space-y-6">
              {loading ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <Skeleton className="w-6 h-6 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-1/3 mb-2" />
                      <Skeleton className="h-5 w-2/3" />
                    </div>
                  </div>
                ))
              ) : (
                <>
                  <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-100 hover:shadow-md transition">
                    <svg
                      className="w-6 h-6 text-blue-600 mt-1 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Email</p>
                      <a
                        href="mailto:admin@highwaylink.com"
                        className="text-blue-600 hover:text-blue-800 font-medium transition"
                      >
                        admin@highwaylink.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-100 hover:shadow-md transition">
                    <svg
                      className="w-6 h-6 text-green-600 mt-1 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Phone</p>
                      <a
                        href="tel:+94716838139"
                        className="text-green-600 hover:text-green-800 font-medium transition"
                      >
                        +94 71 683 8139
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl border border-purple-100 hover:shadow-md transition">
                    <svg
                      className="w-6 h-6 text-purple-600 mt-1 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Live Chat</p>
                      <button
                        onClick={() => setIsChatbotOpen(true)}
                        className="text-purple-600 hover:text-purple-800 font-medium transition bg-white p-0"
                      >
                        Start Chat
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chatbot Modal */}
      <Chatbot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
    </div>
  );
}
