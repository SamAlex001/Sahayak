import React, { useState, useEffect, useRef } from 'react';
import { Clock } from 'lucide-react';
import TaskForm from './TaskForm';
import TaskList from './TaskList';
import { RoutineTask } from '../../types';
import { apiFetch } from '../../lib/api';
import { requestNotificationPermission, triggerNotification } from '../../lib/notify';

const DailyRoutineBuilder = () => {
  const [tasks, setTasks] = useState<RoutineTask[]>([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    category: 'other' as RoutineTask['category']
  });
  const [editing, setEditing] = useState<RoutineTask | null>(null);
  const [banner, setBanner] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const notifiedRef = useRef(new Set<string>());

  useEffect(() => {
    fetchTasks();
    requestNotificationPermission();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await apiFetch('/api/routines');
      setTasks(data.map((t: any) => ({ id: t._id, title: t.title, description: t.description, date: t.date, time: t.time, category: t.category })));
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      setLoading(false);
    }
  };

  const addTask = async () => {
    if (newTask.title && newTask.date && newTask.time) {
      try {
        const created = await apiFetch('/api/routines', { method: 'POST', body: JSON.stringify(newTask) });
        const toAdd = { id: created._id, title: created.title, description: created.description, date: created.date, time: created.time, category: created.category } as RoutineTask;
        setTasks([...tasks, toAdd]);
        setNewTask({ title: '', description: '', date: new Date().toISOString().split('T')[0], time: '', category: 'other' });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to add task');
      }
    }
  };

  const removeTask = async (id: string) => {
    try {
      await apiFetch(`/api/routines/${id}`, { method: 'DELETE' });
      setTasks(tasks.filter(task => task.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove task');
    }
  };

  const onEdit = (task: RoutineTask) => {
    setEditing(task);
  };

  const saveEdit = async () => {
    if (!editing) return;
    const { id, ...payload } = editing as any;
    try {
      const updated = await apiFetch(`/api/routines/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
      setTasks(tasks.map(t => t.id === id ? { id, title: updated.title, description: updated.description, date: updated.date, time: updated.time, category: updated.category } : t));
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  useEffect(() => {
    // Enhanced interval to trigger local notifications when time matches
    const timer = setInterval(() => {
      const now = new Date();
      const nowDate = now.toISOString().slice(0, 10);
      const nowTime = now.toTimeString().slice(0,5);
      
      tasks.forEach(t => {
        const taskId = `${t.id}-${nowDate}-${nowTime}`;
        if (t.date === nowDate && t.time === nowTime && !notifiedRef.current.has(taskId)) {
          notifiedRef.current.add(taskId);
          const msg = `Routine: ${t.title} (${t.category}) at ${t.time}${t.description ? ' - ' + t.description : ''}`;
          setBanner(msg);
          triggerNotification('⏰ Routine Reminder', msg);
          
          // Also show a browser alert for immediate attention
          setTimeout(() => {
            alert(`⏰ ROUTINE REMINDER\n\n${t.title}\nCategory: ${t.category}\nTime: ${t.time}\n${t.description ? 'Description: ' + t.description : ''}`);
          }, 1000);
        }
      });
    }, 5000); // Check every 5 seconds for more responsive alerts
    return () => clearInterval(timer);
  }, [tasks]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {banner && (
        <div className="mb-4 border-l-4 border-orange-500 bg-orange-50 p-4 flex items-center justify-between animate-pulse shadow-lg">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⏰</span>
            <p className="text-orange-800 font-semibold text-lg">{banner}</p>
          </div>
          <button 
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 transition-colors"
            onClick={() => setBanner(null)}
          >
            Dismiss
          </button>
        </div>
      )}
      <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
        <Clock className="h-6 w-6 text-rose-600" />
        Daily Routine Builder
      </h2>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <TaskForm task={newTask as any} onTaskChange={setNewTask as any} onSubmit={addTask} />

      <TaskList tasks={tasks} onRemove={removeTask} onEdit={onEdit} />

      {editing && (
        <div className="mt-6 border rounded-lg p-4">
          <h3 className="font-semibold mb-2">Edit Task</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <input className="border rounded p-2" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
            <input className="border rounded p-2" value={editing.date} type="date" onChange={(e) => setEditing({ ...editing, date: e.target.value })} />
            <input className="border rounded p-2" value={editing.time} type="time" onChange={(e) => setEditing({ ...editing, time: e.target.value })} />
            <select className="border rounded p-2" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value as any })}>
              <option value="medication">Medication</option>
              <option value="exercise">Exercise</option>
              <option value="meal">Meal</option>
              <option value="other">Other</option>
            </select>
          </div>
          <textarea className="border rounded p-2 w-full mb-3" rows={2} value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
          <div className="flex gap-2">
            <button className="bg-rose-600 text-white px-3 py-2 rounded" onClick={saveEdit}>Save</button>
            <button className="px-3 py-2 rounded border" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyRoutineBuilder;