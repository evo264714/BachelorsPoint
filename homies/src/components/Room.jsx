import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";

const Room = () => {
  const { roomId } = useParams(); // Get roomId from URL parameters
  const [roomName, setRoomName] = useState(""); // Store room name
  const [error, setError] = useState(null); // Handle errors

  // Fetch room details from the backend
  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/room/${roomId}`);

        if (!response.ok) {
          throw new Error(`Room not found: ${response.statusText}`);
        }

        const data = await response.json();
        setRoomName(data.roomName); // Set the room name from the response
      } catch (err) {
        console.error("Failed to fetch room details:", err);
        setError(err.message);
      }
    };

    fetchRoomDetails();
  }, [roomId]);

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-100 to-gray-300">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-4xl">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          <span className="text-blue-600">
            {error ? "Room Not Found" : roomName || "Loading..."}
          </span>
        </h1>

        <div className="bg-gray-100 p-6 rounded-xl shadow-lg">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Link
              to={`/room/${roomId}/meal-summary`}
              className="block bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-6 rounded-lg shadow-md text-center transition-transform transform hover:scale-105"
            >
              <span className="text-lg font-semibold">Meal Summary</span>
            </Link>

            <Link
              to={`/room/${roomId}/deposite`}
              className="block bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white py-6 rounded-lg shadow-md text-center transition-transform transform hover:scale-105"
            >
              <span className="text-lg font-semibold">
                Deposite of Current Month
              </span>
            </Link>

            <Link
              to={`/room/${roomId}/demands`}
              className="block bg-gradient-to-r from-yellow-500 to-yellow-700 hover:from-yellow-600 hover:to-yellow-800 text-white py-6 rounded-lg shadow-md text-center transition-transform transform hover:scale-105"
            >
              <span className="text-lg font-semibold">
                Demands of Current Month
              </span>
            </Link>

            <Link
              to={`/room/${roomId}/total-spending`}
              className="block bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white py-6 rounded-lg shadow-md text-center transition-transform transform hover:scale-105"
            >
              <span className="text-lg font-semibold">Total Spending</span>
            </Link>

            <Link
              to={`/room/${roomId}/summary`}
              className="block bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white py-6 rounded-lg shadow-md text-center transition-transform transform hover:scale-105"
            >
              <span className="text-lg font-semibold">Summary</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Room;
