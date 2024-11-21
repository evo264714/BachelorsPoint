import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaSignInAlt,
  FaUserPlus,
  FaSignOutAlt,
  FaHome,
  FaDoorOpen,
  FaDoorClosed, // Import icon for "My Rooms"
  FaBars, // Import hamburger icon
  FaTimes, // Import close icon
} from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false); // State to toggle menu

  // Function to toggle menu
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="bg-gray-900 p-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          to="/"
          className="text-white text-3xl font-bold hover:text-teal-400 transition duration-300 ease-in-out"
        >
          HOMIES
        </Link>

        {/* Hamburger Icon for mobile view */}
        <button
          className="text-white text-3xl lg:hidden"
          onClick={toggleMenu}
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>

        {/* Links container, shown or hidden based on screen size and toggle state */}
        <div
          className={`${
            isOpen ? "block" : "hidden"
          } lg:flex flex-col lg:flex-row lg:space-x-4 space-y-4 lg:space-y-0 lg:items-center w-full lg:w-auto mt-4 lg:mt-0`}
        >
          <Link
            to="/create-room"
            className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 hover:from-purple-600 hover:via-pink-600 hover:to-red-600 text-white font-semibold py-2 px-5 rounded-full flex items-center space-x-3 shadow-lg transform hover:scale-110 transition duration-300 ease-in-out"
          >
            <FaHome className="text-xl" />
            <span>Create Room</span>
          </Link>
          <Link
            to="/join-room"
            className="bg-gradient-to-r from-indigo-500 via-blue-500 to-teal-400 hover:from-indigo-600 hover:via-blue-600 hover:to-teal-500 text-white font-semibold py-2 px-5 rounded-full flex items-center space-x-3 shadow-lg transform hover:scale-110 transition duration-300 ease-in-out"
          >
            <FaDoorOpen className="text-xl" />
            <span>Join Room</span>
          </Link>

          {/* Only show "My Rooms" when the user is logged in */}
          {currentUser && (
            <Link
              to="/my-rooms"
              className="bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 hover:from-yellow-500 hover:via-orange-500 hover:to-red-500 text-white font-semibold py-2 px-5 rounded-full flex items-center space-x-3 shadow-lg transform hover:scale-110 transition duration-300 ease-in-out"
            >
              <FaDoorClosed className="text-xl" />
              <span>My Rooms</span>
            </Link>
          )}

          {!currentUser ? (
            <>
              <Link
                to="/login"
                className="bg-gradient-to-r from-green-400 via-teal-400 to-blue-500 hover:from-green-500 hover:via-teal-500 hover:to-blue-600 text-white font-semibold py-2 px-5 rounded-full flex items-center space-x-3 shadow-lg transform hover:scale-110 transition duration-300 ease-in-out"
              >
                <FaSignInAlt className="text-xl" />
                <span>Login</span>
              </Link>
              <Link
                to="/register"
                className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white font-semibold py-2 px-5 rounded-full flex items-center space-x-3 shadow-lg transform hover:scale-110 transition duration-300 ease-in-out"
              >
                <FaUserPlus className="text-xl" />
                <span>Register</span>
              </Link>
            </>
          ) : (
            <button
              onClick={logout}
              className="bg-gradient-to-r from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white font-semibold py-2 px-5 rounded-full flex items-center space-x-3 shadow-lg transform hover:scale-110 transition duration-300 ease-in-out"
            >
              <FaSignOutAlt className="text-xl" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
