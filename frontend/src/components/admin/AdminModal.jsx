import React from 'react';
import { MdClose } from 'react-icons/md';
import '../common/Modal.css';

const AdminModal = ({ isOpen, title, children, onClose, onSubmit, submitText = 'Save', isLoading = false, size = 'medium' }) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className={`modal modal-${size}`}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose} disabled={isLoading}>
            <MdClose />
          </button>
        </div>
        <div className="modal-content">
          {children}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={onSubmit} disabled={isLoading}>
            {isLoading ? 'Loading...' : submitText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminModal;
