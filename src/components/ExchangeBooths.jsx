import React from 'react';
import { MapPinIcon, ClockIcon, PhoneIcon } from '@heroicons/react/24/outline';

const ExchangeBooths = () => {
  const dhakaBooths = [
    {
      name: "Mirpur-2 Xchange Booth",
      location: "Mirpur-2, Dhaka",
      coordinates: [90.3645, 23.8067],
      hours: "9:00 AM - 8:00 PM",
      contact: "+880 XXXX-XXXXXX"
    },
    {
      name: "Dhanmondi Xchange Booth",
      location: "Dhanmondi 27, Dhaka",
      coordinates: [90.3715, 23.7465],
      hours: "9:00 AM - 8:00 PM",
      contact: "+880 XXXX-XXXXXX"
    },
    {
      name: "Uttara Xchange Booth",
      location: "Uttara Sector 7, Dhaka",
      coordinates: [90.3904, 23.8759],
      hours: "9:00 AM - 8:00 PM",
      contact: "+880 XXXX-XXXXXX"
    },
    {
      name: "Gulshan Xchange Booth",
      location: "Gulshan 1, Dhaka",
      coordinates: [90.4160, 23.7940],
      hours: "10:00 AM - 9:00 PM",
      contact: "+880 XXXX-XXXXXX"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Exchange Booths in Dhaka
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Safe and convenient locations across Dhaka for your exchanges
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dhakaBooths.map((booth, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <MapPinIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">{booth.name}</h3>
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-600">
                  <MapPinIcon className="w-4 h-4 mr-2" />
                  <span>{booth.location}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <ClockIcon className="w-4 h-4 mr-2" />
                  <span>{booth.hours}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <PhoneIcon className="w-4 h-4 mr-2" />
                  <span>{booth.contact}</span>
                </div>
              </div>
              <button className="w-full mt-4 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm">
                Get Directions
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExchangeBooths;