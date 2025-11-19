import React, { useState, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import {
  FaEnvelope,
  FaPhoneAlt,
  FaComments,
  FaQuestionCircle,
  FaUsers,
  FaLinkedin,
} from "react-icons/fa";

export default function InfoSupport() {
  const { user } = useContext(AuthContext);
  const [inquiry, setInquiry] = useState({ subject: "", message: "" });
  const [status, setStatus] = useState("");

  const handleChange = (e) =>
    setInquiry({ ...inquiry, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inquiry.message.trim()) {
      setStatus(" Please enter a message before submitting. ⚠️");
      return;
    }

    const inquiryData = {
      userId: user?._id || user?.id || "anonymous",
      userName: user?.name || "Anonymous",
      userEmail: user?.email || "N/A",
      subject: inquiry.subject?.trim() || "No Subject",
      message: inquiry.message.trim(),
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch("http://localhost:8080/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inquiryData),
      });
      if (!response.ok) throw new Error(`Server responded ${response.status}`);
      setStatus("Your inquiry has been sent successfully! ✅");
      setInquiry({ subject: "", message: "" });
    } catch (error) {
      console.error("Error submitting inquiry:", error);
      setStatus("Failed to send inquiry. Please try again later. ❌");
    }

    setTimeout(() => setStatus(""), 5000);
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
    },
    {
      name: "Samadhi Anusara",
      role: "Backend Developer",
      linkedin: "https://www.linkedin.com/in/samadhi-anusara/",
    },
    {
          name: "Movindu Anusara",
          role: "Frontend Developer",
          linkedin: "https://www.linkedin.com/in/movindu-anusara/",
    },
    {
              name: "Sandali Sewmini",
              role: "Frontend Developer",
              linkedin: "https://www.linkedin.com/in/sandali-sewmini/",
    },
  ];

  return (
      <div className="max-w-6xl mx-auto p-6 space-y-16 mt-28 mb-20 relative z-10">
        {/* ====== About Section ====== */}
        <section className="bg-gradient-to-r from-blue-50 to-white p-8 rounded-2xl shadow-xl text-center space-y-4 mb-12">
          <h2 className="text-3xl font-bold text-blue-800 mb-2 flex justify-center items-center gap-2">
            <FaUsers className="text-blue-500" /> About HighwayLink
          </h2>
          <p className="text-gray-700 text-lg">
            HighwayLink enables vehicle owners to earn extra income during daily rides —
            promoting cost-efficient and eco-friendly travel. The platform offers responsive,
            interactive dashboards for both Users and Vehicle Owners with secure authentication
            and dynamic seat management.
          </p>
          <p className="text-gray-700 text-lg">
            <strong>Our Mission:</strong>{" "}
            <span className="text-blue-600 font-semibold">
              Safe, Fast & Reliable rides for everyone.
            </span>
          </p>

          {/* --- Team Section --- */}
          <div className="mt-10">
            <h3 className="text-xl font-semibold text-gray-800 mb-5 flex justify-center items-center gap-2">
              👨‍💻 Meet Our Team
            </h3>
            <div className="flex flex-wrap justify-center gap-6">
              {team.map((t, idx) => (
                <div
                  key={idx}
                  className="bg-white p-8 rounded-xl shadow-md w-59 hover:shadow-2xl transition-all hover:-translate-y-1"
                >
                  <h4 className="font-bold text-gray-800 text-lg">{t.name}</h4>
                  <p className="text-gray-600 mb-4">{t.role}</p>
                  <a
                    href={t.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 transition"
                  >
                    <FaLinkedin className="mr-1" /> LinkedIn
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ====== Inquiry Form ====== */}
        <section className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-3xl mx-auto space-y-4 mb-12">
          <h2 className="text-3xl font-bold text-blue-700 flex items-center justify-center gap-3">
            <FaEnvelope /> Send us an Inquiry
          </h2>

          {user ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={inquiry.subject}
                onChange={handleChange}
                className="w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white"
              />
              <textarea
                name="message"
                placeholder="Your Message / Ride Request / Issue"
                value={inquiry.message}
                onChange={handleChange}
                className="w-full border p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition bg-white"
                rows={6}
                required
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition duration-200 transform hover:-translate-y-1"
              >
                Submit Inquiry
              </button>
            </form>
          ) : (
            <p className="text-red-600 font-semibold">
               You must be logged in to send an inquiry. Please log in first. ⚠️
            </p>
          )}

          {status && (
            <p
              className={`mt-3 font-medium ${
                status.includes("✅") ? "text-green-600" : "text-red-600"
              }`}
            >
              {status}
            </p>
          )}
        </section>

        {/* ====== FAQ + Contact Info ====== */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 mb-8">
          {/* --- FAQ Section --- */}
          <div className="bg-gradient-to-r from-green-50 to-white p-8 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold text-green-700 flex items-center gap-2 mb-6">
              <FaQuestionCircle /> FAQs
            </h2>
            <div className="space-y-4">
              {faqs.map((f, idx) => (
                <details key={idx} className="border-b pb-2 cursor-pointer group">
                  <summary className="font-semibold text-gray-800 group-open:text-green-600 transition">
                    {f.q}
                  </summary>
                  <p className="mt-2 text-gray-700 text-sm">{f.a}</p>
                </details>
              ))}
            </div>
          </div>

          {/* --- Contact Info Section --- */}
          <div className="bg-gradient-to-r from-yellow-50 to-white p-8 rounded-2xl shadow-xl text-center space-y-4 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-yellow-700 flex items-center justify-center gap-2 mb-4">
              <FaPhoneAlt /> Contact Info
            </h2>
            <p className="text-gray-800">
              <FaEnvelope className="inline text-blue-500 mr-2" /> Email:{" "}
              <a
                href="mailto:admin@highwaylink.com"
                className="font-medium text-blue-600 hover:underline"
              >
                admin@highwaylink.com
              </a>
            </p>
            <p className="text-gray-800">
              <FaPhoneAlt className="inline text-green-500 mr-2" /> Phone:{" "}
              <a
                href="tel:+94716838139"
                className="font-medium text-green-600 hover:underline"
              >
                +94 71 683 8139
              </a>
            </p>
            <p className="text-gray-800">
              <FaComments className="inline text-purple-500 mr-2" /> Live Chat:{" "}
              <span className="font-medium text-blue-600 cursor-pointer hover:underline">
                Start Chat
              </span>
            </p>
          </div>
        </section>
      </div>
    );
}
