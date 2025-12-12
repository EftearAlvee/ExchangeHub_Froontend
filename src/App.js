import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Chat from './pages/Chat';
import CreatePost from './pages/CreatePost';
import Profile from './pages/Profile';
import AuthSuccess from './pages/AuthSuccess'; // Add this import
import './App.css';
import ExchangeRequests from './pages/ExchangeRequests';
import Marketplace from './pages/Marketplace';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="App">
            <Navbar />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/create-post" element={<CreatePost />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/exchange-requests" element={<ExchangeRequests />} />
              <Route path="/auth/success" element={<AuthSuccess />} />
             <Route path="/marketplace" element={<Marketplace />} /> 
            </Routes>
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;