import React, { useEffect, useState } from 'react';

interface Props {
  token: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  status: string;
  deadline: string;
}

function AdminDashboard({ token }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    deadline: '',
  });

  const fetchTasks = async () => {
    try {
      const response = await fetch('http://localhost:3001/tasks', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const handleCreateTask = async () => {
    try {
      const response = await fetch('http://localhost:3001/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setFormData({ title: '', description: '', assignedTo: '', deadline: '' });
        fetchTasks();
      } else {
        console.error('Failed to create task');
      }
    } catch (err) {
      console.error('Error creating task:', err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTasks();
    }
  }, [token]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Admin Dashboard</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Create New Task</h2>
        <input
          className="border p-2 mr-2"
          placeholder="Title"
          value={formData.title}
          onChange={e => setFormData({ ...formData, title: e.target.value })}
        />
        <input
          className="border p-2 mr-2"
          placeholder="Description"
          value={formData.description}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
        />
        <input
          className="border p-2 mr-2"
          placeholder="Assign To"
          value={formData.assignedTo}
          onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
        />
        <input
          className="border p-2 mr-2"
          type="date"
          value={formData.deadline}
          onChange={e => setFormData({ ...formData, deadline: e.target.value })}
        />
        <button className="bg-blue-500 text-white px-4 py-2" onClick={handleCreateTask}>
          Create Task
        </button>
      </div>

      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Title</th>
            <th className="py-2 px-4 border-b">Description</th>
            <th className="py-2 px-4 border-b">Assigned To</th>
            <th className="py-2 px-4 border-b">Status</th>
            <th className="py-2 px-4 border-b">Deadline</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map(task => (
            <tr key={task.id}>
              <td className="py-2 px-4 border-b">{task.title}</td>
              <td className="py-2 px-4 border-b">{task.description}</td>
              <td className="py-2 px-4 border-b">{task.assignedTo}</td>
              <td className="py-2 px-4 border-b">{task.status}</td>
              <td className="py-2 px-4 border-b">{new Date(task.deadline).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;