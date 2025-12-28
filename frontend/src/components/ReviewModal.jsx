import React, { useState } from "react";
import api from "../api/axios";

export default function ReviewModal({ ride, driver, onClose, onReviewSubmitted }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating < 1 || rating > 5) {
      alert("Please select a rating between 1 and 5");
      return;
    }

    setLoading(true);
    try {
      
      const reviewsRes = await api.get(`/reviews/ride/${ride.id}`);
      const user = JSON.parse(localStorage.getItem("user"));
      const existingReview = reviewsRes.data.find(review => review.reviewerId === user.id);
      
      if (existingReview) {
        alert("You have already reviewed this ride.");
        onClose();
        return;
      }

      await api.post("/reviews", {
        rideId: ride.id,
        driverId: driver.id,
        rating: rating,
        comment: comment.trim()
      });

      alert("Thank you for your review!");
      onReviewSubmitted();
      onClose();
    } catch (err) {
      console.error("Failed to submit review:", err);
      alert(err?.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    return [1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        onClick={() => setRating(star)}
        className={`text-2xl bg-white ${star <= rating ? "text-yellow-400" : "text-gray-300"} hover:text-yellow-400 transition`}
      >
        ★
      </button>
    ));
  };

  return (
    <div className="fixed inset-0 bg-white bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Rate Your Ride</h2>
          <p className="text-gray-600">
            How was your experience with {driver.name}?
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Rating Stars */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Rating
            </label>
            <div className="flex justify-center gap-1">
              {renderStars()}
            </div>
            <p className="text-center text-sm text-gray-500 mt-2">
              {rating} star{rating !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comment (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white"
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-gray-500 mt-1">
              {comment.length}/500 characters
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              disabled={loading}
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-white-500 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
