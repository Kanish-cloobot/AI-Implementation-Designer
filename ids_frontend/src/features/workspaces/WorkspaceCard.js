import React from 'react';
import './WorkspaceList.css';

const WorkspaceCard = ({ workspace, onView, onEdit, onDelete, onDashboard }) => {
  const handleCardClick = () => {
    onDashboard();
  };

  const handleActionClick = (e, action) => {
    e.stopPropagation();
    action();
  };

  return (
    <div className="workspace-card" onClick={handleCardClick}>
      <div className="workspace-card-content">
        <div className="workspace-card-header">
          <div className="workspace-card-icon">
            <span className="material-symbols-outlined">folder</span>
          </div>
          <div className="workspace-card-actions">
            <button 
              className="workspace-card-action-btn view-btn" 
              onClick={(e) => handleActionClick(e, onView)}
              title="View"
            >
              <span className="material-symbols-outlined">visibility</span>
            </button>
            <button 
              className="workspace-card-action-btn edit-btn" 
              onClick={(e) => handleActionClick(e, () => onEdit(workspace))}
              title="Edit"
            >
              <span className="material-symbols-outlined">edit</span>
            </button>
            <button 
              className="workspace-card-action-btn delete-btn" 
              onClick={(e) => handleActionClick(e, () => onDelete(workspace.workspace_id))}
              title="Delete"
            >
              <span className="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
        
        <div className="workspace-card-body">
          <div className="workspace-card-title">{workspace.name}</div>
          
          <div className="workspace-card-info">
            <div className="workspace-card-info-item">
              <span className="workspace-card-label">Project Type:</span>
              <span className="workspace-card-value">{workspace.project_type}</span>
            </div>
            <div className="workspace-card-info-item">
              <span className="workspace-card-label">Status:</span>
              <span className={`workspace-card-status ${workspace.status}`}>{workspace.status}</span>
            </div>
          </div>
          
          {workspace.licenses && workspace.licenses.length > 0 && (
            <div className="workspace-card-licenses">
              <span className="workspace-card-label">Licenses:</span>
              <div className="workspace-card-license-list">
                {workspace.licenses.map((license, idx) => (
                  <span key={idx} className="workspace-card-license-tag">{license}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WorkspaceCard;

