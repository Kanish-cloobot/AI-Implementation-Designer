import React from 'react';
import './Input.css';

const Input = ({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  disabled = false,
  error = '',
  required = false,
  name = '',
  className = ''
}) => {
  return (
    <div className={`input-wrapper ${className}`}>
      {label && (
        <label className="input-label">
          {label}
          {required && <span className="input-required">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`input-field ${error ? 'input-error' : ''}`}
      />
      {error && <span className="input-error-text">{error}</span>}
    </div>
  );
};

export default Input;

