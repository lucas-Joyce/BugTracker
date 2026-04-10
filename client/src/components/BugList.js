import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import BugForm from './BugForm';
import '../App.css';

const API = 'http://localhost:5000';

const ROLE_BADGE = { coder: 'Coder', tester: 'Tester', viewer: 'Viewer' };

function BugList() {
    const { token, currentUser, logout } = useAuth();

    const [projects, setProjects]           = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [bugs, setBugs]                   = useState([]);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [loadingBugs, setLoadingBugs]     = useState(false);
    const [editingId, setEditingId]         = useState(null);
    const [editStatus, setEditStatus]       = useState('');
    const [error, setError]                 = useState('');

    const authHeaders = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    };

    // Fetch projects on mount — endpoint differs by role
    useEffect(() => {
        if (!token) return;
        setLoadingProjects(true);
        setError('');

        const isAdmin = ['owner', 'customer'].includes(currentUser?.role);
        const url = isAdmin
            ? `${API}/api/admin/projects`
            : `${API}/api/user/projects`;

        fetch(url, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => {
                if (res.status === 401) { logout(); return null; }
                return res.json();
            })
            .then(data => {
                if (!data) return;
                const list = data.projects || [];
                setProjects(list);
                if (list.length === 1) setSelectedProject(list[0]);
            })
            .catch(() => setError('Failed to load projects.'))
            .finally(() => setLoadingProjects(false));
    }, [token, currentUser?.role, logout]);

    // Fetch bugs whenever selected project changes
    useEffect(() => {
        if (!selectedProject) { setBugs([]); return; }
        setLoadingBugs(true);
        setError('');

        fetch(`${API}/api/bugs?project=${selectedProject._id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => {
                if (res.status === 401) { logout(); return null; }
                return res.json().then(data => ({ ok: res.ok, data }));
            })
            .then(result => {
                if (!result) return;
                if (!result.ok) { setError(result.data?.message || 'Failed to load bugs.'); return; }
                setBugs(Array.isArray(result.data) ? result.data : []);
            })
            .catch(() => setError('Failed to load bugs.'))
            .finally(() => setLoadingBugs(false));
    }, [selectedProject, token, logout]);

    const handleCreate = (bugData) => {
        if (!selectedProject) return;
        fetch(`${API}/api/bugs`, {
            method: 'POST',
            headers: authHeaders,
            body: JSON.stringify({ ...bugData, project: selectedProject._id })
        })
            .then(res => res.json())
            .then(newBug => setBugs(prev => [newBug, ...prev]))
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

    if (loadingProjects) return <div className="TkBug">Loading projects...</div>;

    return (
        <div className="TkBug">
            <div className="tkbug-header">
                <h2>TkBug</h2>

                {/* Project selector */}
                {projects.length === 0 ? (
                    <p className="tkbug-no-projects">No projects assigned. Ask your admin to add you to a project.</p>
                ) : (
                    <div className="tkbug-project-tabs">
                        {projects.map(p => (
                            <button
                                key={p._id}
                                className={`tkbug-tab${selectedProject?._id === p._id ? ' active' : ''}`}
                                onClick={() => setSelectedProject(p)}
                            >
                                {p.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {error && <div className="tkbug-error">{error}</div>}

            {selectedProject && (
                <div className="tkbug-body">
                    {/* Members panel */}
                    <aside className="tkbug-members">
                        <h4>Team</h4>
                        {selectedProject.members?.length === 0 && (
                            <p className="tkbug-empty">No members deployed.</p>
                        )}
                        {selectedProject.members?.map(m => (
                            <div key={m._id} className="tkbug-member">
                                <span className="tkbug-member-name">{m.name || m.username}</span>
                                <span className={`tkbug-member-badge tkbug-badge-${m.jobRole}`}>
                                    {ROLE_BADGE[m.jobRole] || m.jobRole}
                                </span>
                            </div>
                        ))}
                    </aside>

                    {/* Bug section */}
                    <div className="tkbug-main">
                        <BugForm onSubmit={handleCreate} />

                        {loadingBugs ? (
                            <p>Loading bugs...</p>
                        ) : bugs.length === 0 ? (
                            <p className="tkbug-empty">No bugs reported yet.</p>
                        ) : (
                            <table className="tkbug-table">
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
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default BugList;
