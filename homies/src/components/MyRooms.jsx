import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Swal from 'sweetalert2';
import { FaDoorOpen } from 'react-icons/fa'; 

const MyRooms = () => {
  const { currentUser } = useContext(AuthContext);  // Fetch current user context
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate(); // React Router's useNavigate hook

  useEffect(() => {
    // Fetch the rooms that the user has joined
    const fetchRooms = async () => {
      try {
        const response = await fetch(`http://localhost:5000/my-rooms/${currentUser.email}`);
        const data = await response.json();
        if (response.ok) {
          setRooms(data.rooms);  // Set rooms if response is OK
        } else {
          Swal.fire('Error', data.message || 'Unable to fetch rooms', 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'Unable to fetch rooms', 'error');
      }
    };

    if (currentUser) {
      fetchRooms();
    }
  }, [currentUser.email]);  // Fetch rooms when currentUser is available

  // Define handleJoinRoom function
  const handleJoinRoom = async (roomId, roomPassword) => {
    try {
      const response = await fetch(`http://localhost:5000/join-room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId,
          roomPassword,  // Password could be blank if the user is already part of the room
          userEmail: currentUser.email,
          userName: currentUser.displayName || currentUser.email,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        Swal.fire('Success', data.message || 'Welcome back to the room!', 'success').then(() => {
          navigate(`/room/${roomId}`);  // Navigate to the room page
        });
      } else if (data.message === 'Room ID or password incorrect') {
        // Ask for password only if not already part of the room
        Swal.fire({
          title: 'Enter Room Password',
          input: 'password',
          inputAttributes: {
            autocapitalize: 'off'
          },
          showCancelButton: true,
          confirmButtonText: 'Join',
          preConfirm: async (enteredPassword) => {
            const passwordResponse = await fetch(`http://localhost:5000/join-room`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                roomId,
                roomPassword: enteredPassword,
                userEmail: currentUser.email,
                userName: currentUser.displayName || currentUser.email,
              }),
            });

            const passwordData = await passwordResponse.json();

            if (passwordResponse.ok) {
              Swal.fire('Success', 'You have successfully joined the room!', 'success').then(() => {
                navigate(`/room/${roomId}`);  // Navigate to the room page after password check
              });
            } else {
              Swal.fire('Error', passwordData.message || 'Unable to join room', 'error');
            }
          }
        });
      } else {
        Swal.fire('Error', data.message || 'Unable to join room', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Unable to join room', 'error');
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-4xl font-bold text-center text-gray-800 mb-12">
        My Joined Rooms
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rooms.map((room) => (
          <div
            key={room.roomId}
            className="relative bg-white border border-gray-200 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 transition duration-300 ease-in-out"
          >
            <div className="bg-gradient-to-r from-blue-500 to-teal-500 p-6">
              <h2 className="text-2xl font-bold text-white mb-3">{room.roomName}</h2>
              <p className="text-white">Room ID: <span className="font-semibold">{room.roomId}</span></p>
              <p className="text-white">Created by: <span className="font-semibold">{room.createdBy}</span></p>
            </div>

            <div className="p-6">
              <p className="text-gray-600 mb-2">
                <span className="font-semibold">Room ID:</span> {room.roomId}
              </p>
              <p className="text-gray-600 mb-4">
                <span className="font-semibold">Created by:</span> {room.createdBy}
              </p>

              <button
                onClick={() => handleJoinRoom(room.roomId, room.roomPassword)}
                className="w-full bg-gradient-to-r from-indigo-500 via-blue-500 to-teal-400 hover:from-indigo-600 hover:via-blue-600 hover:to-teal-500 text-white font-semibold py-2 px-5 rounded-full flex items-center space-x-3 shadow-lg transform hover:scale-110 transition duration-300 ease-in-out"
              >
                Join Room
              </button>
            </div>

            {/* Decorative Icon in the corner */}
            <div className="absolute top-0 right-0 p-4 opacity-25 text-6xl text-white">
              <FaDoorOpen />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyRooms;
