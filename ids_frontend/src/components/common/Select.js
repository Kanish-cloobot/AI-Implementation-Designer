import React from 'react';
import './Select.css';

const Select = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  disabled = false,
  error = '',
  required = false,
  name = '',
  multiple = false,
  className = ''
}) => {
  const handleMultiSelectChange = (optionValue) => {
    const currentValues = Array.isArray(value) ? value : [];
    const newValues = currentValues.includes(optionValue)
      ? currentValues.filter(v => v !== optionValue)
      : [...currentValues, optionValue];
    onChange({ target: { name, value: newValues } });
  };

  if (multiple) {
    return (
      <div className={`select-wrapper ${className}`}>
        {label && (
          <label className="select-label">
            {label}
            {required && <span className="select-required">*</span>}
          </label>
        )}
        <div className={`select-multi ${error ? 'select-error' : ''}`}>
          {options.map((option) => (
            <div
              key={option.value}
              className={`select-multi-option ${
                (value || []).includes(option.value) ? 'selected' : ''
              }`}
              onClick={() => !disabled && handleMultiSelectChange(option.value)}
            >
              <input
                type="checkbox"
                checked={(value || []).includes(option.value)}
                onChange={() => {}}
                disabled={disabled}
                className="select-multi-checkbox"
              />
              <span className="select-multi-label">{option.label}</span>
            </div>
          ))}
        </div>
        {error && <span className="select-error-text">{error}</span>}
      </div>
    );
  }

  return (
    <div className={`select-wrapper ${className}`}>
      {label && (
        <label className="select-label">
          {label}
          {required && <span className="select-required">*</span>}
        </label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`select-field ${error ? 'select-error' : ''}`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="select-error-text">{error}</span>}
    </div>
  );
};

export default Select;

