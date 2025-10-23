import React, { useEffect, useState } from 'react';
import './Snackbar.css';

const Snackbar = ({ 
  open, 
  message, 
  type = 'info', 
  duration = 4000, 
  onClose,
  action,
  actionLabel 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (open) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [open, duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // Wait for animation to complete
  };

  const handleAction = () => {
    if (action) {
      action();
    }
    handleClose();
  };

  if (!open && !isVisible) return null;

  return (
    <div className={`snackbar ${isVisible ? 'snackbar-visible' : ''} snackbar-${type}`}>
      <div className="snackbar-content">
        <div className="snackbar-message">
          <span className="material-symbols-outlined snackbar-icon">
            {type === 'success' ? 'check_circle' : 
             type === 'error' ? 'error' : 
             type === 'warning' ? 'warning' : 'info'}
          </span>
          <span className="snackbar-text">{message}</span>
        </div>
        <div className="snackbar-actions">
          {action && actionLabel && (
            <button 
              className="snackbar-action-button"
              onClick={handleAction}
            >
              {actionLabel}
            </button>
          )}
          <button 
            className="snackbar-close-button"
            onClick={handleClose}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Snackbar;
