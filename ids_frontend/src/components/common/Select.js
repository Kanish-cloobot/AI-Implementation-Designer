import React from 'react';
import './Select.css';

const SelectLabel = ({ label, required }) => (
  label && (
    <label className="select-label">
      {label}
      {required && <span className="select-required">*</span>}
    </label>
  )
);

const MultiSelectOption = ({ option, value, disabled, onToggle }) => (
  <div
    className={`select-multi-option ${(value || []).includes(option.value) ? 'selected' : ''}`}
    onClick={() => !disabled && onToggle(option.value)}
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
);

const MultiSelect = ({ label, required, value, options, disabled, error, className, onToggle }) => (
  <div className={`select-wrapper ${className}`}>
    <SelectLabel label={label} required={required} />
    <div className={`select-multi ${error ? 'select-error' : ''}`}>
      {options.map((option) => (
        <MultiSelectOption
          key={option.value}
          option={option}
          value={value}
          disabled={disabled}
          onToggle={onToggle}
        />
      ))}
    </div>
    {error && <span className="select-error-text">{error}</span>}
  </div>
);

const SingleSelect = ({ label, required, name, value, onChange, options, disabled, error, 
  placeholder, className }) => (
  <div className={`select-wrapper ${className}`}>
    <SelectLabel label={label} required={required} />
    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`select-field ${error ? 'select-error' : ''}`}
    >
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
    {error && <span className="select-error-text">{error}</span>}
  </div>
);

const Select = ({ label, value, onChange, options = [], placeholder = 'Select...', 
  disabled = false, error = '', required = false, name = '', multiple = false, 
  className = '' }) => {
  const handleMultiSelectChange = (optionValue) => {
    const currentValues = Array.isArray(value) ? value : [];
    const newValues = currentValues.includes(optionValue)
      ? currentValues.filter(v => v !== optionValue)
      : [...currentValues, optionValue];
    onChange({ target: { name, value: newValues } });
  };

  if (multiple) {
    return <MultiSelect label={label} required={required} value={value} options={options}
      disabled={disabled} error={error} className={className} onToggle={handleMultiSelectChange} />;
  }

  return <SingleSelect label={label} required={required} name={name} value={value}
    onChange={onChange} options={options} disabled={disabled} error={error}
    placeholder={placeholder} className={className} />;
};

export default Select;

