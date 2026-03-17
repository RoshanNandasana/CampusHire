import React, { useEffect } from 'react';
import './Modal.css';

const Modal = ({ isOpen, title, children, onClose, onConfirm, confirmText = 'Confirm', closeText = 'Close', isDangerous = false }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-content">
          {children}
        </div>

        <div className="modal-footer">
          <button className="btn btn-outlined" onClick={onClose}>
            {closeText}
          </button>
          {onConfirm && (
            <button
              className={`btn ${isDangerous ? 'btn-danger' : 'btn-primary'}`}
              onClick={onConfirm}
            >
              {confirmText}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Modal;
