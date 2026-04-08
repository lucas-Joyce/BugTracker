import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import BugForm from './BugForm';
import '../App.css';

const API = 'http://localhost:5000';

function BugList() {
    const { token, logout } = useAuth();
    const [bugs, setBugs]           = useState([]);
    const [loading, setLoading]     = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editStatus, setEditStatus] = useState('');

    const authHeaders = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    };

    useEffect(() => {
        if (!token) return;
        setLoading(true);
        fetch(`${API}/api/bugs`, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => {
                if (res.status === 401) { logout(); return null; }
                return res.json();
            })
            .then(data => { if (data) setBugs(data); })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [token, logout]);

    const handleCreate = (bugData) => {
        fetch(`${API}/api/bugs`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify(bugData)
        })
            .then(res => res.json())
            .then(newBug => setBugs(prev => [...prev, newBug]))
            .catch(console.error);
    };

    const handleUpdate = (id) => {
        fetch(`${API}/api/bugs/${id}`, {
            method: 'PUT',
            headers: authHeaders,
            body: JSON.stringify({ status: editStatus })
        })
            .then(res => res.json())
            .then(updated => {
                setBugs(prev => prev.map(b => b._id === id ? updated : b));
                setEditingId(null);
            })
            .catch(console.error);
    };

    const handleDelete = (id) => {
        if (!window.confirm('Delete this bug?')) return;
        fetch(`${API}/api/bugs/${id}`, { method: 'DELETE', headers: authHeaders })
            .then(() => setBugs(prev => prev.filter(b => b._id !== id)))
            .catch(console.error);
    };

    if (loading) return <div className="App">Loading bugs...</div>;

    return (
        <div className="App">
            <BugForm onSubmit={handleCreate} />
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
                                    <select value={editStatus} onChange={e => setEditStatus(e.target.value)}>
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

export default BugList;
