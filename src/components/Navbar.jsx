import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  HomeIcon, 
  ChatBubbleLeftRightIcon, 
  PlusCircleIcon, 
  UserCircleIcon,
  BellIcon,
  ShoppingBagIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [notificationCount, setNotificationCount] = useState(0);

  // Fetch pending exchange requests count
  useEffect(() => {
    const fetchNotificationCount = async () => {
      if (!user) return;
      
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/exchange/my-requests', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Extract exchanges array from response
        let exchanges = [];
        
        if (response.data && response.data.exchanges) {
          // New format: { exchanges: [], counts: {} }
          exchanges = Array.isArray(response.data.exchanges) ? response.data.exchanges : [];
        } else if (Array.isArray(response.data)) {
          // Old format: directly an array
          exchanges = response.data;
        } else {
          console.warn('Unexpected response format:', response.data);
          exchanges = [];
        }
        
        // Count pending requests where user is the seller
        const pendingCount = exchanges.filter(exchange => {
          if (!exchange || !exchange.seller) return false;
          
          // Check if user is the seller (handle both populated object and ID string)
          const sellerId = exchange.seller._id || exchange.seller;
          const isSeller = user._id === sellerId;
          
          return exchange.status === 'pending' && isSeller;
        }).length;
        
        setNotificationCount(pendingCount);
        
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setNotificationCount(0);
      }
    };

    fetchNotificationCount();
    
    // Optional: Set up polling for real-time updates
    const interval = setInterval(fetchNotificationCount, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [user]);

  const navItems = [
    { path: '/', icon: HomeIcon, label: 'Home' },
    { path: '/marketplace', icon: ShoppingBagIcon, label: 'Marketplace' },
    { path: '/chat', icon: ChatBubbleLeftRightIcon, label: 'Chat' },
    { path: '/create-post', icon: PlusCircleIcon, label: 'Post' },
    { 
      path: '/exchange-requests', 
      icon: BellIcon, 
      label: 'Exchanges',
      badge: notificationCount > 0 ? notificationCount : null
    },
  ];

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">X</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-purple-600 bg-clip-text text-transparent">
              XchangeHub
            </span>
          </Link>

          {/* Navigation Items */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-all duration-200 relative ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 font-medium'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors duration-200"
                >
                  <UserCircleIcon className="w-6 h-6 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {user.name}
                  </span>
                </Link>
                <button
                  onClick={logout}
                  className="btn-secondary text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-primary-600 font-medium transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="btn-primary text-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 pt-2 pb-3">
          <div className="flex justify-around">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-all duration-200 relative ${
                    isActive
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-gray-600 hover:text-primary-600'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs">{item.label}</span>
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;