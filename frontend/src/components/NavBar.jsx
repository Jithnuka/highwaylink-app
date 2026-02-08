import { Link, useNavigate, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import NotificationBell from "./NotificationBell";

export default function NavBar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getLinkClass = (path) => {
    return location.pathname === path
      ? "text-yellow-400 font-bold" // Active
      : "text-gray-300 hover:text-white transition-colors font-medium"; // Inactive
  };

  return (
    <>
      <nav className="bg-blue-700 px-6 py-4 flex justify-between items-center shadow-md">
        {/* Logo */}
        <Link
          to="/"
          className="font-extrabold text-2xl md:text-3xl text-white hover:text-yellow-300 transition-colors"
        >
          HighwayLink
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          <Link to="/" className={getLinkClass("/")}>
            Home
          </Link>

          {user && (
            <Link to="/dashboard" className={getLinkClass("/dashboard")}>
              Dashboard
            </Link>
          )}

          {/* Always show Info & Support */}
          <Link to="/info" className={getLinkClass("/info")}>
            Info & Support
          </Link>

          {/* Auth Buttons */}
          {user ? (
            <div className="flex items-center gap-4">
              <NotificationBell />
              <span className="hidden sm:inline text-yellow-200 font-medium">
                Hi, {user.name}
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition duration-200"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-800 transition duration-200 font-medium"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}