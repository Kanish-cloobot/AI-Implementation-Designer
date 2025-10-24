import React from 'react';
import './WorkspaceList.css';
import Button from '../../components/common/Button';

const WorkspaceCard = ({ workspace, onView, onEdit, onDelete, onDashboard }) => {
  return (
    <div className="workspace-card">
      <div className="workspace-card-header">
        <span className="material-symbols-outlined workspace-card-icon">folder</span>
        <h3 className="workspace-card-title">{workspace.name}</h3>
      </div>
      <div className="workspace-card-body">
        <div className="workspace-card-info">
          <span className="workspace-card-label">Project Type:</span>
          <span className="workspace-card-value">{workspace.project_type}</span>
        </div>
        <div className="workspace-card-info">
          <span className="workspace-card-label">Status:</span>
          <span className={`workspace-card-status ${workspace.status}`}>{workspace.status}</span>
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
      <div className="workspace-card-actions">
        <Button onClick={onDashboard} variant="primary" size="medium" icon="arrow_forward">
          Enter Workspace
        </Button>
        <div className="workspace-card-secondary-actions">
          <Button onClick={onView} variant="secondary" size="small" icon="visibility">View</Button>
          <Button onClick={() => onEdit(workspace)} variant="secondary" size="small" icon="edit">Edit</Button>
          <Button onClick={() => onDelete(workspace.workspace_id)} variant="danger" size="small" icon="delete">
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceCard;

