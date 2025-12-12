import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  MapPinIcon, 
  CurrencyBangladeshiIcon,
  ArrowPathIcon,
  PhotoIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import PostDetails from './PostDetails';

const PostCard = ({ post }) => {
  const [showDetails, setShowDetails] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Function to get full image URL
// Replace the getImageUrl function in PostCard.jsx:
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

  const handleCardClick = () => {
    setShowDetails(true);
  };

  const handleStartChat = async (post) => {
    if (!user) {
      alert('Please login to start a chat');
      return;
    }

    if (user._id === post.user._id) {
      alert('You cannot start a chat with yourself');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/chat/conversations/start',
        {
          postId: post._id,
          message: `Hi! I'm interested in your "${post.title}". Is this still available?`
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Navigate to chat with the conversation
      navigate('/chat', { 
        state: { 
          activeConversation: response.data.conversation 
        } 
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      alert('Failed to start conversation: ' + (error.response?.data?.error || 'Something went wrong'));
    }
  };

  return (
    <>
      <div 
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Image Section */}
        <div className="relative h-48 bg-gray-200 overflow-hidden">
          {post.images && post.images.length > 0 ? (
            <>
              <img
                src={getImageUrl(post.images[0])}
                alt={post.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              {/* Fallback if image fails to load */}
              <div className="absolute inset-0 hidden items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
                <PhotoIcon className="w-12 h-12 text-gray-500" />
              </div>
              
              {/* Multiple images indicator */}
              {post.images.length > 1 && (
                <div className="absolute top-3 right-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                  +{post.images.length - 1}
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
              <PhotoIcon className="w-12 h-12 text-gray-500" />
            </div>
          )}
          
          {/* Condition Badge */}
          <div className="absolute top-3 left-3">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              post.condition === 'New' ? 'bg-green-100 text-green-800' :
              post.condition === 'Like New' ? 'bg-blue-100 text-blue-800' :
              post.condition === 'Good' ? 'bg-yellow-100 text-yellow-800' :
              'bg-orange-100 text-orange-800'
            }`}>
              {post.condition}
            </span>
          </div>

          {/* Interest Count */}
          <div className="absolute bottom-3 left-3 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
            <HeartIcon className="w-3 h-3" />
            <span>{post.interestCount || 0}</span>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
            {post.title}
          </h3>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {post.description}
          </p>

          {/* Exchange Info */}
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <ArrowPathIcon className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="font-medium mr-1">Exchange for:</span>
            <span className="text-gray-700 truncate">{post.exchangeFor}</span>
          </div>

          {/* Location */}
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <MapPinIcon className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">{post.location?.address || 'Dhaka, Bangladesh'}</span>
          </div>

          {/* Price and User */}
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <CurrencyBangladeshiIcon className="w-5 h-5 text-green-600 mr-1" />
              <span className="font-bold text-lg text-gray-900">{post.price}</span>
            </div>
            
            {post.user && (
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 text-sm font-medium">
                    {post.user.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Post Details Modal */}
      {showDetails && (
        <PostDetails 
          post={post} 
          onClose={() => setShowDetails(false)}
          onStartChat={handleStartChat}
        />
      )}
    </>
  );
};

export default PostCard;