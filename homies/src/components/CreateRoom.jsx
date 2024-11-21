import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AuthContext } from '../context/AuthContext';

const CreateRoom = () => {
  const [roomId, setRoomId] = useState('');
  const [roomPassword, setRoomPassword] = useState('');
  const [roomName, setRoomName] = useState('');
  const [address, setAddress] = useState('');
  const [mealCount, setMealCount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const { currentUser } = useContext(AuthContext); // Access the logged-in user
  const navigate = useNavigate();

  // Generate a random Room ID
  const generateRoomId = () => {
    return 'room-' + Math.random().toString(36).substr(2, 9);
  };

  // Generate room ID when the component loads
  useEffect(() => {
    if (!currentUser) {
      Swal.fire({
        icon: 'warning',
        title: 'Unauthorized',
        text: 'You need to be logged in to create a room!',
        confirmButtonText: 'Login',
      }).then(() => {
        navigate('/login'); // Redirect to login if user is not logged in
      });
    } else {
      setRoomId(generateRoomId());
    }
  }, [currentUser, navigate]);

  // Handle room creation form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch('http://localhost:5000/create-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomId,
          roomPassword,
          roomName,
          address,
          mealCount: Number(mealCount),
          phoneNumber,
          createdBy: currentUser.email, // Include the user's email as the creator
        }),
      });
  
      // Handle the backend response
      if (response.status === 403) {
        Swal.fire('Error', 'You have already created a room.', 'error');
      } else if (response.ok) {
        Swal.fire('Success!', 'Room created successfully, and you are now the manager!', 'success');
        navigate(`/room/${roomId}`); // Navigate to the created room page
      } else {
        Swal.fire('Error', 'There was an issue creating the room.', 'error');
      }
    } catch (error) {
      Swal.fire('Error', error.message, 'error');
    }
  };
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Create a Room</h2>
        <div className="mb-4">
          <label className="block mb-1">Room ID</label>
          <input
            type="text"
            value={roomId}
            className="w-full p-2 mb-4 border rounded bg-gray-100"
            readOnly
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Room Password</label>
          <input
            type="password"
            placeholder="Create a Room Password"
            className="w-full p-2 mb-4 border rounded"
            value={roomPassword}
            onChange={(e) => setRoomPassword(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Room/Flat Name</label>
          <input
            type="text"
            placeholder="Enter Room/Flat Name"
            className="w-full p-2 mb-4 border rounded"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Address</label>
          <input
            type="text"
            placeholder="Enter Address"
            className="w-full p-2 mb-4 border rounded"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Meal Times</label>
          <input
            type="number"
            placeholder="Meals per day"
            className="w-full p-2 mb-4 border rounded"
            value={mealCount}
            onChange={(e) => setMealCount(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Phone Number</label>
          <input
            type="text"
            placeholder="Enter Phone Number"
            className="w-full p-2 mb-4 border rounded"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
        </div>
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">
          Create Room
        </button>
      </form>
    </div>
  );
};

export default CreateRoom;
