import React from 'react';
import { Plus } from 'lucide-react';
import { RoutineTask } from '../../types';

interface TaskFormProps {
  task: Omit<RoutineTask, 'id'>;
  onTaskChange: (task: Omit<RoutineTask, 'id'>) => void;
  onSubmit: () => void;
}

const TaskForm = ({ task, onTaskChange, onSubmit }: TaskFormProps) => (
  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
    <div>
      <input
        type="text"
        value={task.title}
        onChange={(e) => onTaskChange({ ...task, title: e.target.value })}
        placeholder="Title"
        className="border rounded-md p-2 w-full"
      />
    </div>
    <div>
      <input
        type="date"
        value={task.date}
        onChange={(e) => onTaskChange({ ...task, date: e.target.value })}
        className="border rounded-md p-2 w-full"
      />
    </div>
    <div>
      <input
        type="time"
        value={task.time}
        onChange={(e) => onTaskChange({ ...task, time: e.target.value })}
        className="border rounded-md p-2 w-full"
      />
    </div>
    <div>
      <select
        value={task.category}
        onChange={(e) => onTaskChange({ ...task, category: e.target.value as RoutineTask['category'] })}
        className="border rounded-md p-2 w-full"
      >
        <option value="medication">Medication</option>
        <option value="exercise">Exercise</option>
        <option value="meal">Meal</option>
        <option value="other">Other</option>
      </select>
    </div>
    <div className="md:col-span-5">
      <textarea
        value={task.description || ''}
        onChange={(e) => onTaskChange({ ...task, description: e.target.value })}
        placeholder="Description (optional)"
        className="border rounded-md p-2 w-full"
        rows={2}
      />
    </div>
    <div>
      <button
        onClick={onSubmit}
        className="bg-rose-600 text-white p-2 rounded-md hover:bg-rose-700 w-full"
      >
        <Plus className="h-5 w-5 inline mr-1" /> Add
      </button>
    </div>
  </div>
);

export default TaskForm;