import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

export default function NavBar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="bg-blue-700 text-white px-6 py-4 flex justify-between items-center shadow-md">
      {/* Logo */}
      <Link
        to="/"
        className="font-extrabold text-2xl md:text-3xl hover:text-yellow-300 transition-colors"
      >
        HighwayLink
      </Link>

      {/* Navigation Links */}
      <div className="flex items-center space-x-6">
        <Link
          to="/"
          className="hover:text-yellow-300 transition-colors font-medium"
        >
          Home
        </Link>
        {user && (
          <Link
            to="/dashboard"
            className="hover:text-yellow-300 transition-colors font-medium"
          >
            Dashboard
          </Link>
        )}

        {/* Always show Info & Support */}
        <Link
          to="/info"
          className="hover:text-yellow-300 transition-colors font-medium"
        >
          Info & Support
        </Link>

        {/* Auth Buttons */}
        {user ? (
          <>
            <span className="hidden sm:inline ml-2 text-yellow-200 font-medium">
              Hi, {user.name}
            </span>
            <button
              onClick={logout}
              className="ml-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition duration-200"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800 transition duration-200 font-medium"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-800 transition duration-200 font-medium"
            >
              Signup
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
