import React, { useEffect } from 'react';

export default function AlertModal({ type, onClose }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const config = {
    TLE: {
      title: 'Time Limit Exceeded',
      message: 'Your program exceeded the 10-second time limit.',
      hints: [
        'Check for infinite loops',
        'Optimize your algorithm complexity',
        'Avoid unnecessary I/O operations inside loops',
      ],
    },
    MLE: {
      title: 'Memory Limit Exceeded',
      message: 'Your program exceeded the 256MB memory limit.',
      hints: [
        'Avoid allocating excessively large arrays',
        'Check for memory leaks or unbounded data structures',
        'Use primitive arrays instead of ArrayList where possible',
      ],
    },
  };

  const info = config[type];
  if (!info) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title modal-title-warning">{info.title}</h2>
        <p className="modal-message">{info.message}</p>
        <ul className="modal-hints">
          {info.hints.map((hint, i) => (
            <li key={i}>{hint}</li>
          ))}
        </ul>
        <button className="btn-modal-close" onClick={onClose}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
