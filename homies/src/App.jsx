import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import CreateRoom from './components/CreateRoom';
import JoinRoom from './components/JoinRoom';
import Room from './components/Room';
import MealSummary from './components/MealSummary';
import MyRooms from './components/MyRooms';
import DepositePage from './components/Depositepage';

const App = () => {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<h1 className="text-center mt-10">Welcome to HOMIES!</h1>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create-room" element={<CreateRoom />} />
        <Route path="/join-room" element={<JoinRoom />} />
        <Route path="/room/:roomId" element={<Room />} />
        <Route path="/room/:roomId/meal-summary" element={<MealSummary />} />
        <Route path="/my-rooms" element={<MyRooms />} />
        <Route path="/room/:roomId/deposite" element={<DepositePage />} />


      </Routes>
    </>
  );
};

export default App;
