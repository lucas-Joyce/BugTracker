import { useState, useEffect } from 'react';
import SlotCounter from './SlotCounter';
import TeamTable from './TeamTable';
import ViewerTable from './ViewerTable';
import InviteModal from './InviteModal';
import '../Admin.css';

const API = 'http://localhost:5000';
const PROJECT_CAP = 3;

function ProjectModal({ token, users, project, onClose, onSaved }) {
    const [name, setName] = useState(project?.name || '');
    const [description, setDescription] = useState(project?.description || '');
    const [selectedMembers, setSelectedMembers] = useState(
        project?.members?.map(m => m._id) || []
    );
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const activeUsers = users.filter(u => u.status === 'active');

    const toggleMember = (id) => {
        setSelectedMembers(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            const isEdit = !!project;
            const url = isEdit
                ? `${API}/api/admin/projects/${project._id}`
                : `${API}/api/admin/projects`;
            const res = await fetch(url, {
                method: isEdit ? 'PATCH' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ name, description, members: selectedMembers })
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message); return; }
            onSaved(data.project, isEdit);
        } catch {
            setError('Connection error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{project ? 'Edit Project' : 'New Project'}</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>
                <form className="modal-body" onSubmit={handleSubmit}>
                    {error && <div className="modal-error">{error}</div>}
                    <div className="modal-field">
                        <label>Project Name</label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            placeholder="e.g. Customer Portal v2"
                        />
                    </div>
                    <div className="modal-field">
                        <label>Description <span className="optional">(optional)</span></label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            placeholder="Brief description of the project..."
                        />
                    </div>
                    <div className="modal-field">
                        <label>Deploy Team Members</label>
                        {activeUsers.length === 0 ? (
                            <span className="field-hint">No active team members yet — invite some first.</span>
                        ) : (
                            <div className="member-checklist">
                                {activeUsers.map(u => (
                                    <label key={u._id} className="member-check-row">
                                        <input
                                            type="checkbox"
                                            checked={selectedMembers.includes(u._id)}
                                            onChange={() => toggleMember(u._id)}
                                        />
                                        <span className="member-check-name">{u.name || u.username}</span>
                                        <span className={`role-badge ${u.jobRole}`}>{u.jobRole}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="modal-btn-cancel" onClick={onClose}>Cancel</button>
                        <button type="submit" className="modal-btn-submit" disabled={saving}>
                            {saving ? 'Saving...' : project ? 'Save Changes' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function AdminDashboard({ token, onBack }) {
    const [activeTab, setActiveTab] = useState('users');

    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({
        coders:  { used: 0, max: 5 },
        testers: { used: 0, max: 5 },
        viewers: { used: 0, max: 10 }
    });
    const [projects, setProjects] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [inviteModal, setInviteModal] = useState(null);
    const [projectModal, setProjectModal] = useState(null); // null | { mode: 'create' } | { mode: 'edit', project }

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${API}/api/admin/users`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to load users');
            const data = await res.json();
            setUsers(data.users);
            setStats(data.stats);
        } catch (err) {
            setError(err.message);
        }
    };

    const fetchProjects = async () => {
        try {
            const res = await fetch(`${API}/api/admin/projects`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) return;
            const data = await res.json();
            setProjects(data.projects);
        } catch {}
    };

    useEffect(() => {
        Promise.all([fetchUsers(), fetchProjects()]).finally(() => setLoading(false));
    }, [token]);

    const handleAction = async (userId, status) => {
        setActionLoading(userId);
        setError('');
        try {
            const res = await fetch(`${API}/api/admin/users/${userId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message); return; }
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, ...data.user } : u));
            fetchUsers();
        } catch {
            setError('Connection error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleProjectSaved = (project, isEdit) => {
        setProjects(prev =>
            isEdit ? prev.map(p => p._id === project._id ? project : p) : [...prev, project]
        );
        setProjectModal(null);
    };

    const handleDeleteProject = async (projectId) => {
        if (!window.confirm('Delete this project?')) return;
        setError('');
        try {
            const res = await fetch(`${API}/api/admin/projects/${projectId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) { const d = await res.json(); setError(d.message); return; }
            setProjects(prev => prev.filter(p => p._id !== projectId));
        } catch {
            setError('Connection error');
        }
    };

    const teamUsers   = users.filter(u => u.role === 'user' && ['coder', 'tester'].includes(u.jobRole));
    const viewerUsers = users.filter(u => u.role === 'user' && u.jobRole === 'viewer');

    const codersFull   = stats.coders.used >= stats.coders.max;
    const testersFull  = stats.testers.used >= stats.testers.max;
    const teamFull     = codersFull && testersFull;
    const viewersFull  = stats.viewers.used >= stats.viewers.max;
    const projectsFull = projects.length >= PROJECT_CAP;

    return (
        <div className="admin-page">
            <div className="admin-header">
                <button className="back-btn" onClick={onBack}>← Back</button>
                <h1>Admin Dashboard</h1>
            </div>

            {error && <div className="admin-error">{error}</div>}

            {/* Tab bar */}
            <div className="admin-tabs">
                <button
                    className={`admin-tab${activeTab === 'users' ? ' admin-tab--active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    User Management
                </button>
                <button
                    className={`admin-tab${activeTab === 'projects' ? ' admin-tab--active' : ''}`}
                    onClick={() => setActiveTab('projects')}
                >
                    Project Management
                </button>
            </div>

            {/* ── User Management ── */}
            {activeTab === 'users' && (
                <>
                    <div className="slot-counters">
                        <SlotCounter used={stats.coders.used}  max={stats.coders.max}  label="Coders" />
                        <SlotCounter used={stats.testers.used} max={stats.testers.max} label="Testers" />
                        <SlotCounter used={stats.viewers.used} max={stats.viewers.max} label="Viewers" />
                        <SlotCounter used={projects.length}    max={PROJECT_CAP}        label="Projects" />
                    </div>

                    <div className="invite-actions">
                        <button
                            className="invite-btn"
                            disabled={teamFull}
                            title={teamFull ? 'Coder and tester limits reached' : 'Invite a coder or tester'}
                            onClick={() => setInviteModal('team')}
                        >
                            + Invite Team Member
                        </button>
                        <button
                            className="invite-btn"
                            disabled={viewersFull}
                            title={viewersFull ? 'Viewer limit reached (10/10)' : 'Invite a viewer'}
                            onClick={() => setInviteModal('viewer')}
                        >
                            + Invite Viewer
                        </button>
                    </div>

                    {inviteModal && (
                        <InviteModal
                            token={token}
                            type={inviteModal}
                            onClose={() => setInviteModal(null)}
                            onSuccess={fetchUsers}
                        />
                    )}

                    {loading ? (
                        <p className="admin-loading">Loading users...</p>
                    ) : (
                        <>
                            <div className="admin-section">
                                <h2>Team <span className="section-count">({teamUsers.length})</span></h2>
                                <TeamTable users={teamUsers} onAction={handleAction} actionLoading={actionLoading} />
                            </div>
                            <div className="admin-section">
                                <h2>Viewers <span className="section-count">({viewerUsers.length})</span></h2>
                                <ViewerTable users={viewerUsers} onAction={handleAction} actionLoading={actionLoading} />
                            </div>
                        </>
                    )}
                </>
            )}

            {/* ── Project Management ── */}
            {activeTab === 'projects' && (
                <div className="projects-tab">
                    <div className="projects-tab-header">
                        <span className="projects-tab-count">{projects.length}/{PROJECT_CAP} projects used</span>
                        <button
                            className="invite-btn"
                            disabled={projectsFull}
                            title={projectsFull ? 'Project limit reached (3/3)' : 'Create a new project'}
                            onClick={() => setProjectModal({ mode: 'create' })}
                        >
                            + Add New Project
                        </button>
                    </div>

                    {loading ? (
                        <p className="admin-loading">Loading projects...</p>
                    ) : projects.length === 0 ? (
                        <div className="projects-empty">
                            <p>No projects yet.</p>
                            <p className="projects-empty-hint">Create a project to organise bug tracking and assign your team members.</p>
                        </div>
                    ) : (
                        <div className="project-cards">
                            {projects.map(project => (
                                <div key={project._id} className="project-card">
                                    <div className="project-card-header">
                                        <h3 className="project-card-name">{project.name}</h3>
                                        <div className="action-cell">
                                            <button
                                                className="action-btn remind-btn"
                                                onClick={() => setProjectModal({ mode: 'edit', project })}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="action-btn revoke-btn"
                                                onClick={() => handleDeleteProject(project._id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>

                                    {project.description && (
                                        <p className="project-card-desc">{project.description}</p>
                                    )}

                                    <div className="project-card-members">
                                        <span className="project-members-label">Deployed</span>
                                        {project.members.length === 0 ? (
                                            <span className="project-no-members">No members assigned</span>
                                        ) : (
                                            <div className="project-member-tags">
                                                {project.members.map(m => (
                                                    <span key={m._id} className="project-member-tag">
                                                        {m.name || m.username}
                                                        <span className={`role-badge ${m.jobRole}`}>{m.jobRole}</span>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="project-card-meta">
                                        Created {new Date(project.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {projectModal && (
                <ProjectModal
                    token={token}
                    users={users.filter(u => u.role === 'user')}
                    project={projectModal.mode === 'edit' ? projectModal.project : null}
                    onClose={() => setProjectModal(null)}
                    onSaved={handleProjectSaved}
                />
            )}
        </div>
    );
}

export default AdminDashboard;
