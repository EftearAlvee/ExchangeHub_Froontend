import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MapPinIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const ExchangeRequests = () => {
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  useEffect(() => {
    if (user) {
      fetchExchanges();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchExchanges = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/exchange/my-requests', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Exchange response:', response.data);
      
      // Extract exchanges array from response
      let exchangesData = [];
      
      if (response.data && response.data.exchanges) {
        // New format: { exchanges: [], counts: {} }
        exchangesData = Array.isArray(response.data.exchanges) ? response.data.exchanges : [];
      } else if (Array.isArray(response.data)) {
        // Old format: directly an array
        exchangesData = response.data;
      } else {
        console.warn('Unexpected response format:', response.data);
        exchangesData = [];
      }
      
      setExchanges(exchangesData);
    } catch (error) {
      console.error('Error fetching exchanges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (exchangeId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/exchange/${exchangeId}/accept`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      alert('Exchange accepted! Invoice token generated: ' + response.data.invoiceToken);
      fetchExchanges(); // Refresh list
    } catch (error) {
      console.error('Error accepting exchange:', error);
      alert('Failed to accept exchange: ' + (error.response?.data?.error || 'Something went wrong'));
    }
  };

  const handleReject = async (exchangeId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:5000/api/exchange/${exchangeId}/reject`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      alert('Exchange rejected');
      fetchExchanges(); // Refresh list
    } catch (error) {
      console.error('Error rejecting exchange:', error);
      alert('Failed to reject exchange: ' + (error.response?.data?.error || 'Something went wrong'));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate pending requests count for notifications
  const pendingRequestsCount = Array.isArray(exchanges) 
    ? exchanges.filter(exchange => {
        if (!exchange || !exchange.seller) return false;
        const sellerId = exchange.seller._id || exchange.seller;
        return exchange.status === 'pending' && user?._id === sellerId;
      }).length
    : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-t-2 border-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exchange requests...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view exchange requests</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Exchange Requests</h1>
            {pendingRequestsCount > 0 && (
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{pendingRequestsCount}</span>
                  </div>
                </div>
                <span className="text-sm text-gray-600">Pending requests</span>
              </div>
            )}
          </div>
          
          {exchanges.length === 0 ? (
            <div className="text-center py-12">
              <ClockIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No exchange requests yet</p>
              <p className="text-sm text-gray-400 mt-2">
                When someone wants to exchange with you, it will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {exchanges.map((exchange) => (
                <div key={exchange._id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {exchange.post?.title || 'Unknown Post'}
                      </h3>
                      <p className="text-gray-600">Price: ৳{exchange.post?.price || 'N/A'}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(exchange.status)}`}>
                      {exchange.status?.charAt(0).toUpperCase() + exchange.status?.slice(1)}
                    </span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Meeting Details</h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <MapPinIcon className="w-4 h-4 mr-2" />
                          <span>{exchange.selectedBooth?.name || exchange.selectedBooth || 'Location not specified'}</span>
                        </div>
                        <div className="flex items-center">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          <span>{exchange.meetingTime ? new Date(exchange.meetingTime).toLocaleString() : 'Time not set'}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        {user._id === (exchange.seller?._id || exchange.seller) ? 'Buyer' : 'Seller'}
                      </h4>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {(user._id === (exchange.seller?._id || exchange.seller) 
                              ? exchange.buyer?.name?.charAt(0) 
                              : exchange.seller?.name?.charAt(0)) || '?'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user._id === (exchange.seller?._id || exchange.seller) 
                              ? exchange.buyer?.name 
                              : exchange.seller?.name || 'Unknown User'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {user._id === (exchange.seller?._id || exchange.seller) ? 'Interested Buyer' : 'Item Seller'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {exchange.invoiceToken && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-green-800 mb-2">Invoice Token</h4>
                      <p className="text-green-700 font-mono">{exchange.invoiceToken}</p>
                      <p className="text-sm text-green-600 mt-1">
                        Share this token with the XchangeHub staff at the booth
                      </p>
                    </div>
                  )}

                  {/* Action Buttons for Seller */}
                  {user._id === (exchange.seller?._id || exchange.seller) && exchange.status === 'pending' && (
                    <div className="flex space-x-4">
                      <button
                        onClick={() => handleAccept(exchange._id)}
                        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <CheckCircleIcon className="w-4 h-4" />
                        <span>Accept</span>
                      </button>
                      <button
                        onClick={() => handleReject(exchange._id)}
                        className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <XCircleIcon className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExchangeRequests;