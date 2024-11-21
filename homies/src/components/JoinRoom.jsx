import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AuthContext } from '../context/AuthContext';

const JoinRoom = () => {
  const [roomId, setRoomId] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleJoinRoom = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/join-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId,
          roomPassword,
          userEmail: currentUser.email,
          userName: currentUser.displayName || currentUser.email, // Use user's name if available
        }),
      });

      const data = await response.json();

      if (response.status === 200) {
        Swal.fire('Success', 'Joined room successfully', 'success');
        navigate(`/room/${roomId}`);
      } else {
        Swal.fire('Error', data.message || 'Failed to join room', 'error');
      }
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleJoinRoom} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Join Room</h2>
        <input
          type="text"
          placeholder="Room ID"
          className="w-full p-2 mb-4 border rounded"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
        />
        <input
          type="password"
          placeholder="Room Password"
          className="w-full p-2 mb-4 border rounded"
          value={roomPassword}
          onChange={(e) => setRoomPassword(e.target.value)}
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Join Room
        </button>
      </form>
    </div>
  );
};

export default JoinRoom;
