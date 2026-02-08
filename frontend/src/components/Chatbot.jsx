import React, { useState, useRef, useEffect } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default function Chatbot({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! I'm HighwayLink Assistant. How can I help you today? Feel free to ask about rides, bookings, or any questions about our platform.",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // Check if this is a weather question
      const weatherKeywords = ['weather', 'temperature', 'forecast', 'rain', 'sunny', 'cloudy', 'hot', 'cold', 'climate'];
      const isWeatherQuestion = weatherKeywords.some(keyword =>
        userMessage.toLowerCase().includes(keyword)
      );

      if (isWeatherQuestion) {
        let city = 'Colombo'; // Default to Colombo

        let cityMatch = null;

        // Pattern 1: "weather/rain/sunny in/at City"
        cityMatch = userMessage.match(/(?:weather|temperature|forecast|climate|rain|rainy|sunny|cloudy|hot|cold)\s+(?:day\s+)?(?:in|at|for|of)\s+([A-Za-z\s]{3,}?)(?:\?|!|\.|$)/i);

        // Pattern 2: "in City" anywhere in the message
        if (!cityMatch) {
          cityMatch = userMessage.match(/\s+in\s+([A-Za-z]{3,}?)(?:\?|!|\.|$|\s)/i);
        }

        // Pattern 3: Look for city names at the end
        if (!cityMatch) {
          cityMatch = userMessage.match(/(?:at|in)\s+([A-Za-z]+)\s*\??\s*$/i);
        }

        if (cityMatch && cityMatch[1]) {
          const extractedCity = cityMatch[1].trim();
          // Filter out common words that aren't cities
          const excludeWords = ['the', 'is', 'it', 'be', 'are', 'was', 'were', 'will', 'would', 'should', 'could', 'there', 'today', 'now', 'tomorrow', 'day', 'night'];
          if (!excludeWords.includes(extractedCity.toLowerCase()) && extractedCity.length > 2) {
            city = extractedCity;
          }
        }

        const weatherApiKey = import.meta.env.VITE_WEATHER_API_KEY;

        if (!weatherApiKey) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "Weather API key is not configured. Please add VITE_WEATHER_API_KEY to your .env file to get weather updates.",
            },
          ]);
          setIsLoading(false);
          return;
        }

        // Fetch weather data
        const weatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric`
        );

        if (!weatherResponse.ok) {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: `⚠️ Sorry, I couldn't find weather data for "${city}". Please check the city name and try again. You can ask like "What's the weather in Colombo?" or "How's the weather in Kandy?"`,
            },
          ]);
          setIsLoading(false);
          return;
        }

        const weatherData = await weatherResponse.json();

        // Format weather response
        const weatherMessage = `🌤️ **Current Weather in ${weatherData.name}:**

🌡️ Temperature: ${weatherData.main.temp}°C (feels like ${weatherData.main.feels_like}°C)
📊 Condition: ${weatherData.weather[0].main} - ${weatherData.weather[0].description}
💧 Humidity: ${weatherData.main.humidity}%
💨 Wind Speed: ${weatherData.wind.speed} m/s
🔽 Pressure: ${weatherData.main.pressure} hPa
☁️ Cloudiness: ${weatherData.clouds.all}%

Perfect for planning your HighwayLink ride! 🚗`;

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: weatherMessage },
        ]);
        setIsLoading(false);
        return;
      }

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      console.log("API Key loaded:", apiKey ? "Yes (length: " + apiKey.length + ")" : "No");

      if (!apiKey) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file.",
          },
        ]);
        setIsLoading(false);
        return;
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      // Switch to the Lite version for higher free limits
      const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash-lite",
      });

      const context = `You are a helpful assistant for HighwayLink, a ride-sharing platform that connects vehicle owners with passengers traveling on highways. 

IMPORTANT: Provide ACCURATE information based on the actual platform features below. Do not make assumptions.

==== PLATFORM OVERVIEW ====
- HighwayLink enables vehicle owners to earn extra income during daily rides
- Passengers can search and book rides along highway routes
- Secure authentication with JWT tokens
- Real-time seat availability management
- Dashboard for both users and vehicle owners

==== USER PROFILE & SETTINGS ====
- Users CANNOT change their username directly in the current version
- To change personal details, users must contact admin through:
  1. Go to "Info & Support" page from navigation menu
  2. Fill out the inquiry form with subject "Username Change Request"
  3. Admin will process the request and make changes
- Users can view their profile in the Dashboard

==== HOW TO BOOK A RIDE (Passenger) ====
1. Login to your account
2. Click "Search Rides" from navigation menu or home page
3. Enter your departure location and destination
4. Select date and time
5. Browse available rides matching your criteria
6. Click on a ride to view details (driver info, vehicle type, price, available seats)
7. Click "Request Booking" button
8. Booking will show as "Pending" in your Dashboard under "My Bookings"
9. Wait for vehicle owner to accept your request
10. Once accepted, ride details will be confirmed

==== HOW TO CREATE A RIDE (Vehicle Owner) ====
1. Login to your account
2. Click "Create Ride" from navigation menu
3. Fill in ride details:
   - Departure location
   - Destination
   - Date and time
   - Available seats
   - Price per seat
   - Vehicle type (Car, Van, SUV, Mini Van, Bus, Motorcycle)
4. Click "Create Ride" button
5. Your ride will appear in Dashboard under "My Rides"
6. You'll receive booking requests from passengers
7. Accept or reject requests from Dashboard

==== DASHBOARD FEATURES ====
For Regular Users:
- View "My Bookings" (all ride requests)
- View "My Inquiries" (support tickets)
- Create new inquiries

For Vehicle Owners (same as users, plus):
- View "My Rides" (created rides)
- Manage booking requests (Accept/Reject)
- Edit ride details (route, schedule, price, seats)
- View ride statistics

For Admin Only:
- Edit any ride details
- Edit user information
- View and resolve all inquiries
- Admin CANNOT cancel rides (only vehicle owners can)

==== CANCELLATION POLICY ====
Vehicle Owner Canceling a Ride:
- Vehicle owners can cancel their own rides from Dashboard
- Go to Dashboard → "My Rides" section
- Find the ride you want to cancel
- Click "Cancel Ride" button
- Confirm cancellation
- All passengers with bookings will be notified automatically
- NOTE: Admin cannot cancel rides on behalf of owners

Passenger Canceling a Booking:
- Passengers can cancel pending booking requests
- Go to Dashboard → "My Bookings"
- Find the pending booking
- Click "Cancel Request" button
- Booking will be removed from your list

==== INQUIRY & SUPPORT SYSTEM ====
Users can submit inquiries for:
- Technical issues
- Booking problems
- Account questions
- Username change requests
- General support

How to submit inquiry:
1. Go to "Info & Support" page
2. Fill out the form with:
   - Subject (optional)
   - Message (required)
3. Click "Submit Inquiry"
4. Inquiry will appear in Dashboard under "My Inquiries"
5. Admin will review and mark as resolved once handled
6. You can also chat with AI assistant for instant help

==== WEATHER INTEGRATION ====
- Ask about weather in any city for trip planning
- Get real-time temperature, conditions, humidity, wind speed
- Example: "What's the weather in Colombo?"


==== IMPORTANT NOTES ====
- Users must be logged in to book rides or create rides
- Authentication required for Dashboard access
- Contact admin through inquiry form for account changes
- Weather data powered by OpenWeatherMap API
- AI assistant powered by Gemini AI

Always provide step-by-step instructions when explaining processes. If a feature is not available in the current version, clearly state that and provide alternative solutions through the inquiry system.

User question: ${userMessage}`;

      const result = await model.generateContent(context);
      const response = await result.response;
      const text = response.text();

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: text },
      ]);
    } catch (error) {
      console.error("Error generating response:", error);
      console.error("Error details:", error.message);
      console.error("Full error:", JSON.stringify(error, null, 2));

      let errorMessage = "Sorry, I encountered an error. ";

      if (error.message?.includes("API_KEY_INVALID") || error.message?.includes("API key not valid")) {
        errorMessage = "❌ Invalid API key. Please verify your Gemini API key is correct and active at https://aistudio.google.com/app/apikey";
      } else if (error.message?.includes("quota") || error.message?.includes("429")) {
        errorMessage = "⚠️ API quota exceeded. Please try again later or check your API limits at https://aistudio.google.com/";
      } else if (error.message?.includes("network") || error.message?.includes("fetch") || error.message?.includes("Failed to fetch")) {
        errorMessage = "🌐 Network error. Please check:\n1. Your internet connection\n2. API key is valid and active\n3. Try refreshing the page\n\nError: " + error.message;
      } else if (error.message) {
        errorMessage += `Error: ${error.message}`;
      } else {
        errorMessage += "Please try again or contact support if the issue persists.";
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errorMessage,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">HighwayLink Assistant</h3>
              <p className="text-blue-100 text-sm">Online • Powered by Gemini AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition bg-white bg-opacity-10"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                }`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl shadow-md ${msg.role === "user"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-br-none"
                  : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                  }`}
              >
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-md border border-gray-200">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={sendMessage} className="p-4 bg-white border-t border-gray-200">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-semibold transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              Send
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send • Shift+Enter for new line
          </p>
        </form>
      </div>
    </div>
  );
}
