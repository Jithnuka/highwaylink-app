import React, { useState } from "react";
import api from "../api/axios";

export default function CardPaymentGateway({ isOpen, onClose, onPaymentSuccess, bookingDetails }) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const formatCardNumber = (value) => {
    const cleaned = value.replace(/\s/g, "");
    const formatted = cleaned.match(/.{1,4}/g)?.join(" ") || cleaned;
    return formatted.slice(0, 19); // 16 digits + 3 spaces
  };

  const formatExpiryDate = (value) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e) => {
    const formatted = formatExpiryDate(e.target.value);
    setExpiryDate(formatted);
  };

  const handleCvvChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 3);
    setCvv(value);
  };

  const validateCard = () => {
    const cardDigits = cardNumber.replace(/\s/g, "");
    if (cardDigits.length !== 16) {
      setError("Card number must be 16 digits");
      return false;
    }

    if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
      setError("Invalid expiry date format (MM/YY)");
      return false;
    }

    const [month, year] = expiryDate.split("/").map(Number);
    if (month < 1 || month > 12) {
      setError("Invalid expiry month");
      return false;
    }

    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      setError("Card has expired");
      return false;
    }

    if (cvv.length !== 3) {
      setError("CVV must be 3 digits");
      return false;
    }

    if (!cardholderName.trim()) {
      setError("Cardholder name is required");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!validateCard()) {
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      // In production, this would call a real payment gateway API (Stripe, PayPal, etc.)
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simulate random success/failure for demo (90% success rate)
      const isSuccess = Math.random() > 0.1;

      if (isSuccess) {
        // Call backend to update booking payment status
        await api.post(`/bookings/${bookingDetails.bookingId}/payment`, {
          paymentMethod: "CARD",
          paymentStatus: "COMPLETED",
          transactionId: `TXN${Date.now()}`,
          amount: bookingDetails.amount
        });

        onPaymentSuccess({
          success: true,
          transactionId: `TXN${Date.now()}`,
          message: "Payment successful!"
        });
      } else {
        throw new Error("Payment declined by bank");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError(err.message || "Payment failed. Please try again.");
      setIsProcessing(false);
    }
  };

  const totalAmount = bookingDetails?.amount || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Card Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition bg-white rounded-full p-1"
            disabled={isProcessing}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Amount Display */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg p-4 mb-6">
          <div className="text-sm opacity-90 mb-1">Total Amount</div>
          <div className="text-3xl font-bold">Rs {totalAmount.toFixed(2)}</div>
        </div>

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Card Number */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Card Number</label>
            <div className="relative">
              <input
                type="text"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="1234 5678 9012 3456"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                disabled={isProcessing}
                required
              />
              <div className="absolute right-3 top-3 flex gap-1">
                <svg className="w-8 h-6" viewBox="0 0 48 32" fill="none">
                  <rect width="48" height="32" rx="4" fill="#1434CB"/>
                  <circle cx="18" cy="16" r="8" fill="#EB001B"/>
                  <circle cx="30" cy="16" r="8" fill="#F79E1B"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Cardholder Name */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Cardholder Name</label>
            <input
              type="text"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              placeholder="JOHN DOE"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase bg-white"
              disabled={isProcessing}
              required
            />
          </div>

          {/* Expiry and CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-2">Expiry Date</label>
              <input
                type="text"
                value={expiryDate}
                onChange={handleExpiryChange}
                placeholder="MM/YY"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                disabled={isProcessing}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">CVV</label>
              <input
                type="password"
                value={cvv}
                onChange={handleCvvChange}
                placeholder="123"
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                disabled={isProcessing}
                required
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing}
            className={`w-full py-3 rounded-lg font-bold text-white transition-all duration-300 ${
              isProcessing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800"
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processing...
              </span>
            ) : (
              `Pay Rs ${totalAmount.toFixed(2)}`
            )}
          </button>
        </form>

        {/* Security Note */}
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Secure payment powered by SSL encryption
        </div>
      </div>
    </div>
  );
}
