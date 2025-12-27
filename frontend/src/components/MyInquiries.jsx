import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { FaSyncAlt } from "react-icons/fa";

export default function MyInquiries() {
  const { user } = useContext(AuthContext);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all inquiries of logged user
  const fetchUserInquiries = async () => {
    if (!user?.email) return;
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:8080/api/inquiries/user/${encodeURIComponent(user.email)}`
      );
      if (!response.ok) throw new Error("Failed to fetch inquiries");
      const data = await response.json();
      setInquiries(data);
    } catch (error) {
      console.error("Error fetching user inquiries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInquiries();
  }, [user]);

  return (
    <div className="bg-white p-7 rounded-2xl shadow-xl my-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
          📩 My Inquiries
        </h2>
        <button
          onClick={fetchUserInquiries}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg transition"
        >
          <FaSyncAlt />
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="text-gray-600 text-center">Loading inquiries...</p>
      ) : inquiries.length === 0 ? (
        <p className="text-gray-600 text-center">
          You haven’t submitted any inquiries yet.
        </p>
      ) : (
        <div className="space-y-4">
          {inquiries.map((inq) => (
            <div
              key={inq._id}
              className="border rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition"
            >
              <h3 className="font-semibold text-lg text-gray-800">{inq.subject || "No Subject"}</h3>
              <p className="text-gray-600 mt-1">{inq.message}</p>
              <div className="mt-2 text-sm text-gray-500 flex justify-between items-center">
                <span>Status: </span>
                <span className={`font-semibold ${inq.resolved ? "text-green-600" : "text-yellow-600"}`}>
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
      )}
    </div>
  );
}
