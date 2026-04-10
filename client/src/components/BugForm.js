import { useState } from 'react';

function BugForm({ onClose, onSubmit, initialData }) {
    const isEdit = !!initialData;

    const [title,            setTitle]            = useState(initialData?.title            || '');
    const [description,      setDescription]      = useState(initialData?.description      || '');
    const [severity,         setSeverity]         = useState(initialData?.severity         || 'Medium');
    const [priority,         setPriority]         = useState(initialData?.priority         || 'Medium');
    const [bugType,          setBugType]          = useState(initialData?.bugType          || 'Other');
    const [stepsToReproduce, setStepsToReproduce] = useState(initialData?.stepsToReproduce || '');
    const [actualResult,     setActualResult]     = useState(initialData?.actualResult     || '');
    const [expectedResult,   setExpectedResult]   = useState(initialData?.expectedResult   || '');
    const [error,            setError]            = useState('');
    const [loading,          setLoading]          = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !description.trim() || !stepsToReproduce.trim() ||
            !actualResult.trim() || !expectedResult.trim()) {
            setError('All required fields must be filled.');
            return;
        }
        setError('');
        setLoading(true);
        try {
            await onSubmit({
                title: title.trim(),
                description: description.trim(),
                severity,
                priority,
                bugType,
                stepsToReproduce: stepsToReproduce.trim(),
                actualResult:     actualResult.trim(),
                expectedResult:   expectedResult.trim(),
                status: initialData?.status || 'Open'
            });
        } catch (err) {
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bug-modal-overlay" onClick={onClose}>
            <div className="bug-modal" onClick={e => e.stopPropagation()}>
                <div className="bug-modal-header">
                    <h2>{isEdit ? 'Edit Bug' : 'Report a Bug'}</h2>
                    <button className="bug-modal-close" type="button" onClick={onClose}>✕</button>
                </div>

                <form className="bug-modal-body" onSubmit={handleSubmit}>
                    {error && <div className="bug-modal-error">{error}</div>}

                    <div className="bug-modal-field">
                        <label>Title <span className="bug-required">*</span></label>
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Short summary of the bug"
                            required
                        />
                    </div>

                    <div className="bug-modal-field">
                        <label>Description <span className="bug-required">*</span></label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={3}
                            placeholder="Describe the bug in detail"
                            required
                        />
                    </div>

                    <div className="bug-modal-row">
                        <div className="bug-modal-field">
                            <label>Severity <span className="bug-required">*</span></label>
                            <select value={severity} onChange={e => setSeverity(e.target.value)}>
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                                <option>Critical</option>
                            </select>
                        </div>
                        <div className="bug-modal-field">
                            <label>Priority <span className="bug-required">*</span></label>
                            <select value={priority} onChange={e => setPriority(e.target.value)}>
                                <option>Low</option>
                                <option>Medium</option>
                                <option>High</option>
                            </select>
                        </div>
                        <div className="bug-modal-field">
                            <label>Type</label>
                            <select value={bugType} onChange={e => setBugType(e.target.value)}>
                                <option>UI</option>
                                <option>Functionality</option>
                                <option>Performance</option>
                                <option>Security</option>
                                <option>Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="bug-modal-field">
                        <label>Steps to Reproduce <span className="bug-required">*</span></label>
                        <textarea
                            value={stepsToReproduce}
                            onChange={e => setStepsToReproduce(e.target.value)}
                            rows={4}
                            placeholder={"1. Go to...\n2. Click on...\n3. See error"}
                            required
                        />
                    </div>

                    <div className="bug-modal-field">
                        <label>Actual Result <span className="bug-required">*</span></label>
                        <textarea
                            value={actualResult}
                            onChange={e => setActualResult(e.target.value)}
                            rows={2}
                            placeholder="What actually happened?"
                            required
                        />
                    </div>

                    <div className="bug-modal-field">
                        <label>Expected Result <span className="bug-required">*</span></label>
                        <textarea
                            value={expectedResult}
                            onChange={e => setExpectedResult(e.target.value)}
                            rows={2}
                            placeholder="What should have happened?"
                            required
                        />
                    </div>

                    <div className="bug-modal-actions">
                        <button type="button" className="bug-modal-btn bug-modal-btn--cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="bug-modal-btn bug-modal-btn--submit" disabled={loading}>
                            {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Submit Bug'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default BugForm;
