import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import MemberDashboard from './components/MemberDashboard';

function App() {
  const [token, setToken] = useState('');
  const [role, setRole] = useState('');

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={<Login setToken={setToken} setRole={setRole} />}
        />
        <Route
          path="/admin"
          element={<AdminDashboard token={token} />}
        />
        <Route
          path="/member"
          element={<MemberDashboard token={token} />}
        />
      </Routes>
    </Router>
  );
}

export default App;