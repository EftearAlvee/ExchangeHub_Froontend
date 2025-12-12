import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  XMarkIcon,
  MapPinIcon,
  CurrencyBangladeshiIcon,
  ArrowPathIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  PhotoIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import ExchangeBoothSelection from './ExchangeBoothSelection';

const PostDetails = ({ post, onClose, onStartChat }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [interested, setInterested] = useState(false);
  const [interestCount, setInterestCount] = useState(post.interestCount || 0);
  const [loading, setLoading] = useState(false);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const { user } = useAuth();

  // Function to get full image URL
// In both files, update the getImageUrl function to debug:
// REPLACE the getImageUrl function in both files:

const getImageUrl = (imagePath) => {
  console.log('🔍 Image path received:', imagePath);
  
  if (!imagePath) {
    return '/placeholder.jpg';
  }
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Check what format the image path is in
  let finalUrl;
  
  // Case 1: Already has full path like "/uploads/posts/filename.jpg"
  if (imagePath.startsWith('/uploads/')) {
    finalUrl = `http://localhost:5000${imagePath}`;
  }
  // Case 2: Just filename like "post-1765534587973-937543827.jpg"
  else if (imagePath.includes('post-')) {
    // Try posts subdirectory first
    finalUrl = `http://localhost:5000/uploads/posts/${imagePath}`;
  }
  // Case 3: Try generic uploads folder
  else {
    finalUrl = `http://localhost:5000/uploads/${imagePath}`;
  }
  
  console.log('🔗 Final image URL:', finalUrl);
  return finalUrl;
};
  const handleShowInterest = async () => {
    if (!user) {
      alert('Please login to show interest');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/posts/${post._id}/interest`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      setInterested(!interested);
      setInterestCount(response.data.interestCount);
    } catch (error) {
      console.error('Error showing interest:', error);
      alert('Failed to show interest: ' + (error.response?.data?.error || 'Something went wrong'));
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = () => {
    onStartChat(post);
    onClose();
  };

  const handleStartExchange = async (exchangeData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/exchange/start',
        {
          postId: post._id,
          booth: exchangeData.booth,
          meetingTime: exchangeData.meetingTime
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      alert('Exchange request sent successfully! The seller will be notified.');
      setShowExchangeModal(false);
    } catch (error) {
      console.error('Error starting exchange:', error);
      alert('Failed to send exchange request: ' + (error.response?.data?.error || 'Something went wrong'));
    } finally {
      setLoading(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === post.images.length - 1 ? 0 : prev + 1
    );
    // Add this inside the main image section after line 109:
console.log('Post images:', post.images);
console.log('Current image URL:', getImageUrl(post.images[currentImageIndex]));
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? post.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Item Details</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="grid md:grid-cols-2 gap-8 p-6">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
               {post.images && post.images.length > 0 ? (
                    <>
                      <img
                        src={getImageUrl(post.images[0])}
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          console.error('Image failed to load:', e.target.src);
                          e.target.style.display = 'none';
                          // Make sure fallback is available
                          const fallback = e.target.nextSibling;
                          if (fallback) {
                            fallback.style.display = 'flex';
                          }
                        }}
                      />
                      {/* Fallback if image fails to load */}
                      <div 
                        className="absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400"
                        style={{ display: 'none' }}
                      >
                        <PhotoIcon className="w-12 h-12 text-gray-500" />
                      </div>
                    </>
                  ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <PhotoIcon className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {post.images && post.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {post.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 ${
                        currentImageIndex === index ? 'border-blue-500' : 'border-transparent'
                      }`}
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="space-y-6">
              {/* Title and Condition */}
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    post.condition === 'New' ? 'bg-green-100 text-green-800' :
                    post.condition === 'Like New' ? 'bg-blue-100 text-blue-800' :
                    post.condition === 'Good' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {post.condition}
                  </span>
                </div>
                
                {/* Price */}
                <div className="flex items-center text-2xl font-bold text-green-600 mb-4">
                  <CurrencyBangladeshiIcon className="w-6 h-6 mr-1" />
                  {post.price}
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{post.description}</p>
              </div>

              {/* Exchange For */}
              <div className="flex items-center text-gray-600">
                <ArrowPathIcon className="w-5 h-5 mr-2" />
                <span className="font-medium">Looking to exchange for:</span>
                <span className="ml-2 text-gray-900">{post.exchangeFor}</span>
              </div>

              {/* Location */}
              <div className="flex items-center text-gray-600">
                <MapPinIcon className="w-5 h-5 mr-2" />
                <span>{post.location?.address || 'Dhaka, Bangladesh'}</span>
              </div>

              {/* Seller Info */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Seller Information</h3>
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {post.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{post.user?.name || 'Unknown User'}</p>
                    <p className="text-sm text-gray-500">Member</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-gray-200 pt-6 space-y-4">
                {/* Interest Button */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleShowInterest}
                    disabled={loading || !user}
                    className="flex items-center space-x-2 bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {interested ? (
                      <HeartSolid className="w-5 h-5" />
                    ) : (
                      <HeartIcon className="w-5 h-5" />
                    )}
                    <span>{interested ? 'Interested' : 'Show Interest'}</span>
                  </button>
                  
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{interestCount}</p>
                    <p className="text-sm text-gray-500">Interested</p>
                  </div>
                </div>

                {/* Start Exchange Button */}
                <button
                  onClick={() => setShowExchangeModal(true)}
                  disabled={!user || user._id === post.user?._id}
                  className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <BuildingStorefrontIcon className="w-5 h-5" />
                  <span>Start Exchange</span>
                </button>

                {/* Chat Button */}
                <button
                  onClick={handleStartChat}
                  disabled={!user}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChatBubbleLeftRightIcon className="w-5 h-5" />
                  <span>Start Chat</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exchange Booth Selection Modal */}
      {showExchangeModal && (
        <ExchangeBoothSelection
          post={post}
          onConfirm={handleStartExchange}
          onClose={() => setShowExchangeModal(false)}
        />
      )}
    </div>
  );
};

export default PostDetails;