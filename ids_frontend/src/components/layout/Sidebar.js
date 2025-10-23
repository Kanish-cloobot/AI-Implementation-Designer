import React from 'react';
import './Sidebar.css';

const Sidebar = () => {
  const menuItems = [
    { icon: 'folder', label: 'Workspaces', active: true },
    { icon: 'description', label: 'Documents', active: false },
    { icon: 'settings', label: 'Settings', active: false }
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className={`sidebar-item ${item.active ? 'sidebar-item-active' : ''}`}
          >
            <span className="material-symbols-outlined sidebar-icon">
              {item.icon}
            </span>
            <span className="sidebar-label">{item.label}</span>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;

