import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import './Sidebar.css';
import { useWorkspace } from '../../contexts/WorkspaceContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { workspaceId } = useParams();
  const { sidebarCollapsed, toggleSidebar, expandSidebar } = useWorkspace();
  
  // Check if we're in a workspace or on workspace list page
  const isInWorkspace = workspaceId && location.pathname.includes('/workspace/');
  
  console.log('Sidebar Debug:', { workspaceId, pathname: location.pathname, isInWorkspace });
  
  const menuItems = isInWorkspace ? [
    { icon: 'dashboard', label: 'Dashboard', path: `/workspace/${workspaceId}/dashboard` },
    { icon: 'description', label: 'SOW', path: `/workspace/${workspaceId}/sow` },
    { icon: 'event', label: 'Meetings', path: `/workspace/${workspaceId}/meetings` },
    { icon: 'assignment', label: 'BRD', path: `/workspace/${workspaceId}/brd` },
  ] : [
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

  console.log('Sidebar rendering with menuItems:', menuItems);
  
  return (
    <aside className={`sidebar ${sidebarCollapsed ? 'sidebar-collapsed' : ''} ${!isInWorkspace ? 'sidebar-workspace-list' : ''}`}>
      {isInWorkspace && (
        <div className="sidebar-header">
          <div 
            className="sidebar-back-button"
            onClick={() => navigate('/workspaces')}
          >
            <span className="material-symbols-outlined sidebar-back-icon">arrow_back</span>
            {!sidebarCollapsed && (
              <span className="sidebar-back-label">Back to Workspaces</span>
            )}
          </div>
        </div>
      )}
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

