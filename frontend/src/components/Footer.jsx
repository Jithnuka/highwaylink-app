import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="bg-white border-t border-gray-200 pt-10 pb-8 mt-10">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                    {/* Brand Section */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="bg-blue-600 p-2 rounded-xl shadow-lg">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                            <span className="text-2xl font-black text-blue-900 tracking-tight">HighwayLink</span>
                        </div>
                        <p className="text-gray-500 max-w-sm mb-4 leading-relaxed">
                            Connecting travelers on the highway for a more affordable, social, and sustainable journey.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="text-blue-900 font-bold uppercase tracking-wider text-sm mb-4">Explore</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Home</Link>
                            </li>
                            <li>
                                <Link to="/info" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Support & FAQ</Link>
                            </li>
                            <li>
                                <Link to="/dashboard" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Dashboard</Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h4 className="text-blue-900 font-bold uppercase tracking-wider text-sm mb-4">Legal</h4>
                        <ul className="space-y-2">
                            <li>
                                <Link to="/terms" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Terms of Service</Link>
                            </li>
                            <li>
                                <Link to="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors font-medium">Privacy Policy</Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                    <p>© 2026 HighwayLink. All rights reserved.</p>
                    <div className="flex gap-6">
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            Platform Active
                        </span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
