function SlotCounter({ used, max, label }) {
    const remaining = max - used;
    const isFull = used >= max;
    const isWarning = !isFull && remaining <= 1;

    let className = 'slot-counter';
    if (isFull) className += ' full';
    else if (isWarning) className += ' warning';

    return (
        <div className={className}>
            <span className="slot-label">{label}</span>
            <span className="slot-count">{used}/{max} slots used</span>
            {isFull
                ? <span className="slot-badge red">Full</span>
                : <span className="slot-badge">{remaining} remaining</span>
            }
        </div>
    );
}

export default SlotCounter;
