import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios'; // Import axios properly at the top

const AuthSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    const handleAuthSuccess = async () => {
      try {
        // Get token from URL
        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get('token');
        
        if (token) {
          console.log('Token received:', token);
          
          // Store the token
          localStorage.setItem('token', token);
          
          // Set default authorization header for axios
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          try {
            // Fetch user data using the token
            const userResponse = await axios.get('http://localhost:5000/api/users/profile');
            const userData = userResponse.data;
            
            console.log('User data:', userData);
            
            // Update auth context
            login(token, userData);
            
            // Redirect to home page
            navigate('/');
          } catch (profileError) {
            console.error('Error fetching user profile:', profileError);
            
            // If profile endpoint fails, create a basic user object from token
            const decodedToken = JSON.parse(atob(token.split('.')[1]));
            const basicUserData = {
              _id: decodedToken.userId,
              name: 'Google User',
              email: 'user@google.com'
            };
            
            login(token, basicUserData);
            navigate('/');
          }
        } else {
          console.error('No token found in URL');
          navigate('/login');
        }
      } catch (error) {
        console.error('Auth success error:', error);
        
        // If there's still a token, try to use it anyway
        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get('token');
        
        if (token) {
          localStorage.setItem('token', token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Create a basic user object
          const basicUserData = {
            _id: 'temp-user-id',
            name: 'Google User',
            email: 'user@google.com'
          };
          
          login(token, basicUserData);
          navigate('/');
        } else {
          alert('Authentication failed. Please try again.');
          navigate('/login');
        }
      }
    };

    handleAuthSuccess();
  }, [location, navigate, login]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Successful!</h2>
        <p className="text-gray-600 mb-4">Please wait while we log you in...</p>
        <div className="flex justify-center">
          <div className="w-8 h-8 border-t-2 border-blue-600 rounded-full animate-spin"></div>
        </div>
      </div>
    </div>
  );
};

export default AuthSuccess;