# HighwayLink Advanced Workflow & Function/API Mapping

This document provides a comprehensive, step-by-step workflow for all user roles, covering every function, API call, error/notification, and advanced/edge case in the HighwayLink platform. Use this for technical presentations and deep Q&A.

---

## 1. User Registration & Authentication

### Registration (Signup.jsx)
- **Form Validation:**
  - Checks for agreement to terms, gender, required fields, vehicle info (if owner)
  - Alerts on missing/invalid input
- **Function:** `handleSubmit()`
- **API:** `POST /auth/signup`
- **Success:** Alerts, redirects to login or dashboard
- **Error:** Alerts with error message

### Login (Login.jsx)
- **Function:** `submit()`
- **API:** `POST /auth/login`
- **Success:** Stores JWT, alerts, redirects
- **Error:** Alerts with error message

---

## 2. Ride Search, Booking, and Details

### Search Rides (SearchRides.jsx)
- **Function:** `handleSearch()`
- **API:** `GET /rides?origin=...&destination=...`
- **Error:** Alerts on failure

### View Ride Details (RideDetails.jsx)
- **Function:** `useEffect` fetches ride, owner, and passenger details
- **API:** `GET /rides/{id}`, `GET /users/{id}`
- **Error:** Sets error state, displays error message

### Request to Join Ride (RideCard.jsx)
- **Function:** `onRequestJoin(rideId)`
- **API:** `POST /rides/{rideId}/request`
- **Success:** Alerts, updates UI
- **Error:** Alerts on duplicate or failed request

---

## 3. Ride Creation, Editing, and Cancellation

### Create Ride (CreateRide.jsx)
- **Form Validation:** Checks all fields, alerts on missing data
- **Function:** `submit()`
- **API:** `POST /rides`
- **Success:** Alerts, redirects
- **Error:** Alerts with error message

### Edit Ride (Dashboard.jsx)
- **Function:** `handleEditRide()`, `handleRideFormSubmit()`
- **API:** `PUT /rides/{rideId}`
- **Success:** Alerts, updates UI
- **Error:** Alerts on failure

### Cancel Ride (Dashboard.jsx)
- **Function:** `handleCancelRide()`
- **API:** `DELETE /rides/{rideId}`
- **Success:** Alerts, updates UI
- **Error:** Alerts on failure

---

## 4. Booking Management (Owner & User)

### Approve/Reject Requests (Dashboard.jsx)
- **Functions:** `handleApproveRequest(requestId)`, `handleRejectRequest(requestId)`
- **API:** `POST /rides/{rideId}/approve`, `POST /rides/{rideId}/reject`
- **Success:** Alerts, updates UI
- **Error:** Alerts on failure

### Cancel Booking (User)
- **Function:** `handleCancelBooking()`
- **API:** `DELETE /bookings/{bookingId}`
- **Success:** Alerts, updates UI
- **Error:** Alerts on failure

---

## 5. Payment & Earnings (PaymentModal.jsx, CardPaymentGateway.jsx, Dashboard.jsx)

### Payment Selection
- **Function:** `handlePaymentSelection()`
- **API:** `POST /payments/card` (Stripe), `POST /payments/cash`
- **Success:** Alerts, updates dashboard
- **Error:** Alerts on failure

### Driver Dashboard
- **Functions:** `fetchPayments()`, `filterPaymentsByMethod()`, `markPaymentCollected()`
- **API:** `GET /payments/driver/{driverId}`
- **Success:** Shows total earnings (today, week, month), payment breakdown
- **Error:** Alerts on failure

---

## 6. Notifications & Error Handling
- **All major actions:** Use `alert()` or `setStatus()` for feedback
- **Edge Cases:**
  - Duplicate requests, invalid data, unauthorized actions, network errors
  - All handled with error messages and UI updates

---

## 7. Admin & Support

### Admin Actions (Dashboard.jsx)
- **Edit/Delete Users/Rides:** `handleEditUser()`, `handleUserFormSubmit()`, `handleEditRide()`, `handleRideFormSubmit()`
- **API:** `GET/PUT/DELETE /users`, `GET/PUT/DELETE /rides`
- **Success/Error:** Alerts, updates UI

### Inquiries & Support (InfoSupport.jsx, MyInquiries.jsx)
- **Submit Inquiry:** `handleSubmit()`
- **API:** `POST /inquiries`
- **Success:** Status message, redirects
- **Error:** Status message

---

## 8. Chatbot (Chatbot.jsx)
- **Function:** `sendMessage()`
- **API:** Google Gemini API, OpenWeatherMap (for weather)
- **Handles:** User questions, weather, platform help
- **Error:** Alerts on failure

---

## 9. State Management & Navigation
- **Hooks:** `useState`, `useEffect`, `useContext` (AuthContext), `useNavigate`
- **API Calls:** All via `api` (Axios instance)
- **UI Feedback:** Alerts, status messages, error states

---

## 10. Advanced/Edge Flows
- **Recurring/Scheduled Rides:** (Planned, see roadmap)
- **Promo Codes/Discounts:** (Planned)
- **Ratings/Reviews:** (Planned)
- **Analytics:** Owner/Admin dashboards show ride and payment stats
- **Push Notifications:** (Planned)
- **Document Upload/Verification:** (Planned)

---

**This file covers every workflow, function, API call, error, and advanced scenario in HighwayLink. Use it for deep technical presentations and Q&A.**
