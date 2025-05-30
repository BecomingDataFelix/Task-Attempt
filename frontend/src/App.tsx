import { useState } from 'react';
import Login from './components/Login';

function App() {
  const [token, setToken] = useState('');
  const [role, setRole] = useState('');

  if (!token) return <Login setToken={setToken} setRole={setRole} />;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Welcome, {role}</h1>
      {role === 'admin' ? (
        <p>Admin Dashboard goes here</p>
      ) : (
        <p>Team Member Dashboard goes here</p>
      )}
    </div>
  );
}

export default App;