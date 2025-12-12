import React, { useState } from 'react';
import { 
  MapPinIcon, 
  ClockIcon, 
  CalendarIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

const ExchangeBoothSelection = ({ post, onConfirm, onClose }) => {
  const [selectedBooth, setSelectedBooth] = useState(null);
  const [meetingTime, setMeetingTime] = useState('');
  const [meetingDate, setMeetingDate] = useState('');

  // Dhaka exchange booths
  const dhakaBooths = [
    {
      id: 1,
      name: "Mirpur-2 Xchange Booth",
      location: "Mirpur-2, Dhaka",
      coordinates: { lat: 23.8067, lng: 90.3645 },
      hours: "9:00 AM - 8:00 PM",
      contact: "+880 XXXX-XXXXXX",
      distance: "1.2 km"
    },
    {
      id: 2,
      name: "Dhanmondi Xchange Booth",
      location: "Dhanmondi 27, Dhaka",
      coordinates: { lat: 23.7465, lng: 90.3715 },
      hours: "9:00 AM - 8:00 PM",
      contact: "+880 XXXX-XXXXXX",
      distance: "3.5 km"
    },
    {
      id: 3,
      name: "Uttara Xchange Booth",
      location: "Uttara Sector 7, Dhaka",
      coordinates: { lat: 23.8759, lng: 90.3904 },
      hours: "9:00 AM - 8:00 PM",
      contact: "+880 XXXX-XXXXXX",
      distance: "8.2 km"
    },
    {
      id: 4,
      name: "Gulshan Xchange Booth",
      location: "Gulshan 1, Dhaka",
      coordinates: { lat: 23.7940, lng: 90.4160 },
      hours: "10:00 AM - 9:00 PM",
      contact: "+880 XXXX-XXXXXX",
      distance: "5.7 km"
    }
  ];

  const handleConfirm = () => {
    if (!selectedBooth || !meetingDate || !meetingTime) {
      alert('Please select a booth, date, and time');
      return;
    }

    const meetingDateTime = `${meetingDate}T${meetingTime}`;
    
    onConfirm({
      booth: selectedBooth,
      meetingTime: meetingDateTime
    });
  };

  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Select Exchange Booth</h2>
            <p className="text-gray-600">Choose a secure location for your exchange</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6">
          {/* Item Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Item: {post.title}</h3>
            <p className="text-gray-600">Price: ৳{post.price}</p>
          </div>

          {/* Date and Time Selection */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarIcon className="w-4 h-4 inline mr-1" />
                Meeting Date
              </label>
              <input
                type="date"
                min={getTomorrowDate()}
                value={meetingDate}
                onChange={(e) => setMeetingDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <ClockIcon className="w-4 h-4 inline mr-1" />
                Meeting Time
              </label>
              <input
                type="time"
                min="09:00"
                max="20:00"
                value={meetingTime}
                onChange={(e) => setMeetingTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Booth Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Available Booths</h3>
            {dhakaBooths.map((booth) => (
              <div
                key={booth.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  selectedBooth?.id === booth.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setSelectedBooth(booth)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{booth.name}</h4>
                      {selectedBooth?.id === booth.id && (
                        <CheckCircleIcon className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPinIcon className="w-4 h-4 mr-2" />
                        <span>{booth.location}</span>
                        <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded">
                          {booth.distance}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <ClockIcon className="w-4 h-4 mr-2" />
                        <span>{booth.hours}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Contact: {booth.contact}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedBooth || !meetingDate || !meetingTime}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send Exchange Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExchangeBoothSelection;