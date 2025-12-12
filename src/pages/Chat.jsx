import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  PaperAirplaneIcon, 
  PhotoIcon,
  UserCircleIcon,
  ChatBubbleLeftRightIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const Chat = () => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState({});
  const socket = useSocket();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  // Redirect if user is not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  // Check for conversation from navigation state
  useEffect(() => {
    if (user && location.state?.activeConversation) {
      setActiveConversation(location.state.activeConversation);
      fetchMessages(location.state.activeConversation._id);
      // Mark as read when opening from navigation
      markAsRead(location.state.activeConversation._id);
    }
  }, [location, user]);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  useEffect(() => {
    if (socket && user) {
      socket.emit('userOnline', user._id);

      // Listen for new messages
      socket.on('newMessage', (message) => {
        if (activeConversation && message.conversation === activeConversation._id) {
          setMessages(prev => [...prev, message]);
          // Mark as read immediately if in active conversation
          markAsRead(activeConversation._id);
        } else {
          // Add to unread count for other conversations
          setUnreadMessages(prev => ({
            ...prev,
            [message.conversation]: (prev[message.conversation] || 0) + 1
          }));
        }
      });

      // Listen for conversation updates
      socket.on('conversationUpdated', (conversationId) => {
        if (conversationId === activeConversation?._id) {
          fetchMessages(conversationId);
        }
        fetchConversations(); // Refresh conversations list
      });

      // Listen for user status updates
      socket.on('userStatusUpdate', ({ userId, isOnline }) => {
        setConversations(prev => prev.map(conv => ({
          ...conv,
          participants: conv.participants.map(p => 
            p._id === userId ? { ...p, isOnline } : p
          )
        })));
        
        if (activeConversation) {
          setActiveConversation(prev => ({
            ...prev,
            participants: prev.participants.map(p => 
              p._id === userId ? { ...p, isOnline } : p
            )
          }));
        }
      });

      return () => {
        socket.off('newMessage');
        socket.off('conversationUpdated');
        socket.off('userStatusUpdate');
      };
    }
  }, [socket, user, activeConversation]);

  useEffect(() => {
    if (socket && activeConversation && user) {
      socket.emit('joinConversation', activeConversation._id);
      
      return () => {
        socket.emit('leaveConversation', activeConversation._id);
      };
    }
  }, [socket, activeConversation, user]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/chat/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    if (!user) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/chat/conversations/${conversationId}/messages`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setMessages(response.data);
      // Mark as read when fetching messages
      markAsRead(conversationId);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markAsRead = (conversationId) => {
    setUnreadMessages(prev => ({
      ...prev,
      [conversationId]: 0
    }));
  };

  const handleConversationClick = (conversation) => {
    setActiveConversation(conversation);
    fetchMessages(conversation._id);
    // Close sidebar on mobile after selecting conversation
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || !user) return;

    const messageData = {
      conversationId: activeConversation._id,
      senderId: user._id,
      content: newMessage.trim()
    };

    if (socket) {
      socket.emit('sendMessage', messageData);
    }

    setNewMessage('');
  };

  const getOtherParticipant = (conversation) => {
    if (!user || !conversation?.participants) return null;
    return conversation.participants.find(p => p._id !== user._id);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Show loading or redirect if no user
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-t-2 border-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-t-2 border-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {sidebarOpen ? (
                <XMarkIcon className="w-6 h-6 text-gray-600" />
              ) : (
                <Bars3Icon className="w-6 h-6 text-gray-600" />
              )}
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
            <div className="w-10"></div> {/* Spacer for balance */}
          </div>

          <div className="flex h-[600px]">
            {/* Conversations Sidebar */}
            <div className={`
              ${sidebarOpen ? 'absolute inset-0 z-50 md:relative md:inset-auto' : 'hidden md:block'} 
              w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 bg-gray-50 flex flex-col
            `}>
              <div className="p-4 border-b border-gray-200 bg-white hidden md:block">
                <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                {conversations.length > 0 ? (
                  conversations.map(conversation => {
                    const otherUser = getOtherParticipant(conversation);
                    const unreadCount = unreadMessages[conversation._id] || 0;
                    
                    return (
                      <div
                        key={conversation._id}
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-white transition-colors ${
                          activeConversation?._id === conversation._id ? 'bg-white' : ''
                        }`}
                        onClick={() => handleConversationClick(conversation)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {otherUser?.name?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                              otherUser?.isOnline ? 'bg-green-500' : 'bg-gray-400'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-semibold text-gray-900 truncate">
                                {otherUser?.name || 'Unknown User'}
                              </h3>
                              {unreadCount > 0 && (
                                <span className="bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1">
                                  {unreadCount > 9 ? '9+' : unreadCount}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500 truncate">
                              {conversation.post?.title || 'Item discussion'}
                            </p>
                            <p className="text-xs text-gray-400 truncate">
                              {conversation.lastMessage?.content || 'Start a conversation'}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center">
                    <UserCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No conversations yet</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Start chatting by clicking "Start Exchange" on a post
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {activeConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b border-gray-200 bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={toggleSidebar}
                          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <Bars3Icon className="w-5 h-5 text-gray-600" />
                        </button>
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {getOtherParticipant(activeConversation)?.name?.charAt(0) || 'U'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {getOtherParticipant(activeConversation)?.name || 'Unknown User'}
                          </h3>
                          <p className={`text-sm ${
                            getOtherParticipant(activeConversation)?.isOnline ? 'text-green-600' : 'text-gray-500'
                          }`}>
                            {getOtherParticipant(activeConversation)?.isOnline ? 'Online' : 'Offline'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right hidden sm:block">
                        <p className="text-sm font-medium text-gray-900">
                          {activeConversation.post?.title}
                        </p>
                        <p className="text-xs text-gray-500">Item</p>
                      </div>
                    </div>
                  </div>

                  {/* Messages Container */}
                  <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                    {messages.length > 0 ? (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div
                            key={message._id}
                            className={`flex ${
                              message.sender._id === user._id ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-xs sm:max-w-sm md:max-w-md px-4 py-2 rounded-2xl ${
                                message.sender._id === user._id
                                  ? 'bg-blue-600 text-white rounded-br-none'
                                  : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'
                              }`}
                            >
                              <p className="text-sm break-words">{message.content}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  message.sender._id === user._id
                                    ? 'text-blue-100'
                                    : 'text-gray-500'
                                }`}
                              >
                                {new Date(message.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div ref={messagesEndRef} />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <PaperAirplaneIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-500">No messages yet</p>
                          <p className="text-sm text-gray-400">Send a message to start the conversation</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <form onSubmit={sendMessage} className="flex space-x-2 sm:space-x-4">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="flex-shrink-0 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <PaperAirplaneIcon className="w-5 h-5 sm:w-6 sm:h-6" />
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-gray-50">
                  <div className="text-center p-4">
                    <ChatBubbleLeftRightIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
                    <p className="text-gray-500">Choose a chat from the sidebar or start a new exchange</p>
                    <button
                      onClick={toggleSidebar}
                      className="md:hidden mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Open Conversations
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Chat;