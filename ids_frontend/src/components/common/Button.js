import React from 'react';
import './Button.css';
import Spinner from './Spinner';

const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon = null,
  type = 'button',
  className = ''
}) => {
  const buttonClass = `btn btn-${variant} btn-${size} ${className} ${disabled || loading ? 'btn-disabled' : ''}`;

  return (
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <Spinner size="small" />
      ) : (
        <>
          {icon && <span className="material-symbols-outlined btn-icon">{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;

