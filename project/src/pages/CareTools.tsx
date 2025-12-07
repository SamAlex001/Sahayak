import React, { useState, useEffect } from 'react';
import { Calendar, Clock, FileText, Bell } from 'lucide-react';
import DailyRoutineBuilder from '../components/care-tools/DailyRoutineBuilder';
import SymptomTracker from '../components/care-tools/SymptomTracker';
import { RoutineTask } from '../types';

const CareTools = () => {
  const [activeComponent, setActiveComponent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const tools = [
    {
      id: 'routines',
      title: 'Daily Routine Builder',
      description: 'Create and manage your daily care routines',
      icon: <Calendar className="h-6 w-6 text-rose-600" />,
      component: <DailyRoutineBuilder />
    },
    {
      id: 'symptoms',
      title: 'Symptom Tracker',
      description: 'Track and monitor symptoms over time',
      icon: <Clock className="h-6 w-6 text-rose-600" />,
      component: <SymptomTracker />
    },
    {
      id: 'medications',
      title: 'Medication Tracker',
      description: 'Track medication schedules and dosages',
      icon: <FileText className="h-6 w-6 text-rose-600" />,
      component: null // Will be implemented separately
    },
    {
      id: 'reminders',
      title: 'Reminder System',
      description: 'Set up care-related reminders and notifications',
      icon: <Bell className="h-6 w-6 text-rose-600" />,
      component: null // Will be implemented separately
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12"
         style={{
           backgroundImage: 'url("https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80")',
           backgroundSize: 'cover',
           backgroundPosition: 'center',
           backgroundAttachment: 'fixed'
         }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Care Tools</h1>
          <p className="text-gray-600">Essential tools to help manage daily care responsibilities</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-8">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {tools.map(tool => (
            <button
              key={tool.id}
              onClick={() => setActiveComponent(tool.id)}
              className="bg-white rounded-lg shadow-md p-6 text-left w-full hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center mb-4">
                {tool.icon}
                <h3 className="text-xl font-semibold ml-2">{tool.title}</h3>
              </div>
              <p className="text-gray-600">{tool.description}</p>
            </button>
          ))}
        </div>

        {activeComponent && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            {tools.find(tool => tool.id === activeComponent)?.component}
          </div>
        )}
      </div>
    </div>
  );
};

export default CareTools;