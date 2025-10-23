import React from 'react';
import './Sidebar.css';
import { useWorkspace } from '../../contexts/WorkspaceContext';

const Sidebar = ({ onNavigate }) => {
  const { sidebarCollapsed, toggleSidebar, expandSidebar } = useWorkspace();
  
  const menuItems = [
    { icon: 'folder', label: 'Workspaces', active: true },
    // { icon: 'description', label: 'Documents', active: false },
    // { icon: 'settings', label: 'Settings', active: false }
  ];

  const handleSidebarClick = () => {
    if (sidebarCollapsed) {
      expandSidebar();
    } else {
      // When clicking on workspace item, navigate to workspace list
      if (onNavigate) {
        onNavigate();
      }
      toggleSidebar();
    }
  };

  return (
    <aside className={`sidebar ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <nav className="sidebar-nav">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className={`sidebar-item ${item.active ? 'sidebar-item-active' : ''}`}
            onClick={handleSidebarClick}
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

