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

## 💻 Usage

### User Registration & Login
1. Navigate to `/signup` to create an account (USER or OWNER role)
2. Login with your credentials at `/login`
3. JWT token is stored in localStorage for authenticated requests

### Creating a Ride (Owner)
1. Login as an OWNER
2. Go to Dashboard and click "Create Ride"
3. Fill in origin, destination, date/time, seats, and price
4. Manage incoming booking requests from your dashboard

### Booking a Ride (User)
1. Browse available rides on Home page
2. Use search filters to find rides
3. Click "Request to Join" on desired ride
4. Wait for owner approval
5. Once approved, select payment method (Cash/Card)

### Admin Panel
1. Login as ADMIN
2. Access admin dashboard with system statistics
3. Manage all users, rides, and inquiries
4. Edit or cancel rides/users as needed

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📞 Contact

For support or inquiries:
- Email: jithnukaweerasingha@gmail.com
- Phone: +94 71 683 8139

---

Made with ❤️ by the HighwayLink Team
