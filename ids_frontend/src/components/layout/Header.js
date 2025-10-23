import React from 'react';
import './Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <span className="material-symbols-outlined header-logo-icon">
            lightbulb
          </span>
          <h1 className="header-title">AI Implementation Designer</h1>
        </div>
        <div className="header-right">
          <span className="header-user-icon material-symbols-outlined">
            account_circle
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;

