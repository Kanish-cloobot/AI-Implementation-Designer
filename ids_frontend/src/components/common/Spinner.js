import React from 'react';
import './Spinner.css';

const Spinner = ({ size = 'medium', className = '' }) => {
  return (
    <div className={`spinner spinner-${size} ${className}`}>
      <div className="spinner-circle"></div>
    </div>
  );
};

export default Spinner;

