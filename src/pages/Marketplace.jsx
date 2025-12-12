import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import PostCard from '../components/PostCard'; // Import PostCard
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  UserIcon,
  ArrowsUpDownIcon,
  XMarkIcon,
  StarIcon,
  SparklesIcon,
  TagIcon,
  ArrowsRightLeftIcon,
  ShoppingCartIcon,
  FireIcon,
  PhotoIcon,
  ArrowTrendingUpIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const Marketplace = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'exchange', 'sale'
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/posts/latest');
      
      console.log('Marketplace posts:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setPosts(response.data);
        setFilteredPosts(response.data);
        
        // Extract unique categories and locations
        const uniqueCategories = [...new Set(response.data.map(post => post.category))].filter(Boolean);
        const uniqueLocations = [...new Set(response.data.map(post => 
          post.location && post.location.address ? 
          post.location.address.split(',')[0] : 'Unknown'
        ))].filter(Boolean);
        
        setCategories(uniqueCategories);
        setLocations(uniqueLocations);
      }
    } catch (error) {
      console.error('Error fetching marketplace posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter posts when criteria change
  useEffect(() => {
    let filtered = [...posts];

    // Tab filter
    if (activeTab === 'exchange') {
      filtered = filtered.filter(post => post.postType === 'exchange' || !post.postType);
    } else if (activeTab === 'sale') {
      filtered = filtered.filter(post => post.postType === 'sale');
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(post => 
        (post.title && post.title.toLowerCase().includes(term)) || 
        (post.description && post.description.toLowerCase().includes(term)) ||
        (post.exchangeFor && post.exchangeFor.toLowerCase().includes(term)) ||
        (post.category && post.category.toLowerCase().includes(term))
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    // Price filter
    filtered = filtered.filter(post => 
      post.price >= priceRange[0] && post.price <= priceRange[1]
    );

    // Condition filter
    if (selectedCondition !== 'all') {
      filtered = filtered.filter(post => post.condition === selectedCondition);
    }

    // Location filter
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(post => 
        post.location && post.location.address && 
        post.location.address.toLowerCase().includes(selectedLocation.toLowerCase())
      );
    }

    // Sort
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'trending':
        filtered.sort((a, b) => (b.interestCount || 0) - (a.interestCount || 0));
        break;
      default: // 'newest'
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredPosts(filtered);
  }, [posts, activeTab, searchTerm, selectedCategory, priceRange, sortBy, selectedCondition, selectedLocation]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setPriceRange([0, 10000]);
    setSortBy('newest');
    setSelectedCondition('all');
    setSelectedLocation('all');
    setActiveTab('all');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-t-2 border-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Hero Section - Same as Landing Page style */}
      <section className="bg-gradient-to-r from-primary-600 to-purple-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Marketplace
            </h1>
            <p className="text-lg md:text-xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Browse all items available for exchange or sale. Find exactly what you're looking for with our powerful filters.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Filter Tabs */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-2 bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'all'
                  ? 'bg-primary-600 text-white shadow'
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              All Items
            </button>
            <button
              onClick={() => setActiveTab('exchange')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'exchange'
                  ? 'bg-primary-600 text-white shadow'
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              <ArrowsRightLeftIcon className="w-4 h-4 inline mr-2" />
              Exchange
            </button>
            <button
              onClick={() => setActiveTab('sale')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'sale'
                  ? 'bg-primary-600 text-white shadow'
                  : 'text-gray-600 hover:text-primary-600'
              }`}
            >
              <ShoppingCartIcon className="w-4 h-4 inline mr-2" />
              For Sale
            </button>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              <FunnelIcon className="w-5 h-5" />
              <span>Filters</span>
            </button>
            
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white appearance-none pr-10"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="trending">Most Popular</option>
              </select>
              <ArrowsUpDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for items, descriptions, categories..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Advanced Filter Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Advanced Filters</h3>
              <button
                onClick={clearFilters}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <XMarkIcon className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <TagIcon className="w-4 h-4 inline mr-1" />
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CurrencyDollarIcon className="w-4 h-4 inline mr-1" />
                  Price Range (৳)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="number"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Min"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="number"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000])}
                    className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Condition Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <SparklesIcon className="w-4 h-4 inline mr-1" />
                  Condition
                </label>
                <select
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Conditions</option>
                  <option value="New">New</option>
                  <option value="Like New">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                </select>
              </div>

              {/* Location Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPinIcon className="w-4 h-4 inline mr-1" />
                  Location
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Locations</option>
                  {locations.map((location, index) => (
                    <option key={index} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            Showing <span className="font-semibold">{filteredPosts.length}</span> of <span className="font-semibold">{posts.length}</span> items
            {activeTab !== 'all' && (
              <span className="ml-2 text-primary-600">
                ({activeTab === 'exchange' ? 'Exchange items' : 'Items for sale'})
              </span>
            )}
          </p>
          {filteredPosts.length === 0 && posts.length > 0 && (
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Clear filters to see all items
            </button>
          )}
        </div>

        {/* Posts Grid - USING POSTCARD COMPONENT */}
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPosts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <MagnifyingGlassIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {posts.length === 0 ? 'No items in marketplace yet' : 'No matching items found'}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              {posts.length === 0 
                ? 'Be the first to post an item for exchange!' 
                : 'Try adjusting your search or filters to find what you\'re looking for.'
              }
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={clearFilters}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {posts.length === 0 ? 'Create First Post' : 'Clear All Filters'}
              </button>
              {posts.length === 0 && (
                <Link
                  to="/create-post"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity"
                >
                  Start Selling
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Create Post CTA */}
        {filteredPosts.length > 0 && user && (
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-blue-100">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Want to sell or exchange something?
              </h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Join thousands of users who are trading safely on XchangeHub. Post your item in just 2 minutes!
              </p>
              <Link
                to="/create-post"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Create a New Post
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;