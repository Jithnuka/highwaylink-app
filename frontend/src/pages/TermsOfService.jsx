import React from "react";
import { Link } from "react-router-dom";

export default function TermsOfService() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 bg-white shadow-xl rounded-3xl mt-8 mb-12 animate-fadeIn">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-blue-900 mb-4 tracking-tight">Terms of Service</h1>
                <p className="text-gray-500 text-lg">Last Updated: February 15, 2026</p>
            </div>

            <div className="prose prose-blue prose-lg max-w-none text-gray-700 leading-relaxed space-y-8">
                <section>
                    <h2 className="text-2xl font-bold text-blue-800 border-b-2 border-blue-100 pb-2">1. Acceptance of Terms</h2>
                    <p>
                        By accessing and using the HighwayLink platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services. HighwayLink is a ridesharing facilitation platform connecting drivers and passengers.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-blue-800 border-b-2 border-blue-100 pb-2">2. User Responsibilities</h2>
                    <p>
                        Users must provide accurate, current, and complete information during the registration process. You are responsible for maintaining the confidentiality of your account password and for all activities that occur under your account.
                    </p>
                    <ul className="list-disc pl-6 space-y-2 mt-4 text-gray-600 font-medium">
                        <li>Drivers must possess a valid driver's license and vehicle insurance.</li>
                        <li>Passengers must behave respectfully toward drivers and other users.</li>
                        <li>Users are prohibited from using the platform for any illegal or unauthorized purpose.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-blue-800 border-b-2 border-blue-100 pb-2">3. Ride Rules and Safety</h2>
                    <p>
                        HighwayLink facilitates connections but does not provide transportation services ourselves. Safety is our priority, but users are responsible for their own conduct during rides.
                    </p>
                    <p className="italic bg-blue-50 p-4 rounded-2xl border-l-4 border-blue-500">
                        Note: We recommend verifying the identity of your driver or passenger before starting any journey. Always share your ride status with friends or family.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-blue-800 border-b-2 border-blue-100 pb-2">4. Cancellations and Fees</h2>
                    <p>
                        Users can cancel bookings as per our cancellation policy. Frequent cancellations may result in account suspension. Drivers and passengers are responsible for negotiating and settling any agreed-upon costs directly, unless handled via our integrated payment gateway.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-blue-800 border-b-2 border-blue-100 pb-2">5. Liability and Disclaimer</h2>
                    <p>
                        HighwayLink is provided "as is" and "as available." We are not liable for any damages arising out of your use of the platform, including but not limited to direct, indirect, incidental, or consequential damages related to ride conduct, accidents, or delays.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-blue-800 border-b-2 border-blue-100 pb-2">6. Changes to Terms</h2>
                    <p>
                        We reserve the right to modify these terms at any time. We will notify users of any significant changes via the platform or email.
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
