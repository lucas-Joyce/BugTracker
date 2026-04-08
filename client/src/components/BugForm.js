import { useState } from 'react';

function BugForm({ onSubmit }) {
    const [title, setTitle]       = useState('');
    const [priority, setPriority] = useState('Medium');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({ title, priority, status: 'Open' });
        setTitle('');
        setPriority('Medium');
    };

    return (
        <form onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Bug title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
            />
            <select value={priority} onChange={e => setPriority(e.target.value)}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
            </select>
            <button type="submit">Add Bug</button>
        </form>
    );
}

export default BugForm;
