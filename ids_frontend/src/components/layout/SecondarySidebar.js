import React from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import './SecondarySidebar.css';

const SecondarySidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { workspaceId } = useParams();
  
  // Check if we're in a workspace
  const isInWorkspace = workspaceId && location.pathname.includes('/workspace/');
  
  console.log('SecondarySidebar Debug:', { 
    workspaceId, 
    pathname: location.pathname, 
    isInWorkspace,
    includesWorkspace: location.pathname.includes('/workspace/')
  });
  
  // Only show secondary sidebar when in a workspace
  // Temporarily always show for debugging
  // if (!isInWorkspace) {
  //   console.log('SecondarySidebar: Not in workspace, returning null');
  //   return null;
  // }
  
  const menuItems = workspaceId ? [
    { icon: 'dashboard', label: 'Dashboard', path: `/workspace/${workspaceId}/dashboard` },
    { icon: 'description', label: 'SOW', path: `/workspace/${workspaceId}/sow` },
    { icon: 'event', label: 'Meetings', path: `/workspace/${workspaceId}/meetings` },
    { icon: 'assignment', label: 'BRD', path: `/workspace/${workspaceId}/brd` },
  ] : [
    { icon: 'dashboard', label: 'Dashboard', path: '/dashboard' },
    { icon: 'description', label: 'SOW', path: '/sow' },
    { icon: 'event', label: 'Meetings', path: '/meetings' },
    { icon: 'assignment', label: 'BRD', path: '/brd' },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path);
  };

  const handleItemClick = (path) => {
    navigate(path);
  };
  
  return (
    <aside className="secondary-sidebar">
      <div className="secondary-sidebar-header">
        <span className="secondary-sidebar-title">Navigation</span>
      </div>
      <nav className="secondary-sidebar-nav">
        {menuItems.map((item, index) => (
          <div
            key={index}
            className={`secondary-sidebar-item ${isActive(item.path) ? 'secondary-sidebar-item-active' : ''}`}
            onClick={() => handleItemClick(item.path)}
          >
            <span className="material-symbols-outlined secondary-sidebar-icon">
              {item.icon}
            </span>
            <span className="secondary-sidebar-label">{item.label}</span>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default SecondarySidebar;
