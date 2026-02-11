# System Information & Analysis

## 1. Technology Stack

### Frontend (Client-Side)
- **Framework:** React.js (Vite) - Fast development server and optimized build.
- **Styling:** Tailwind CSS - Utility-first CSS framework for responsive design.
- **State Management:** React Context API (AuthContext) - Managed global user state.
- **Routing:** React Router DOM - Client-side navigation.
- **HTTP Client:** Axios - For making asynchronous API requests.
- **UI Components:** 
  - `react-datepicker`: For date/time selection.
  - `react-hot-toast`: For notification popups.
  - `heroicons` / SVG: For icons.

### Backend (Server-Side)
- **Framework:** Spring Boot (Java) - robust, production-ready backend framework.
- **Build Tool:** Maven - Dependency management and build automation.
- **Database Access:** Spring Data MongoDB - For interacting with the NoSQL database.
- **Security:** Spring Security & JWT (JSON Web Tokens) - Stateless authentication.
- **Validation:** Hibernate Validator (Jakarta Bean Validation) - Request data validation.

### Database
- **Primary DB:** MongoDB Atlas (Cloud) - Document-oriented NoSQL database.
  - **Collections:** `users`, `rides`, `reviews`, `inquiries`.

### External APIs & Integrations
- **AI Chatbot:** Google Gemini API - Provides intelligent responses to user queries.
- **Weather:** OpenWeatherMap API - Real-time weather updates for travel planning.
- **Maps/Routing:** Leaflet / OSRM (Open Source Routing Machine) - For route visualization and distance calculation.
- **Payment:** Custom simulated gateway (Support for Cash & Card flows).

---

## 2. System Analysis

### 2.1. Software Architecture
The system adopts a **RESTful Microservices-ready Architecture**.
- **Separation of Concerns:** The frontend and backend are completely decoupled, communicating only via JSON APIs. This allows independent scaling and development.
- **Statelessness:** The backend does not store session state. Each request is authenticated via a JWT token header, making the server stateless and easier to scale horizontally (e.g., adding more server instances behind a load balancer).

### 2.2. Database Design Decisions
**Why MongoDB (NoSQL)?**
- **Flexible Schema:** Ride details (stops, vehicle types) and User profiles can vary. MongoDB documents allow dynamic fields without strict migrations.
- **Geospatial Queries:** MongoDB supports geospatial indexing (future-proofing for "find rides near me" features).
- **Performance:** High read/write throughput suitable for a ride-sharing feed.

### 2.3. Security Implementation
- **Authentication:** Users log in to receive a `Bearer Token` (JWT). This token validates identity for every subsequent request.
- **Authorization:** Role-based access control (RBAC) ensures:
  - `ADMIN`: Can manage all users/rides.
  - `OWNER`: Can create rides and accept passengers.
  - `USER`: Can only search and book rides.
- **Password Security:** Passwords are hashed using **BCrypt** before storage, ensuring they are never stored in plain text.

### 2.4. Scalability & Performance
- **Frontend Optimization:** Vite bundles code efficiently. Assets are lazy-loaded where possible.
- **Backend Concurrency:** Spring Boot uses a multi-threaded web server (Tomcat) to handle concurrent user requests efficiently.
- **Cloud Native:** The use of MongoDB Atlas and stateless APIs makes the system cloud-native and ready for deployment on platforms like AWS or Google Cloud.

### 2.5. Future Improvements
- **Real-time Updates:** Implement WebSockets (Socket.io or Spring WebSocket) for live ride tracking and instant notifications.
- **Real Payment Gateway:** Replace the simulation with Stripe or PayPal API for actual transaction processing.
- **Mobile App:** The React frontend is responsive, but a React Native app could offer better mobile-native features (GPS tracking).
