import React from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPinIcon, 
  CurrencyBangladeshiIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

const PostCard = ({ post }) => {
  return (
    <div className="card overflow-hidden hover:shadow-lg transition-all duration-300 group">
      {/* Image Section */}
      <div className="relative h-48 bg-gray-200 overflow-hidden">
        {post.images && post.images.length > 0 ? (
          <img
            src={post.images[0]}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
            <CurrencyBangladeshiIcon className="w-12 h-12 text-gray-500" />
          </div>
        )}
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
      </div>

      {/* Content Section */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {post.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {post.description}
        </p>

        {/* Exchange Info */}
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <ArrowPathIcon className="w-4 h-4 mr-1" />
          <span className="font-medium">Exchange for:</span>
          <span className="ml-1 text-gray-700">{post.exchangeFor}</span>
        </div>

        {/* Location */}
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <MapPinIcon className="w-4 h-4 mr-1" />
          <span>{post.location?.address || 'Dhaka, Bangladesh'}</span>
        </div>

        {/* Price and User */}
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <CurrencyBangladeshiIcon className="w-5 h-5 text-green-600" />
            <span className="font-bold text-lg text-gray-900">{post.price}</span>
          </div>
          
          {post.user && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <span className="text-primary-600 text-sm font-medium">
                  {post.user.name?.charAt(0) || 'U'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button className="w-full mt-3 bg-primary-50 hover:bg-primary-100 text-primary-600 font-medium py-2 rounded-lg transition-colors duration-200">
          Start Exchange
        </button>
      </div>
    </div>
  );
};

export default PostCard;