import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import {
  CameraIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  HeartIcon,
  ChatBubbleLeftRightIcon,
  ArrowPathIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  PhotoIcon,
  PencilIcon,
  TrashIcon,
  CurrencyBangladeshiIcon,
  MapPinIcon,
  CalendarIcon,
  ArrowRightIcon,
  StarIcon,
  GlobeAltIcon,
  PhoneIcon,
  LinkIcon,
  FaceSmileIcon,
  ExclamationCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleSolid,
  ShieldCheckIcon as ShieldCheckSolid,
  StarIcon as StarSolid,
  XCircleIcon as XCircleSolid
} from '@heroicons/react/24/solid';

// Helper function to safely get array from response
const getSafeArray = (data, path = '') => {
  if (!data) return [];
  
  if (path) {
    // If path provided (e.g., 'exchanges')
    const keys = path.split('.');
    let current = data;
    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        return [];
      }
    }
    return Array.isArray(current) ? current : [];
  }
  
  // If no path, check if data is already an array
  return Array.isArray(data) ? data : [];
};


const Profile = () => {
  const { user: initialUser, logout } = useAuth(); // Remove updateUser from destructuring
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [exchangeHistory, setExchangeHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('activity');
  const [showFaceVerification, setShowFaceVerification] = useState(false);
  const [user, setUser] = useState(initialUser); // Local state for user
  const [verificationStatus, setVerificationStatus] = useState(initialUser?.verified || false);
  const [userStats, setUserStats] = useState({
    postsCount: 0,
    exchangesCompleted: 0,
    totalViews: 0,
    totalInterests: 0,
    rating: 4.5
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    bio: initialUser?.bio || '',
    website: initialUser?.website || '',
    phone: initialUser?.phone || '',
    interests: initialUser?.interests?.join(', ') || '',
    profileVisibility: initialUser?.profileVisibility || 'public'
  });
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
      setEditForm({
        bio: initialUser.bio || '',
        website: initialUser.website || '',
        phone: initialUser.phone || '',
        interests: initialUser.interests?.join(', ') || '',
        profileVisibility: initialUser.profileVisibility || 'public'
      });
      setVerificationStatus(initialUser.verified || false);
      fetchUserData();
    }
  }, [initialUser]);
  // Helper function to safely get array from response
const fetchUserData = async () => {
  try {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    // Fetch user's own profile data
    const profileResponse = await axios.get(
      `http://localhost:5000/api/users/profile`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    
    // Update local user state with fresh data
    setUser(profileResponse.data);
    setVerificationStatus(profileResponse.data.verified || false);
    
    // Update edit form with current data
    setEditForm({
      bio: profileResponse.data.bio || '',
      website: profileResponse.data.website || '',
      phone: profileResponse.data.phone || '',
      interests: profileResponse.data.interests?.join(', ') || '',
      profileVisibility: profileResponse.data.profileVisibility || 'public'
    });

    // Fetch user posts and exchange history
    let postsData = [];
    let exchangesData = [];

    try {
      // Fetch posts
      const postsResponse = await axios.get(
        `http://localhost:5000/api/posts/user/${profileResponse.data._id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      postsData = getSafeArray(postsResponse.data);
      setUserPosts(postsData);
      
    } catch (postError) {
      console.log('Error fetching posts:', postError.message);
      postsData = [];
      setUserPosts([]);
    }

    try {
      // Fetch exchanges
      const exchangesResponse = await axios.get(
        `http://localhost:5000/api/exchange/user`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      console.log('Exchanges API response:', exchangesResponse.data);
      
      // Use getSafeArray helper to extract exchanges array
      exchangesData = getSafeArray(exchangesResponse.data, 'exchanges');
      
      // Set the state
      setExchangeHistory(exchangesData);
      
    } catch (exchangeError) {
      console.log('Error fetching exchanges:', exchangeError.message);
      exchangesData = [];
      setExchangeHistory([]);
    }

    // Calculate stats - SAFELY
    const safeExchangesData = getSafeArray(exchangesData);
    const safePostsData = getSafeArray(postsData);
    
    const stats = {
      postsCount: safePostsData.length,
      exchangesCompleted: safeExchangesData.filter(e => e.status === 'completed').length,
      totalViews: safePostsData.reduce((sum, post) => sum + (post.views || 0), 0),
      totalInterests: safePostsData.reduce((sum, post) => sum + (post.interestCount || 0), 0),
      rating: profileResponse.data.rating || 4.5
    };
    
    setUserStats(stats);
    
  } catch (error) {
    console.error('Error fetching user data:', error);
    // Set defaults to prevent UI breaking
    setUserPosts([]);
    setExchangeHistory([]);
    setUserStats({
      postsCount: 0,
      exchangesCompleted: 0,
      totalViews: 0,
      totalInterests: 0,
      rating: 4.5
    });
  } finally {
    setLoading(false);
  }
};

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/users/profile/picture',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        setProfileImage(response.data.profilePicture);
        // Update local user state instead of calling updateUser
        setUser(prev => ({
          ...prev,
          profilePicture: response.data.profilePicture
        }));
        alert('Profile picture updated successfully!');
        fetchUserData(); // Refresh data
      } else {
        alert(response.data.error || 'Failed to upload profile picture');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(error.response?.data?.error || 'Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Prepare updates
      const updates = {
        bio: editForm.bio,
        website: editForm.website,
        phone: editForm.phone,
        profileVisibility: editForm.profileVisibility,
        interests: editForm.interests.split(',').map(i => i.trim()).filter(i => i)
      };

      const response = await axios.put(
        'http://localhost:5000/api/users/profile',
        updates,
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );

      if (response.data.success) {
        // Update local user state
        setUser(response.data.user || response.data);
        setIsEditing(false);
        alert('Profile updated successfully!');
        fetchUserData(); // Refresh data
      } else {
        alert(response.data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert(error.response?.data?.error || 'Failed to update profile');
    }
  };

  const startFaceVerification = async () => {
    setShowVerificationModal(true);
  };

  const handleFaceVerification = async () => {
    // Check if we're on a mobile device
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // For mobile devices, create an input with camera capture
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment'; // 'environment' for rear camera, 'user' for front camera
      
      input.onchange = handleFileSelection;
      input.click();
    } else {
      // For desktop, show message about camera access
      alert('On desktop browsers, please select a photo file. For direct camera access, please use a mobile device.');
      
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      
      input.onchange = handleFileSelection;
      input.click();
    }
  };

  const handleFileSelection = async (e) => {
    const file = e.target.files[0];
    if (!file) {
      setShowVerificationModal(false);
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      setShowVerificationModal(false);
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      setShowVerificationModal(false);
      return;
    }

    const formData = new FormData();
    formData.append('faceImage', file);

    try {
      setVerificationLoading(true);
      setShowFaceVerification(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        'http://localhost:5000/api/users/verify-face',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      if (response.data.success) {
        setVerificationStatus(true);
        // Update local user state
        setUser(prev => ({
          ...prev,
          verified: true
        }));
        alert(response.data.message || 'Face verification successful!');
        fetchUserData(); // Refresh data
      } else {
        alert(response.data.error || 'Face verification failed');
      }
    } catch (error) {
      console.error('Error in face verification:', error);
      alert(error.response?.data?.error || 'Face verification failed. Please try again.');
    } finally {
      setVerificationLoading(false);
      setShowFaceVerification(false);
      setShowVerificationModal(false);
    }
  };

  // Alternative: Using MediaDevices API for direct camera access (requires HTTPS)
  const handleCameraAccess = async () => {
    // Note: This only works on HTTPS or localhost
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('Camera access is not supported in your browser. Please use the file upload option.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } // 'user' for front camera, 'environment' for back
      });
      
      // Create a video element to show camera preview
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();
      
      // You would need to implement a UI to capture the photo from the video
      alert('Camera accessed successfully! You would need to implement photo capture logic here.');
      
      // Don't forget to stop the stream when done
      stream.getTracks().forEach(track => track.stop());
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Could not access camera. Please check permissions or use file upload.');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `http://localhost:5000/api/posts/${postId}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      
      // Refresh posts list
      fetchUserData();
      alert('Post deleted successfully!');
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  const handleViewPostDetails = (post) => {
    navigate(`/post/${post._id}`);
  };

  const handleViewExchangeDetails = (exchange) => {
    navigate(`/exchange/${exchange._id}`);
  };

  const getProfileImageUrl = () => {
    if (profileImage) return profileImage;
    if (user?.profilePicture) {
      return user.profilePicture.startsWith('http') 
        ? user.profilePicture 
        : `http://localhost:5000${user.profilePicture}`;
    }
    return null;
  };

  const getPostStats = (post) => {
    return {
      views: post.views || 0,
      interests: post.interestCount || post.interests?.length || 0,
      chats: post.conversations || 0
    };
  };

  const getInitials = () => {
    if (!user?.name) return '?';
    return user.name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const renderActivityItem = (item) => {
    if (item.type === 'post') {
      const stats = getPostStats(item);
      return (
        <div 
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleViewPostDetails(item)}
        >
          <div className="flex justify-between items-start mb-3">
            <h4 className="font-semibold text-gray-900">{item.title}</h4>
            <span className="text-xs text-gray-500">
              {new Date(item.createdAt).toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center">
              <EyeIcon className="w-4 h-4 mr-1" />
              <span>{stats.views} views</span>
            </div>
            <div className="flex items-center">
              <HeartIcon className="w-4 h-4 mr-1" />
              <span>{stats.interests} interested</span>
            </div>
            <div className="flex items-center">
              <ChatBubbleLeftRightIcon className="w-4 h-4 mr-1" />
              <span>{stats.chats} chats</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <CurrencyBangladeshiIcon className="w-4 h-4 text-green-600 mr-1" />
              <span className="font-semibold text-gray-900">৳{item.price}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs ${
                item.status === 'available' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {item.status || 'available'}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeletePost(item._id);
                }}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      );
    } else if (item.type === 'exchange') {
      return (
        <div 
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => handleViewExchangeDetails(item)}
        >
          <div className="flex justify-between items-start mb-3">
            <div>
              <h4 className="font-semibold text-gray-900">Exchange Request</h4>
              <p className="text-sm text-gray-600">{item.post?.title || 'Item'}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs ${
              item.status === 'completed' 
                ? 'bg-green-100 text-green-800' 
                : item.status === 'accepted'
                ? 'bg-blue-100 text-blue-800'
                : item.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              {item.status}
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center">
              <ArrowPathIcon className="w-4 h-4 mr-1" />
              <span>Exchanging for: {item.exchangeItem || 'N/A'}</span>
            </div>
            {item.location && (
              <div className="flex items-center">
                <MapPinIcon className="w-4 h-4 mr-1" />
                <span>{item.location}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center">
              <CalendarIcon className="w-4 h-4 mr-1" />
              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
            </div>
            <ArrowRightIcon className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Face Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Face Verification</h3>
              <button
                onClick={() => setShowVerificationModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircleIcon className="w-6 h-6" />
              </button>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center justify-center w-20 h-20 mx-auto mb-4 bg-blue-100 rounded-full">
                <FaceSmileIcon className="w-10 h-10 text-blue-600" />
              </div>
              <h4 className="text-center font-medium text-gray-900 mb-2">Verify Your Identity</h4>
              <p className="text-sm text-gray-600 text-center mb-4">
                Take a clear selfie for verification. This helps build trust in our community.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <InformationCircleIcon className="w-5 h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">Tips for best results:</p>
                    <ul className="list-disc pl-4 space-y-1">
                      <li>Face the camera directly</li>
                      <li>Ensure good lighting</li>
                      <li>Remove glasses if possible</li>
                      <li>Keep a neutral expression</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Camera access explanation */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> On mobile devices, this will open your camera. On desktop, you'll select a photo file.
                </p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowVerificationModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={verificationLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleFaceVerification}
                disabled={verificationLoading}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
              >
                {verificationLoading ? (
                  <>
                    <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                    Verifying...
                  </>
                ) : (
                  <>
                    <CameraIcon className="w-5 h-5 mr-2" />
                    Take Photo
                  </>
                )}
              </button>
            </div>
            
            {/* Alternative camera access button for advanced users */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={handleCameraAccess}
                className="w-full px-4 py-2 border border-blue-300 text-blue-700 rounded-lg hover:bg-blue-50 transition-colors text-sm"
              >
                Advanced: Direct Camera Access (HTTPS required)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Profile Picture with Upload Option */}
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white/20 bg-gradient-to-br from-blue-500 to-purple-500 overflow-hidden">
                  {getProfileImageUrl() ? (
                    <img 
                      src={getProfileImageUrl()}
                      alt={user?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-white text-4xl font-bold">
                        {getInitials()}
                      </span>
                    </div>
                  )}
                </div>
                
                {/* Upload Button */}
                <label className="absolute bottom-2 right-2 bg-white text-primary-600 p-2 rounded-full shadow-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <CameraIcon className="w-5 h-5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                
                {/* Verification Badge */}
                {verificationStatus && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white p-1.5 rounded-full shadow-lg">
                    <ShieldCheckSolid className="w-6 h-6" />
                  </div>
                )}
                
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-8 h-8 border-t-2 border-white rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              
              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-center flex-wrap gap-2 mb-2">
                  <h1 className="text-3xl font-bold">{user?.name}</h1>
                  {verificationStatus ? (
                    <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                      <ShieldCheckSolid className="w-4 h-4 mr-1" />
                      Verified
                    </div>
                  ) : (
                    <button
                      onClick={startFaceVerification}
                      className="inline-flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm hover:bg-blue-200 transition-colors"
                    >
                      <ShieldCheckIcon className="w-4 h-4 mr-1" />
                      Get Verified
                    </button>
                  )}
                </div>
                
                <p className="text-blue-100">{user?.email}</p>
                <p className="text-blue-100 text-sm mt-1">
                  Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                </p>
                
                {/* Bio */}
                {user?.bio && !isEditing && (
                  <p className="mt-3 text-blue-100 max-w-md">{user.bio}</p>
                )}
                
                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 mt-3">
                  {user?.phone && (
                    <div className="flex items-center text-sm">
                      <PhoneIcon className="w-4 h-4 mr-1" />
                      {user.phone}
                    </div>
                  )}
                  {user?.website && (
                    <a 
                      href={user.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center text-sm hover:underline"
                    >
                      <LinkIcon className="w-4 h-4 mr-1" />
                      Website
                    </a>
                  )}
                </div>
                
                {/* Interests */}
                {user?.interests?.length > 0 && !isEditing && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {user.interests.map((interest, idx) => (
                      <span key={idx} className="px-3 py-1 bg-white/20 rounded-full text-xs">
                        {interest}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Edit Profile Button */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="mt-6 md:mt-0 px-6 py-3 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              {isEditing ? 'Cancel Editing' : 'Edit Profile'}
            </button>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      {isEditing && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows="3"
                  maxLength="500"
                  placeholder="Tell us about yourself..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  {editForm.bio.length}/500 characters
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="+8801XXXXXXXXX"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={editForm.website}
                    onChange={(e) => setEditForm({...editForm, website: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interests (comma separated)
                </label>
                <input
                  type="text"
                  value={editForm.interests}
                  onChange={(e) => setEditForm({...editForm, interests: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="books, music, technology, sports"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Profile Visibility
                </label>
                <select
                  value={editForm.profileVisibility}
                  onChange={(e) => setEditForm({...editForm, profileVisibility: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="public">Public (Everyone can see)</option>
                  <option value="friends">Friends Only</option>
                  <option value="private">Private (Only me)</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Posts</p>
                <p className="text-3xl font-bold text-gray-900">{userStats.postsCount}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <PhotoIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Exchanges Done</p>
                <p className="text-3xl font-bold text-gray-900">{userStats.exchangesCompleted}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <ArrowPathIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-3xl font-bold text-gray-900">{userStats.totalViews}</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <EyeIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Interests</p>
                <p className="text-3xl font-bold text-gray-900">{userStats.totalInterests}</p>
              </div>
              <div className="p-3 bg-pink-50 rounded-lg">
                <HeartIcon className="w-6 h-6 text-pink-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('activity')}
                className={`py-4 px-6 font-medium text-sm border-b-2 ${
                  activeTab === 'activity'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Recent Activity
              </button>
              <button
                onClick={() => setActiveTab('posts')}
                className={`py-4 px-6 font-medium text-sm border-b-2 ${
                  activeTab === 'posts'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                My Posts ({userPosts.length})
              </button>
              <button
                onClick={() => setActiveTab('exchanges')}
                className={`py-4 px-6 font-medium text-sm border-b-2 ${
                  activeTab === 'exchanges'
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Exchange History ({exchangeHistory.length})
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-t-2 border-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your data...</p>
              </div>
            ) : (
              <>
                {/* Activity Tab */}
                {activeTab === 'activity' && (
                    <div className="space-y-4">
                      {[...userPosts.slice(0, 5), ...(Array.isArray(exchangeHistory) ? exchangeHistory.slice(0, 5) : [])]
                        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .map((item, index) => (
                          <div key={item._id || index}>
                            {renderActivityItem({
                              ...item,
                              type: item._id?.startsWith('exchange') || item.post ? 'exchange' : 'post'
                            })}
                          </div>
                        ))}
                      
                      {userPosts.length === 0 && (!Array.isArray(exchangeHistory) || exchangeHistory.length === 0) && (
                        <div className="text-center py-12">
                          <ClockIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No activity yet</p>
                          <p className="text-sm text-gray-400 mt-2">Your activity will appear here</p>
                        </div>
                      )}
                    </div>
                  )}
                
                {/* Posts Tab */}
                {activeTab === 'posts' && (
                  <div className="space-y-4">
                    {userPosts.length > 0 ? (
                      userPosts.map((post) => renderActivityItem({ ...post, type: 'post' }))
                    ) : (
                      <div className="text-center py-12">
                        <PhotoIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No posts yet</p>
                        <p className="text-sm text-gray-400 mt-2">
                          Create your first post to start exchanging
                        </p>
                        <button
                          onClick={() => navigate('/create-post')}
                          className="mt-4 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          Create Post
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Exchanges Tab */}
                {activeTab === 'exchanges' && (
                    <div className="space-y-4">
                      {Array.isArray(exchangeHistory) && exchangeHistory.length > 0 ? (
                        exchangeHistory.map((exchange) => 
                          renderActivityItem({ ...exchange, type: 'exchange' })
                        )
                      ) : (
                        <div className="text-center py-12">
                          <ArrowPathIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600">No exchange history yet</p>
                          <p className="text-sm text-gray-400 mt-2">
                            Complete your first exchange to see history here
                          </p>
                        </div>
                      )}
                    </div>
                  )}
              </>
            )}
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/create-post')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center">
                <div className="p-2 bg-blue-50 rounded-lg mr-4">
                  <PencilIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Create New Post</h4>
                  <p className="text-sm text-gray-600">Sell or exchange items</p>
                </div>
              </div>
            </button>
            
            <button
              onClick={logout}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <div className="flex items-center">
                <div className="p-2 bg-red-50 rounded-lg mr-4">
                  <XCircleIcon className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Logout</h4>
                  <p className="text-sm text-gray-600">Sign out of your account</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;

