import React, { useState, useEffect, useRef } from "react";
import { Calendar, Clock, Plus, Trash2 } from "lucide-react";
import { apiFetch } from "../lib/api";
import {
  requestNotificationPermission,
  triggerNotification,
} from "../lib/notify";

interface Appointment {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
  location: string;
  phoneNumber?: string;
}

const CareSchedule = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [newAppointment, setNewAppointment] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    time: "",
    description: "",
    location: "",
    phoneNumber: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    fetchAppointments();
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const nowDate = now.toISOString().slice(0, 10);
      const nowTime = now.toTimeString().slice(0, 5);

      appointments.forEach((a) => {
        const id = `${a.id}-${nowDate}-${nowTime}`;
        if (
          a.date === nowDate &&
          a.time === nowTime &&
          !notifiedRef.current.has(id)
        ) {
          notifiedRef.current.add(id);
          const msg = `Appointment: ${a.title}${
            a.location ? " @ " + a.location : ""
          }${a.description ? " - " + a.description : ""}`;
          setBanner(msg);
          triggerNotification("📅 Appointment Reminder", msg);

          // Also show a browser alert for immediate attention
          setTimeout(() => {
            alert(
              `📅 APPOINTMENT REMINDER\n\n${a.title}\nTime: ${a.time}\n${
                a.location ? "Location: " + a.location + "\n" : ""
              }${a.description ? "Details: " + a.description : ""}`
            );
          }, 1000);
        }
      });
    }, 5000); // Check every 5 seconds for more responsive alerts
    return () => clearInterval(timer);
  }, [appointments]);

  const fetchAppointments = async () => {
    try {
      const data = await apiFetch("/api/appointments");
      setAppointments(
        (data || []).map((apt: any) => ({
          id: apt._id || apt.id,
          title: apt.title,
          description: apt.description,
          date: apt.date,
          time: apt.time,
          location: apt.location,
        }))
      );
      setLoading(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch appointments"
      );
      setLoading(false);
    }
  };

  const addAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppointment.title || !newAppointment.date || !newAppointment.time)
      return;

    try {
      const created = await apiFetch("/api/appointments", {
        method: "POST",
        body: JSON.stringify({
          title: newAppointment.title,
          date: newAppointment.date,
          time: newAppointment.time,
          location: newAppointment.location,
          description: newAppointment.description,
          phoneNumber: newAppointment.phoneNumber,
        }),
      });
      const mappedAppointment = {
        id: created._id || created.id,
        title: created.title,
        description: created.description,
        date: created.date,
        time: created.time,
        location: created.location,
      };
      setAppointments([...appointments, mappedAppointment]);
      setNewAppointment({
        title: "",
        date: new Date().toISOString().split("T")[0],
        time: "",
        description: "",
        location: "",
        phoneNumber: "",
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to add appointment"
      );
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      await apiFetch(`/api/appointments/${id}`, { method: "DELETE" });
      setAppointments(appointments.filter((apt) => apt.id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete appointment"
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        {banner && (
          <div className="mb-4 border-l-4 border-red-500 bg-red-50 p-4 flex items-center justify-between animate-pulse shadow-lg">
            <div className="flex items-center">
              <span className="text-2xl mr-3">🔔</span>
              <p className="text-red-800 font-semibold text-lg">{banner}</p>
            </div>
            <button
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
              onClick={() => setBanner(null)}
            >
              Dismiss
            </button>
          </div>
        )}
        <div className="flex items-center mb-6">
          <Calendar className="h-8 w-8 text-rose-600 mr-3" />
          <h1 className="text-3xl font-bold text-gray-900">
            Appointment Schedule
          </h1>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <form
          onSubmit={addAppointment}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Appointment Title
              </label>
              <input
                type="text"
                value={newAppointment.title}
                onChange={(e) =>
                  setNewAppointment({
                    ...newAppointment,
                    title: e.target.value,
                  })
                }
                className="w-full border rounded-md p-2 focus:ring-rose-500 focus:border-rose-500"
                placeholder="Enter appointment title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                value={newAppointment.date}
                onChange={(e) =>
                  setNewAppointment({ ...newAppointment, date: e.target.value })
                }
                className="w-full border rounded-md p-2 focus:ring-rose-500 focus:border-rose-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="time"
                value={newAppointment.time}
                onChange={(e) =>
                  setNewAppointment({ ...newAppointment, time: e.target.value })
                }
                className="w-full border rounded-md p-2 focus:ring-rose-500 focus:border-rose-500"
                required
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={newAppointment.location}
                onChange={(e) =>
                  setNewAppointment({
                    ...newAppointment,
                    location: e.target.value,
                  })
                }
                className="w-full border rounded-md p-2 focus:ring-rose-500 focus:border-rose-500"
                placeholder="Enter location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number for SMS Reminders
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-md">
                  +91
                </span>
                <input
                  type="tel"
                  value={newAppointment.phoneNumber}
                  onChange={(e) => {
                    // Only allow digits and limit to 10 characters
                    const value = e.target.value
                      .replace(/\D/g, "")
                      .slice(0, 10);
                    setNewAppointment({
                      ...newAppointment,
                      phoneNumber: value,
                    });
                  }}
                  className="flex-1 border rounded-r-md p-2 focus:ring-rose-500 focus:border-rose-500"
                  placeholder="9876543210"
                  maxLength={10}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Enter 10-digit mobile number. SMS will be sent immediately when
                appointment is created.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newAppointment.description}
                onChange={(e) =>
                  setNewAppointment({
                    ...newAppointment,
                    description: e.target.value,
                  })
                }
                className="w-full border rounded-md p-2 focus:ring-rose-500 focus:border-rose-500"
                rows={3}
                placeholder="Enter appointment details"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-rose-600 text-white p-2 rounded-md hover:bg-rose-700 flex items-center justify-center"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Appointment
            </button>
          </div>
        </form>

        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-rose-600 mr-2" />
                  <span className="font-medium">
                    {appointment.date} at {appointment.time}
                  </span>
                </div>
                <button
                  onClick={() => deleteAppointment(appointment.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <h3 className="text-lg font-medium mb-1">{appointment.title}</h3>
              {appointment.location && (
                <p className="text-gray-600 mb-1">📍 {appointment.location}</p>
              )}
              {appointment.phoneNumber && (
                <p className="text-gray-600 mb-1">
                  📱 SMS to: {appointment.phoneNumber}
                </p>
              )}
              {appointment.description && (
                <p className="text-gray-600">{appointment.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CareSchedule;
