import React from 'react';
import './Card.css';

const Card = ({ children, className, title, icon, onClick }) => {
  return (
    <div className={`card ${className || ''}`} onClick={onClick}>
      {(title || icon) && (
        <div className="card-header">
          {icon && <span className="card-icon">{icon}</span>}
          {title && <h3 className="card-title">{title}</h3>}
        </div>
      )}
      <div className="card-content">
        {children}
      </div>
    </div>
  );
};

export default Card;
