import React, { useState, useEffect } from 'react';
import { Clock, Calendar, AlertCircle } from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { Appointment, RoutineTask } from '../../types';

interface UpcomingItem {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'appointment' | 'routine';
  description?: string;
  location?: string;
  category?: string;
}

const UpcomingReminders = () => {
  const [upcomingItems, setUpcomingItems] = useState<UpcomingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingItems();
    
    // Refresh every minute
    const interval = setInterval(fetchUpcomingItems, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchUpcomingItems = async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const now = new Date().toTimeString().slice(0, 5);
      
      // Fetch appointments and routines
      const [appointmentsData, routinesData] = await Promise.all([
        apiFetch('/api/appointments').catch(() => []),
        apiFetch('/api/routines').catch(() => [])
      ]);

      // Map appointments
      const appointments: UpcomingItem[] = (appointmentsData || []).map((apt: any) => ({
        id: apt._id || apt.id,
        title: apt.title,
        date: apt.date,
        time: apt.time,
        type: 'appointment' as const,
        description: apt.description,
        location: apt.location
      }));

      // Map routines
      const routines: UpcomingItem[] = (routinesData || []).map((routine: any) => ({
        id: routine._id || routine.id,
        title: routine.title,
        date: routine.date,
        time: routine.time,
        type: 'routine' as const,
        description: routine.description,
        category: routine.category
      }));

      // Combine and filter for today's items that are upcoming or current
      const allItems = [...appointments, ...routines];
      const upcoming = allItems
        .filter(item => item.date === today && item.time >= now)
        .sort((a, b) => a.time.localeCompare(b.time))
        .slice(0, 5); // Show next 5 items

      setUpcomingItems(upcoming);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch upcoming items:', error);
      setLoading(false);
    }
  };

  const getTimeUntil = (time: string) => {
    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const [hours, minutes] = time.split(':').map(Number);
    const targetTime = new Date(`${today}T${time}:00`);
    
    if (targetTime <= now) return 'Now';
    
    const diffMs = targetTime.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `${hours}h ${minutes}m`;
    }
  };

  const isUrgent = (time: string) => {
    const now = new Date();
    const [hours, minutes] = time.split(':').map(Number);
    const targetTime = new Date();
    targetTime.setHours(hours, minutes, 0, 0);
    
    const diffMs = targetTime.getTime() - now.getTime();
    return diffMs <= 15 * 60 * 1000 && diffMs >= 0; // Within next 15 minutes
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-rose-600" />
        Upcoming Reminders
      </h3>
      
      {upcomingItems.length === 0 ? (
        <p className="text-gray-500 text-sm">No upcoming appointments or routines for today.</p>
      ) : (
        <div className="space-y-3">
          {upcomingItems.map((item) => (
            <div 
              key={`${item.type}-${item.id}`}
              className={`p-3 rounded-lg border-l-4 ${
                isUrgent(item.time) 
                  ? 'border-red-500 bg-red-50' 
                  : 'border-blue-500 bg-blue-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {item.type === 'appointment' ? (
                      <Calendar className="h-4 w-4 text-blue-600" />
                    ) : (
                      <Clock className="h-4 w-4 text-green-600" />
                    )}
                    <span className="font-medium text-sm">{item.title}</span>
                    {item.type === 'routine' && item.category && (
                      <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                        {item.category}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-600">
                    {item.time}
                    {item.location && ` • ${item.location}`}
                    {item.description && ` • ${item.description}`}
                  </div>
                </div>
                <div className={`text-sm font-semibold ${
                  isUrgent(item.time) ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {getTimeUntil(item.time)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingReminders;















