import React from 'react';
import { Trash2, Edit3, Save, X } from 'lucide-react';
import { RoutineTask } from '../../types';

interface TaskListProps {
  tasks: RoutineTask[];
  onRemove: (id: string) => void;
  onEdit?: (task: RoutineTask) => void;
}

const TaskList = ({ tasks, onRemove, onEdit }: TaskListProps) => (
  <div className="space-y-3">
    {tasks.sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)).map(task => (
      <div key={task.id} className="p-3 border rounded-lg">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <span className="font-medium">{task.date} {task.time}</span>
            <span className="font-semibold">{task.title}</span>
            <span className="text-sm px-2 py-1 bg-gray-100 rounded-full">{task.category}</span>
          </div>
          <div className="flex items-center gap-2">
            {onEdit && (
              <button onClick={() => onEdit(task)} className="text-gray-500 hover:text-gray-700"><Edit3 className="h-4 w-4" /></button>
            )}
            <button
              onClick={() => onRemove(task.id)}
              className="text-gray-400 hover:text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        {task.description && <p className="text-gray-600">{task.description}</p>}
      </div>
    ))}
  </div>
);

export default TaskList;