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

  // Create 
  const handleCreate = (e) => {

      e.preventDefault();

      fetch('http://localhost:5000/api/bugs', {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify({
            title,
            priority,
            status: 'Open'})
          })
          .then(res => res.json())
          .then(newBug => {
              setBugs([...bugs, newBug]);
              setTitle('');
              setPriority('Medium');
            })
          .catch(err => console.error('Error:', err));
  };

  // UPDATE
  const handleUpdate = (id) => {

    fetch(`http://localhost:5000/api/bugs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        status: editStatus })
    })
      .then(res => res.json())
      .then(updatedBug => {
        setBugs(bugs.map(bug => bug._id === id ? updatedBug : bug));
        setEditingId(null);
      })
      .catch(err => console.error('Error:', err));
  };

   // DELETE
  const handleDelete = (id) => {
    if (!window.confirm('Delete this bug?')) return;
    
    fetch(`http://localhost:5000/api/bugs/${id}`, {
      method: 'DELETE'
    })
      .then(() => {
        setBugs(bugs.filter(bug => bug._id !== id));
      })
      .catch(err => console.error('Error:', err));
  };


  if (loading) return <div>Loading...</div>;

  return (
    <div className="App">
      <h1>Bug Tracker</h1>

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
                  <select 
                    value={editStatus} 
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    <option>Open</option>
                    <option>In Progress</option>
                    <option>Closed</option>
                  </select>
                ) : (
                  bug.status
                )}
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
                    <button onClick={() => {
                      setEditingId(bug._id);
                      setEditStatus(bug.status);
                    }}>Edit</button>
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

//       <table>
//         <thead>
//           <tr>
//             <th>ID</th>
//             <th>Title</th>
//             <th>Status</th>
//             <th>Priority</th>
//           </tr>
//         </thead>
//         <tbody>
//           {bugs.map(bug => (
//             <tr key={bug.id}>
//               <td>{bug.id}</td>
//               <td>{bug.title}</td>
//               <td>{bug.status}</td>
//               <td>{bug.priority}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// export default App;