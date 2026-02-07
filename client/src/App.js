import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState('');

  useEffect(() => {

    fetchBugs();

  }, []);

  const fetchBugs = () => {
    fetch('http://localhost:5000/api/bugs')
      .then(res => res.json())
      .then(data => {
        setBugs(data);
        setLoading(false);
      })
      .catch(err => console.error('Error:', err));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="App">
      <h1>Bug Tracker</h1>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Status</th>
            <th>Priority</th>
          </tr>
        </thead>
        <tbody>
          {bugs.map(bug => (
            <tr key={bug.id}>
              <td>{bug.id}</td>
              <td>{bug.title}</td>
              <td>{bug.status}</td>
              <td>{bug.priority}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;