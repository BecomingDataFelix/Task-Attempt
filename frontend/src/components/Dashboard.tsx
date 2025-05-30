import { useEffect, useState } from 'react';
import axios from 'axios';

interface Props {
  token: string;
  role: string;
}

function Dashboard({ token, role }: Props) {
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTask, setNewTask] = useState({ title: '', description: '', assignedTo: '', deadline: '' });

  useEffect(() => {
    axios.get('http://localhost:5000/api/tasks', {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => setTasks(res.data));
  }, [token]);

  const createTask = () => {
    axios.post('http://localhost:5000/api/tasks', newTask, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => window.location.reload());
  };

  const updateTaskStatus = (id: string) => {
    axios.put(`http://localhost:5000/api/tasks/${id}`, { status: 'completed' }, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => window.location.reload());
  };

  return (
    <div className="p-4">
      <h1 className="text-xl mb-4">Dashboard ({role})</h1>
      {role === 'admin' && (
        <div className="mb-4">
          <input className="border p-2 mr-2" placeholder="Title" onChange={e => setNewTask(prev => ({ ...prev, title: e.target.value }))} />
          <input className="border p-2 mr-2" placeholder="Desc" onChange={e => setNewTask(prev => ({ ...prev, description: e.target.value }))} />
          <input className="border p-2 mr-2" placeholder="Assigned To" onChange={e => setNewTask(prev => ({ ...prev, assignedTo: e.target.value }))} />
          <input className="border p-2 mr-2" type="date" onChange={e => setNewTask(prev => ({ ...prev, deadline: e.target.value }))} />
          <button className="bg-green-500 text-white p-2" onClick={createTask}>Create Task</button>
        </div>
      )}

      <ul>
        {tasks.map((task, i) => (
          <li key={i} className="border p-2 my-2">
            <p><strong>{task.title.S}</strong> - {task.status.S}</p>
            <p>Assigned to: {task.assignedTo.S}</p>
            <p>Deadline: {task.deadline.S}</p>
            {role === 'member' && task.status.S === 'pending' && (
              <button className="bg-blue-500 text-white p-1 mt-2" onClick={() => updateTaskStatus(task.id.S)}>Mark Complete</button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Dashboard;
