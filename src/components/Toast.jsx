import React from 'react';

function Toast({ show, message, type, onClose }) {
  if (!show) return null;

  return (
    <div className="toast-container show">
      <div className="toast-backdrop" onClick={onClose}></div>
      <div className={`toast-overlay ${type === 'danger' ? 'danger' : ''}`}>
        <div dangerouslySetInnerHTML={{ __html: message }} />
        <button className="toast-close" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  );
}

export default Toast;
