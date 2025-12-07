import React from 'react';
import { Bell } from 'lucide-react';
import AppointmentList from '../components/dashboard/AppointmentList';
import MedicationList from '../components/dashboard/MedicationList';
import EmergencyContacts from '../components/dashboard/EmergencyContacts';
import DailyRoutineBuilder from '../components/care-tools/DailyRoutineBuilder';
import SymptomTracker from '../components/care-tools/SymptomTracker';
import UpcomingReminders from '../components/dashboard/UpcomingReminders';
import { Appointment, Medication } from '../types';

const Dashboard = () => {
  const appointments: Appointment[] = [
    {
      id: '1',
      title: 'Oncologist Appointment',
      date: '2024-03-20',
      time: '10:00 AM',
      location: 'Cancer Care Center',
      notes: 'Bring latest test results'
    }
  ];

  const medications: Medication[] = [
    {
      id: '1',
      name: 'Medication A',
      dosage: '10mg',
      frequency: 'Twice daily',
      time: '8:00 AM, 8:00 PM',
      notes: 'Take with food'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Caretaker Dashboard</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <UpcomingReminders />
          <AppointmentList appointments={appointments} />
          <MedicationList medications={medications} />
          <EmergencyContacts />
        </div>
        
        <div className="space-y-6">
          <DailyRoutineBuilder />
          <SymptomTracker />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;