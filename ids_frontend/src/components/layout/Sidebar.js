import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';
import { useWorkspace } from '../../contexts/WorkspaceContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarCollapsed, toggleSidebar, expandSidebar } = useWorkspace();
  
  const menuItems = [
    { icon: 'folder', label: 'Workspaces', path: '/workspaces' },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const handleItemClick = (path) => {
    if (sidebarCollapsed) {
      expandSidebar();
    } else {
      navigate(path);
      toggleSidebar();
    }
  };

  return (
    <aside className={`sidebar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className={`sidebar-item ${isActive(item.path) ? 'sidebar-item-active' : ''}`}
            onClick={() => handleItemClick(item.path)}
          >
            <span className="material-symbols-outlined sidebar-icon">
              {item.icon}
            </span>
            {!sidebarCollapsed && (
              <span className="sidebar-label">{item.label}</span>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;

