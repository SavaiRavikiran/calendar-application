import React from 'react';
import { Calendar, Plus, Check, Clock, RefreshCw } from 'lucide-react';
import { useMsal } from "@azure/msal-react";

interface SidebarProps {
  onCreateEvent: () => void;
}

export default function Sidebar({ onCreateEvent }: SidebarProps) {
  const { instance } = useMsal();
  
  const calendars = [
    { name: 'My Calendar', color: 'bg-blue-500' },
    { name: 'Work', color: 'bg-green-500' },
    { name: 'Personal', color: 'bg-purple-500' },
  ];

  const handleSync = async (service: string) => {
    // Here you would implement the sync logic
    alert(`Syncing with ${service}...`);
  };

  return (
    <div className="h-full bg-white border-r border-gray-200 p-4">
      <div className="space-y-6">
        {/* Create Button */}
        <button 
          onClick={onCreateEvent}
          className="w-full flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          <span>Create Event</span>
        </button>

        {/* Mini Calendar */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-center mb-4">
            <h3 className="font-medium">
              {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            </h3>
          </div>
          {/* Mini calendar grid would go here */}
        </div>

        {/* My Calendars */}
        <div>
          <h3 className="font-medium text-gray-900 mb-2">My Calendars</h3>
          <div className="space-y-2">
            {calendars.map((calendar) => (
              <div key={calendar.name} className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${calendar.color}`} />
                <span className="text-gray-700">{calendar.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sync Options */}
        <div>
          <h3 className="font-medium text-gray-900 mb-2">Sync</h3>
          <div className="space-y-2">
            <button 
              onClick={() => handleSync('Google')}
              className="w-full flex items-center space-x-2 text-gray-700 hover:bg-gray-100 px-2 py-1 rounded"
            >
              <RefreshCw size={16} />
              <span>Sync with Google</span>
            </button>
            <button 
              onClick={() => handleSync('Outlook')}
              className="w-full flex items-center space-x-2 text-gray-700 hover:bg-gray-100 px-2 py-1 rounded"
            >
              <RefreshCw size={16} />
              <span>Sync with Outlook</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}