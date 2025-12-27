import React, { useState } from "react";

export default function PaymentModal({ isOpen, onClose, onSelectPayment, rideDetails }) {
  const [selectedMethod, setSelectedMethod] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handlePaymentSelection = async (method) => {
    setSelectedMethod(method);
    setIsProcessing(true);

    try {
      if (method === "CASH") {
        // Cash payment - just pass the selection
        await onSelectPayment(method);
      } else if (method === "CARD") {
        // Card payment - redirect to payment gateway
        await onSelectPayment(method);
      }
    } catch (error) {
      console.error("Payment selection error:", error);
      alert(error.message || "Failed to process payment selection");
    } finally {
      setIsProcessing(false);
    }
  };

  const seatsRequested = Math.max(1, rideDetails?.seatsRequestedForUser || rideDetails?.seatsRequested || 1);
  const pricePerSeat = rideDetails?.pricePerSeat || 0;
  const totalAmount = rideDetails?.totalAmount != null ? rideDetails.totalAmount : pricePerSeat * seatsRequested;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transform transition-all">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Select Payment Method</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black-600 transition bg-white rounded-full p-1"
            disabled={isProcessing}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Ride Details Summary */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-600">Route:</span>
            <span className="font-semibold text-gray-800">
              {rideDetails?.origin} → {rideDetails?.destination}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Amount:</span>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">Rs {totalAmount}</div>
              <div className="text-xs text-gray-600">Rs {pricePerSeat} × {seatsRequested} seat{seatsRequested > 1 ? 's' : ''}</div>
            </div>
          </div>
        </div>

        {/* Payment Options */}
        <div className="space-y-4 mb-6">
          {/* Cash Payment */}
          <button
            onClick={() => handlePaymentSelection("CASH")}
            disabled={isProcessing}
            className={`w-full p-4 rounded-xl border-2 transition-all duration-300 bg-white ${
              selectedMethod === "CASH"
                ? "border-green-500 bg-green-50"
                : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
            } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-gray-800 text-lg">Cash Payment</h3>
                <p className="text-sm text-gray-600">Pay the driver directly during the ride</p>
              </div>
              {selectedMethod === "CASH" && (
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </button>

          {/* Card Payment */}
          <button
            onClick={() => handlePaymentSelection("CARD")}
            disabled={isProcessing}
            className={`w-full p-4 rounded-xl border-2 transition-all duration-300 bg-white ${
              selectedMethod === "CARD"
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
            } ${isProcessing ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-bold text-gray-800 text-lg">Card Payment</h3>
                <p className="text-sm text-gray-600">Pay securely online with your card</p>
              </div>
              {selectedMethod === "CARD" && (
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </button>
        </div>

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-gray-600">Processing...</p>
          </div>
        )}

        {/* Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
          <div className="flex gap-2">
            <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="text-sm text-yellow-800">
              <strong>Note:</strong> For cash payments, please ensure you have the exact amount ready. Card payments are processed securely through our payment gateway.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
