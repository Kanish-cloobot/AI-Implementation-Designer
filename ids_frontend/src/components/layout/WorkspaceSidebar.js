import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import './WorkspaceSidebar.css';
import { useWorkspace } from '../../contexts/WorkspaceContext';

const WorkspaceSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { workspaceId } = useParams();
  const { sidebarCollapsed, toggleSidebar, expandSidebar, currentWorkspace } = useWorkspace();
  
  const workspaceMenuItems = [
    { icon: 'dashboard', label: 'Dashboard', path: `/workspace/${workspaceId}/dashboard` },
    { icon: 'event', label: 'Meetings', path: `/workspace/${workspaceId}/meetings` },
    { icon: 'visibility', label: 'SOW', path: `/workspace/${workspaceId}/view` },
    { icon: 'description', label: 'BRD', path: `/workspace/${workspaceId}/brd` },
    // { icon: 'assignment', label: 'RAID', path: `/workspace/${workspaceId}/raid` },
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

  const handleBackToWorkspaces = () => {
    navigate('/workspaces');
  };

  return (
    <aside className={`workspace-sidebar ${sidebarCollapsed ? 'workspace-sidebar-collapsed' : ''}`}>
      <div className="workspace-sidebar-header">
        <button 
          className="workspace-sidebar-back-btn"
          onClick={handleBackToWorkspaces}
          title="Back to Workspaces"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          {!sidebarCollapsed && <span>Back</span>}
        </button>
      </div>
      
      {currentWorkspace && (
        <div className="workspace-sidebar-info">
          <div className="workspace-sidebar-workspace-name">
            <span className="material-symbols-outlined">folder</span>
            {!sidebarCollapsed && (
              <span className="workspace-name">{currentWorkspace.name}</span>
            )}
          </div>
          {!sidebarCollapsed && (
            <div className="workspace-sidebar-details">
              <div className="workspace-detail-item">
                <span className="detail-label">Type:</span>
                <span className="detail-value">{currentWorkspace.project_type || 'N/A'}</span>
              </div>
              <div className="workspace-detail-item">
                <span className="detail-label">Status:</span>
                <span className={`detail-value status-${currentWorkspace.status?.toLowerCase() || 'active'}`}>
                  {currentWorkspace.status || 'Active'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      <nav className="workspace-sidebar-nav">
        <div className="workspace-sidebar-section">
          <h3 className="workspace-sidebar-section-title">
            {!sidebarCollapsed && 'Navigation'}
          </h3>
          {workspaceMenuItems.map((item, index) => (
            <div
              key={index}
              className={`workspace-sidebar-item ${isActive(item.path) ? 'workspace-sidebar-item-active' : ''}`}
              onClick={() => handleItemClick(item.path)}
            >
              <span className="material-symbols-outlined workspace-sidebar-icon">
                {item.icon}
              </span>
              {!sidebarCollapsed && (
                <span className="workspace-sidebar-label">{item.label}</span>
              )}
            </div>
          ))}
        </div>
      </nav>
    </aside>
  );
};

export default WorkspaceSidebar;
