import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import PostCard from '../components/PostCard';
import ExchangeBooths from '../components/ExchangeBooths';
import { 
  ArrowTrendingUpIcon, 
  ClockIcon,
  MapPinIcon,
  ShieldCheckIcon 
} from '@heroicons/react/24/outline';

const LandingPage = () => {
  const [latestPosts, setLatestPosts] = useState([]);
  const [recommendedPosts, setRecommendedPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('latest');
  const { user } = useAuth();

  useEffect(() => {
    fetchLatestPosts();
  }, []);

  const fetchLatestPosts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/posts/latest');
      setLatestPosts(response.data);
    } catch (error) {
      console.error('Error fetching latest posts:', error);
    }
  };

  const fetchRecommendedPosts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/posts/recommended');
      setRecommendedPosts(response.data);
    } catch (error) {
      console.error('Error fetching recommended posts:', error);
    }
  };

  const postsToShow = activeTab === 'latest' ? latestPosts : recommendedPosts;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
              Welcome to <span className="text-yellow-300">XchangeHub</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Exchange and sell items safely with people near you in Dhaka. 
              Meet at our secure exchange booths for hassle-free transactions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {user ? (
                <Link
                  to="/create-post"
                  className="bg-white text-primary-600 hover:bg-gray-100 font-bold py-4 px-8 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Create Your First Post
                </Link>
              ) : (
                <Link
                  to="/signup"
                  className="bg-yellow-400 text-gray-900 hover:bg-yellow-300 font-bold py-4 px-8 rounded-lg text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Get Started Free
                </Link>
              )}
              <Link
                to="/chat"
                className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-bold py-4 px-8 rounded-lg text-lg transition-all duration-200"
              >
                Start Chatting
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose XchangeHub?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Safe, convenient, and trusted platform for all your exchange needs in Dhaka
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 card hover:transform hover:-translate-y-1 transition-all duration-200">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Secure Transactions</h3>
              <p className="text-gray-600">
                Meet at our verified exchange booths with CCTV and staff support for safe transactions.
              </p>
            </div>
            
            <div className="text-center p-6 card hover:transform hover:-translate-y-1 transition-all duration-200">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPinIcon className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Multiple Locations</h3>
              <p className="text-gray-600">
                Exchange booths across Dhaka - Mirpur, Dhanmondi, Uttara, Gulshan, and more.
              </p>
            </div>
            
            <div className="text-center p-6 card hover:transform hover:-translate-y-1 transition-all duration-200">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowTrendingUpIcon className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Smart Matching</h3>
              <p className="text-gray-600">
                Get personalized recommendations based on your location and interests.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Posts Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Latest Exchanges</h2>
            <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setActiveTab('latest')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'latest'
                    ? 'bg-primary-600 text-white shadow'
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                <ClockIcon className="w-4 h-4 inline mr-2" />
                Latest
              </button>
              <button
                onClick={() => {
                  setActiveTab('recommended');
                  fetchRecommendedPosts();
                }}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'recommended'
                    ? 'bg-primary-600 text-white shadow'
                    : 'text-gray-600 hover:text-primary-600'
                }`}
              >
                <ArrowTrendingUpIcon className="w-4 h-4 inline mr-2" />
                Recommended
              </button>
            </div>
          </div>

          {postsToShow.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {postsToShow.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <ClockIcon className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No posts yet
              </h3>
              <p className="text-gray-500 mb-6">
                Be the first to create a post in your area!
              </p>
              <Link
                to="/create-post"
                className="btn-primary"
              >
                Create First Post
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Exchange Booths Section */}
      <ExchangeBooths />
    </div>
  );
};

export default LandingPage;