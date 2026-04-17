import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import BugForm from './BugForm';
import '../App.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const ROLE_BADGE = { coder: 'Coder', tester: 'Tester', viewer: 'Viewer' };

const SEVERITY_CLS = {
    Low:      'bug-sev-low',
    Medium:   'bug-sev-medium',
    High:     'bug-sev-high',
    Critical: 'bug-sev-critical'
};

const STATUS_CLS = {
    'Open':        'bug-status-open',
    'In Progress': 'bug-status-progress',
    'Closed':      'bug-status-closed'
};

// ── Detail modal ────────────────────────────────────────────
function BugDetailModal({ bug, onClose, onEdit }) {
    const addedBy = bug.createdBy?.nickname || bug.createdBy?.name || bug.createdBy?.username || '—';
    return (
        <div className="bug-modal-overlay" onClick={onClose}>
            <div className="bug-modal bug-modal--detail" onClick={e => e.stopPropagation()}>
                <div className="bug-modal-header">
                    <h2>{bug.title}</h2>
                    <button className="bug-modal-close" type="button" onClick={onClose}>✕</button>
                </div>
                <div className="bug-modal-body">
                    <div className="bug-detail-badges">
                        <span className={`bug-badge ${SEVERITY_CLS[bug.severity]}`}>{bug.severity}</span>
                        <span className={`bug-badge bug-priority-${bug.priority?.toLowerCase()}`}>{bug.priority}</span>
                        <span className="bug-badge bug-type">{bug.bugType}</span>
                        <span className={`bug-badge ${STATUS_CLS[bug.status]}`}>{bug.status}</span>
                    </div>

                    <div className="bug-detail-meta">
                        <span>Reported by <strong>{addedBy}</strong></span>
                        <span>{new Date(bug.createdAt).toLocaleDateString()}</span>
                        {bug.updatedAt && bug.updatedAt !== bug.createdAt && (
                            <span>Updated {new Date(bug.updatedAt).toLocaleDateString()}</span>
                        )}
                    </div>

                    <div className="bug-detail-section">
                        <h4>Description</h4>
                        <p>{bug.description || '—'}</p>
                    </div>

                    <div className="bug-detail-section">
                        <h4>Steps to Reproduce</h4>
                        <pre>{bug.stepsToReproduce || '—'}</pre>
                    </div>

                    <div className="bug-detail-row">
                        <div className="bug-detail-section">
                            <h4>Actual Result</h4>
                            <p>{bug.actualResult || '—'}</p>
                        </div>
                        <div className="bug-detail-section">
                            <h4>Expected Result</h4>
                            <p>{bug.expectedResult || '—'}</p>
                        </div>
                    </div>

                    <div className="bug-modal-actions">
                        <button type="button" className="bug-modal-btn bug-modal-btn--cancel" onClick={onClose}>
                            Close
                        </button>
                        <button type="button" className="bug-modal-btn bug-modal-btn--submit" onClick={() => { onClose(); onEdit(bug); }}>
                            Edit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Main component ───────────────────────────────────────────
function BugList() {
    const { token, currentUser, logout } = useAuth();

    const [projects, setProjects]               = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [bugs, setBugs]                       = useState([]);
    const [loadingProjects, setLoadingProjects] = useState(false);
    const [loadingBugs, setLoadingBugs]         = useState(false);
    const [error, setError]                     = useState('');

    const [showForm, setShowForm]   = useState(false);
    const [editBug, setEditBug]     = useState(null); // bug object when editing
    const [viewBug, setViewBug]     = useState(null); // bug object when viewing detail

    const authHeaders = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
    };

    // Fetch projects on mount
    useEffect(() => {
        if (!token) return;
        setLoadingProjects(true);
        setError('');

        const isAdmin = ['owner', 'customer'].includes(currentUser?.role);
        const url = isAdmin ? `${API}/api/admin/projects` : `${API}/api/user/projects`;

        fetch(url, { headers: { Authorization: `Bearer ${token}` } })
            .then(res => { if (res.status === 401) { logout(); return null; } return res.json(); })
            .then(data => {
                if (!data) return;
                const list = data.projects || [];
                setProjects(list);
                if (list.length === 1) setSelectedProject(list[0]);
            })
            .catch(() => setError('Failed to load projects.'))
            .finally(() => setLoadingProjects(false));
    }, [token, currentUser?.role, logout]);

    // Fetch bugs when project changes
    useEffect(() => {
        if (!selectedProject) { setBugs([]); return; }
        setLoadingBugs(true);
        setError('');

        fetch(`${API}/api/bugs?project=${selectedProject._id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(res => { if (res.status === 401) { logout(); return null; } return res.json().then(data => ({ ok: res.ok, data })); })
            .then(result => {
                if (!result) return;
                if (!result.ok) { setError(result.data?.message || 'Failed to load bugs.'); return; }
                setBugs(Array.isArray(result.data) ? result.data : []);
            })
            .catch(() => setError('Failed to load bugs.'))
            .finally(() => setLoadingBugs(false));
    }, [selectedProject, token, logout]);

    const handleFormSubmit = async (bugData) => {
        if (editBug) {
            const res  = await fetch(`${API}/api/bugs/${editBug._id}`, {
                method: 'PUT',
                headers: authHeaders,
                body: JSON.stringify(bugData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to update bug.');
            setBugs(prev => prev.map(b => b._id === data._id ? data : b));
            setShowForm(false);
            setEditBug(null);
        } else {
            const res  = await fetch(`${API}/api/bugs`, {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify({ ...bugData, project: selectedProject._id })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to create bug.');
            setBugs(prev => [data, ...prev]);
            setShowForm(false);
        }
    };

    const handleDelete = (id) => {
        if (!window.confirm('Delete this bug?')) return;
        fetch(`${API}/api/bugs/${id}`, { method: 'DELETE', headers: authHeaders })
            .then(() => setBugs(prev => prev.filter(b => b._id !== id)))
            .catch(console.error);
    };

    const openEdit = (bug) => { setEditBug(bug); setShowForm(true); };
    const closeForm = () => { setShowForm(false); setEditBug(null); };

    if (loadingProjects) return <div className="TkBug">Loading projects...</div>;

    return (
        <div className="TkBug">
            <div className="tkbug-header">
                <h2>TkBug</h2>
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
                    {/* Members sidebar */}
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
                        <div className="tkbug-toolbar">
                            <button className="tkbug-add-btn" onClick={() => { setEditBug(null); setShowForm(true); }}>
                                + Report Bug
                            </button>
                        </div>

                        {loadingBugs ? (
                            <p>Loading bugs...</p>
                        ) : bugs.length === 0 ? (
                            <p className="tkbug-empty">No bugs reported yet.</p>
                        ) : (
                            <table className="tkbug-table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Type</th>
                                        <th>Severity</th>
                                        <th>Priority</th>
                                        <th>Status</th>
                                        <th>Added By</th>
                                        <th>Created</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bugs.map(bug => (
                                        <tr key={bug._id}>
                                            <td>{bug.title}</td>
                                            <td><span className="bug-badge bug-type">{bug.bugType || '—'}</span></td>
                                            <td><span className={`bug-badge ${SEVERITY_CLS[bug.severity]}`}>{bug.severity}</span></td>
                                            <td><span className={`bug-badge bug-priority-${bug.priority?.toLowerCase()}`}>{bug.priority}</span></td>
                                            <td><span className={`bug-badge ${STATUS_CLS[bug.status]}`}>{bug.status}</span></td>
                                            <td>{bug.createdBy?.nickname || bug.createdBy?.name || bug.createdBy?.username || '—'}</td>
                                            <td>{new Date(bug.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <button onClick={() => setViewBug(bug)}>View</button>
                                                <button onClick={() => openEdit(bug)}>Edit</button>
                                                <button onClick={() => handleDelete(bug._id)}>Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            )}

            {showForm && (
                <BugForm
                    onClose={closeForm}
                    onSubmit={handleFormSubmit}
                    initialData={editBug}
                />
            )}

            {viewBug && (
                <BugDetailModal
                    bug={viewBug}
                    onClose={() => setViewBug(null)}
                    onEdit={openEdit}
                />
            )}
        </div>
    );
}

export default BugList;
