import React from "react";
import { Link } from "react-router-dom";

export default function PrivacyPolicy() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-white shadow-xl rounded-3xl mt-8 mb-12 animate-fadeIn">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-blue-900 mb-4 tracking-tight">Privacy Policy</h1>
                <p className="text-gray-500 text-lg">Last Updated: February 15, 2026</p>
            </div>

            <div className="prose prose-blue prose-lg max-w-none text-gray-700 leading-relaxed space-y-8">
                <section>
                    <h2 className="text-2xl font-bold text-blue-800 border-b-2 border-blue-100 pb-2">1. Information We Collect</h2>
                    <p>
                        To provide our services, we collect information you provide directly to us:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-4 text-gray-600 font-medium">
                        <li>Account Information: Name, email, phone number, and password.</li>
                        <li>Profile Data: Profile picture and vehicle details (for drivers).</li>
                        <li>Ride Data: Origin, destination, timing, and booking history.</li>
                        <li>Location Data: If you permit, we collect precise location data to facilitate ride matching.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-blue-800 border-b-2 border-blue-100 pb-2">2. How We Use Your Information</h2>
                    <p>
                        We use the information we collect to:
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-4 text-gray-600 font-medium">
                        <li>Facilitate ride matching and communications between users.</li>
                        <li>Process payments and provide booking confirmations.</li>
                        <li>Improve our platform and user experience.</li>
                        <li>Send safety alerts and support messages.</li>
                        <li>Prevent fraud and ensure security.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-blue-800 border-b-2 border-blue-100 pb-2">3. Data Sharing and Disclosure</h2>
                    <p>
                        We share relevant information between drivers and passengers to facilitate rides (e.g., sharing your name and contact number when a ride is booked). We do not sell your personal data to third parties. We may disclose data if required by law or to protect rights and safety.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-blue-800 border-b-2 border-blue-100 pb-2">4. Data Security</h2>
                    <p>
                        We implement industry-standard security measures to protect your data from unauthorized access, alteration, or disclosure. However, no method of transmission over the internet is 100% secure.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-blue-800 border-b-2 border-blue-100 pb-2">5. Your Choices and Rights</h2>
                    <p>
                        You can access and update your profile information via the dashboard. You may also request account deletion by contacting our support team.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-blue-800 border-b-2 border-blue-100 pb-2">6. Cookies</h2>
                    <p>
                        We use cookies to maintain your session and remember your preferences. You can manage cookie settings in your browser.
                    </p>
                </section>
            </div>

            <div className="mt-16 text-center border-t border-gray-100 pt-8">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-blue-600 font-bold hover:text-blue-800 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Home
                </Link>
            </div>
        </div>
    );
}
