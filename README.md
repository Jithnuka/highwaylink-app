# 🚗 HighwayLink - Ride Sharing Platform

A modern ride-sharing web application built with React and Spring Boot that connects vehicle owners with passengers traveling on Sri Lankan highways.

## 🎯 About

HighwayLink is a platform that enables vehicle owners to earn extra income during daily rides while promoting cost-efficient and eco-friendly travel. The application provides responsive dashboards for Users, Vehicle Owners, and Admins with secure authentication and dynamic seat management.

**Mission:** Safe, Fast & Reliable rides for everyone.

## ✨ Features

### For Users
- 🔍 Browse and search available rides by origin and destination
- 📝 Request to join rides
- 💳 Multiple payment options (Cash/Card)
- 📊 Track ride status and booking history
- 💬 Submit inquiries and support tickets
- 🤖 AI-powered chatbot assistance

### For Vehicle Owners
- 🚙 Create and manage ride offerings
- ⏰ Set schedules (one-time, daily, weekly)
- 👥 Accept or reject passenger requests
- 🚗 Manage vehicle information
- 📈 Track created rides and passengers

### For Admins
- 👨‍💼 Manage all users and rides
- 📋 View and resolve user inquiries
- ✏️ Edit ride and user details
- 📊 Dashboard with analytics (total users, rides, requests)
- 🔧 System-wide management capabilities

### General Features
- 🔐 Secure JWT authentication
- 🎨 Modern, responsive UI with Tailwind CSS
- 🌓 Gradient color themes
- ⚡ Real-time updates
- 📱 Mobile-friendly design
- 🔔 Status notifications and alerts

### New & Upcoming Features
- 📍 Map and GPS location picker (coming soon)
- 🗺️ Interactive map for ride routes
- 🔔 Push notifications for ride status and updates
- ⭐ Ratings and reviews for rides and drivers
- 🗓️ Scheduled and recurring rides
- 🎁 Promo codes and discounts
- 📈 Advanced analytics for owners and admins
- 🏆 Loyalty rewards system (planned)

## 🛠 Tech Stack

### Frontend
- **Framework:** React 18.3.1
- **Build Tool:** Vite 7.1.9
- **Routing:** React Router DOM
- **HTTP Client:** Axios
- **Styling:** Tailwind CSS
- **Date Picker:** React DatePicker
- **AI Integration:** Google Gemini API

### Backend
- **Framework:** Spring Boot 3.x
- **Language:** Java
- **Database:** MongoDB
- **Security:** Spring Security with JWT
- **Build Tool:** Maven

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Java JDK 17 or higher
- MongoDB
- Maven

## 📁 Project Structure

```
highwaylink-app-main/
├── frontend/                   # React frontend application
│   ├── src/
│   │   ├── api/               # API configuration (axios)
│   │   ├── assets/            # Static assets
│   │   ├── components/        # Reusable components
│   │   │   ├── CardPaymentGateway.jsx
│   │   │   ├── Chatbot.jsx
│   │   ├── MyInquiries.jsx
│   │   │   ├── NavBar.jsx
│   │   │   ├── PaymentModal.jsx
│   │   │   └── RideCard.jsx
│   │   ├── contexts/          # React contexts (AuthContext)
│   │   ├── pages/             # Page components
│   │   │   ├── CreateRide.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── InfoSupport.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── RideDetails.jsx
│   │   │   ├── SearchRides.jsx
│   │   │   └── Signup.jsx
│   │   ├── App.jsx            # Main app component
│   │   └── main.jsx           # Entry point
│   └── package.json
│
├── src/                        # Spring Boot backend
│   └── main/
│       ├── java/com/highwaylink/
│       │   ├── config/        # Security & JWT configuration
│       │   ├── controller/    # REST controllers
│       │   ├── DTO/           # Data Transfer Objects
│       │   ├── exception/     # Exception handlers
│       │   ├── model/         # Entity models
│       │   ├── repository/    # MongoDB repositories
│       │   ├── service/       # Business logic
│       │   └── util/          # Utility classes
│       └── resources/
│           └── application.properties
│
├── mvnw                        # Maven wrapper
├── pom.xml                     # Maven dependencies
└── README.md
```

## 📖 User Guide

### 👤 User Profile & Settings
- **Username:** Cannot be changed directly in the current version.
- **Update Details:** To change personal details, contact admin via "Info & Support" > "Username Change Request".
- **View Profile:** Accessible via the Dashboard.

### 🚗 How to Book a Ride (Passenger)
1. **Login** to your account.
2. Click **"Search Rides"** from the navigation menu or home page.
3. Enter departure location, destination, date, and time.
4. Browse available rides and click on a card to view details (driver info, vehicle, price).
5. Click **"Request Booking"**.
6. The booking will appear as **"Pending"** in your Dashboard under "My Bookings".
7. Wait for the vehicle owner to accept matches. Once accepted, ride details are confirmed.

### 🚙 How to Create a Ride (Vehicle Owner)
1. **Login** to your account.
2. Click **"Create Ride"** from the navigation menu.
3. Fill in ride details:
   - Origin & Destination
   - Date & Time
   - Available Seats & Price per Seat
   - Vehicle Type (Car, Van, SUV, Bus, etc.)
4. Click **"Create Ride"**.
5. The ride will appear in your **Dashboard** under "My Rides".
6. Manage incoming booking requests (Accept/Reject) from the Dashboard.

### 📊 Dashboard Features
**For Regular Users:**
- **Navigation Tabs:**
  - **Active Rides:** View currently scheduled and approved rides.
  - **Pending Requests:** Track status of booking requests waiting for approval.
  - **History & Canceled:** Access past completed rides and canceled bookings.
- **Side Drawer:** Click on any ride card to open a detailed side panel with route info, driver details, and payment status.
- **My Inquiries:** Track support tickets.

**For Vehicle Owners:**
- All User features plus:
- **Navigation Tabs:**
  - **Active Rides:** Manage your published rides and approved passenger bookings.
  - **Bookings (Passenger):** View rides you've joined as a passenger.
  - **History & Canceled:** View completed rides and canceled offerings.
- **Side Drawer:** View comprehensive ride details, manage passengers, and handle payments in the side panel.
- **Booking Management:** Accept/Reject passengers directly from the dashboard.
- **Statistics:** View daily and total earnings.

**For Admins:**
- Manage all rides and users.
- View and resolve inquiries.
- **Note:** Admins cannot cancel rides on behalf of owners.

### ❌ Cancellation Policy
**Vehicle Owner:**
- Can cancel their own rides via Dashboard > "My Rides".
- Click "Cancel Ride" and confirm.
- All booked passengers are automatically notified.

**Passenger:**
- Can cancel **Pending** booking requests via Dashboard > "My Bookings".
- Click "Cancel Request" to remove the booking.

### ℹ️ Inquiry & Support System
Submit inquiries for technical issues, booking problems, or account changes.
1. Go to **"Info & Support"**.
2. Fill out the form (Subject & Message).
3. Click **"Submit Inquiry"**.
4. Track status in Dashboard > "My Inquiries".
5. Use the **AI Chatbot** for instant assistance.

### 🌤️ Weather Integration
- Check real-time weather for trip planning directly in the chat.
- Example: "What's the weather in Colombo?"
- Provides temperature, conditions, humidity, and wind speed.

### 🔒 Important Notes
- **Authentication:** Required for booking, creating rides, and accessing the Dashboard.
- **Data Source:** Weather data powered by OpenWeatherMap API.
- **AI Support:** Powered by Gemini AI.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📞 Contact

For support or inquiries:
- Email: jithnukaweerasingha@gmail.com 
- Phone: +94 71 683 8139

---

Made with ❤️ by the HighwayLink Team
