import React from 'react';
import './ConfirmationPopup.css';
import Button from './Button';

const ConfirmationPopup = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  loading = false
}) => {
  if (!isOpen) return null;

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  const handleCancel = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      handleCancel();
    }
  };

  return (
    <div className="confirmation-overlay" onClick={handleOverlayClick}>
      <div className="confirmation-popup">
        <div className="confirmation-header">
          <div className="confirmation-icon">
            <span className="material-symbols-outlined">
              {type === 'danger' ? 'warning' : 
               type === 'info' ? 'info' : 'help'}
            </span>
          </div>
          <h3 className="confirmation-title">{title}</h3>
        </div>
        
        <div className="confirmation-content">
          <p className="confirmation-message">{message}</p>
        </div>
        
        <div className="confirmation-actions">
          <Button
            onClick={handleCancel}
            variant="secondary"
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            variant={type === 'danger' ? 'danger' : 'primary'}
            loading={loading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopup;
