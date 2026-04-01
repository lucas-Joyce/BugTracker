import { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import AccountPage from './components/AccountPage';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [currentUser, setCurrentUser] = useState(null);
  const [view, setView] = useState('bugs'); // bugs | account
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState('');

  const isAuthenticated = !!token;

  const handleLogin = (user, newToken) => {
    setCurrentUser(user);
    setToken(newToken);
    localStorage.setItem('authToken', newToken);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setToken(null);
    setBugs([]);
    setView('bugs');
    localStorage.removeItem('authToken');
  };

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch('http://localhost:5000/api/bugs', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        if (res.status === 401) { handleLogout(); return []; }
        return res.json();
      })
      .then(data => { setBugs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token]);

  const handleCreate = (e) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/bugs', {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({ title, priority, status: 'Open' })
    })
      .then(res => res.json())
      .then(newBug => { setBugs([...bugs, newBug]); setTitle(''); setPriority('Medium'); })
      .catch(err => console.error('Error:', err));
  };

  const handleUpdate = (id) => {
    fetch(`http://localhost:5000/api/bugs/${id}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ status: editStatus })
    })
      .then(res => res.json())
      .then(updatedBug => { setBugs(bugs.map(b => b._id === id ? updatedBug : b)); setEditingId(null); })
      .catch(err => console.error('Error:', err));
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this bug?')) return;
    fetch(`http://localhost:5000/api/bugs/${id}`, { method: 'DELETE', headers: authHeaders })
      .then(() => setBugs(bugs.filter(b => b._id !== id)))
      .catch(err => console.error('Error:', err));
  };

  if (!isAuthenticated) return <AuthPage onLogin={handleLogin} />;

  if (view === 'account') {
    return (
      <AccountPage
        token={token}
        currentUser={currentUser}
        onUserUpdate={(updated) => setCurrentUser({ ...currentUser, ...updated })}
        onBack={() => setView('bugs')}
      />
    );
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="App">
      <div className="app-header">
        <h1>Bug Tracker</h1>
        <div className="user-info">
          <span>Welcome, {currentUser?.username || 'User'}</span>
          <button onClick={() => setView('account')} className="account-btn">My Account</button>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      <form onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Bug title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option>Low</option>
          <option>Medium</option>
          <option>High</option>
        </select>
        <button type="submit">Add Bug</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {bugs.map(bug => (
            <tr key={bug._id}>
              <td>{bug.title}</td>
              <td>
                {editingId === bug._id ? (
                  <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)}>
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Closed</option>
                  </select>
                ) : bug.status}
              </td>
              <td>{bug.priority}</td>
              <td>
                {editingId === bug._id ? (
                  <>
                    <button onClick={() => handleUpdate(bug._id)}>Save</button>
                    <button onClick={() => setEditingId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setEditingId(bug._id); setEditStatus(bug.status); }}>Edit</button>
                    <button onClick={() => handleDelete(bug._id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
