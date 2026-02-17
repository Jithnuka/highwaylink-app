import React, { useState, useEffect, useContext } from "react";
import axios from "../api/axios";
import { AuthContext } from "../contexts/AuthContext";

function MyInquiries() {
  const { user } = useContext(AuthContext);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInquiries();
  }, [user]);

  const fetchInquiries = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`/inquiries/user/${user.email}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInquiries(response.data);
    } catch (error) {
      console.error("Failed to fetch inquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8 bg-white rounded-2xl shadow-md">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading your inquiries...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
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
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800">
              My Inquiries
            </h2>
          </div>
          <p className="text-gray-600">
            Track your support inquiries and responses
          </p>
        </div>

        {/* Inquiries Grid */}
        {inquiries.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md p-8 text-center">
            <svg
              className="w-24 h-24 mx-auto text-gray-300 mb-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
              />
            </svg>
            <h3 className="text-2xl font-semibold text-gray-700 mb-3">
              No Inquiries Yet
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              You haven't submitted any support inquiries. Visit the Info & Support page to get in touch with us.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {inquiries.map((inquiry) => (
              <div
                key={inquiry.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden border border-gray-100"
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2 line-clamp-2">
                        {inquiry.subject}
                      </h3>
                      <div className="flex items-center gap-2 text-blue-100">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <span className="text-sm">
                          {new Date(inquiry.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                    </div>
                    {inquiry.resolved ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-400 text-green-900 rounded-full text-xs font-semibold shrink-0 ml-3">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        Resolved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-300 text-yellow-900 rounded-full text-xs font-semibold shrink-0 ml-3">
                        <svg
                          className="w-4 h-4 animate-pulse"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <p className="text-gray-700 leading-relaxed line-clamp-4">
                    {inquiry.message}
                  </p>
                </div>

                {/* Card Footer */}
                <div className="px-6 pb-6">
                  <div
                    className={`flex items-center gap-2 text-sm font-medium ${
                      inquiry.resolved
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${
                        inquiry.resolved ? "bg-green-500" : "bg-yellow-500 animate-pulse"
                      }`}
                    ></div>
                    <span>
                      {inquiry.resolved
                        ? "Your inquiry has been resolved"
                        : "We're working on your inquiry"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyInquiries;
