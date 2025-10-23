import React, { useEffect, useState } from 'react';
import './WorkspaceList.css';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import WorkspaceForm from './WorkspaceForm';
import DocumentUploadModal from '../documents/DocumentUploadModal';
import SoWViewer from '../viewer/SoWViewer';

const WorkspaceList = () => {
  const {
    workspaces,
    loading,
    error,
    fetchWorkspaces,
    deleteWorkspace,
    currentWorkspace,
    sowData
  } = useWorkspace();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(null);
  const [showSoWViewer, setShowSoWViewer] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const handleCreateNew = () => {
    setEditingWorkspace(null);
    setIsFormOpen(true);
  };

  const handleEdit = (workspace) => {
    setEditingWorkspace(workspace);
    setIsFormOpen(true);
  };

  const handleDelete = async (workspaceId) => {
    if (window.confirm('Are you sure you want to delete this workspace?')) {
      try {
        await deleteWorkspace(workspaceId);
      } catch (err) {
        console.error('Failed to delete workspace:', err);
      }
    }
  };

  const handleFormSuccess = (workspace) => {
    setIsFormOpen(false);
    if (!editingWorkspace) {
      setIsUploadModalOpen(true);
    }
  };

  const handleUploadSuccess = () => {
    setIsUploadModalOpen(false);
    setShowSoWViewer(true);
  };

  const handleViewSoW = (workspace) => {
    setShowSoWViewer(true);
  };

  if (showSoWViewer && sowData) {
    return <SoWViewer onBack={() => setShowSoWViewer(false)} />;
  }

  return (
    <div className="workspace-list-container">
      <div className="workspace-list-header">
        <h1 className="workspace-list-title">Workspaces</h1>
        <Button onClick={handleCreateNew} icon="add" variant="primary">
          New Workspace
        </Button>
      </div>

      {error && <div className="workspace-list-error">{error}</div>}

      {loading && !workspaces.length ? (
        <div className="workspace-list-loading">
          <Spinner size="large" />
        </div>
      ) : (
        <div className="workspace-grid">
          {workspaces.map((workspace) => (
            <div key={workspace.workspace_id} className="workspace-card">
              <div className="workspace-card-header">
                <span className="material-symbols-outlined workspace-card-icon">
                  folder
                </span>
                <h3 className="workspace-card-title">{workspace.name}</h3>
              </div>
              <div className="workspace-card-body">
                <div className="workspace-card-info">
                  <span className="workspace-card-label">Project Type:</span>
                  <span className="workspace-card-value">{workspace.project_type}</span>
                </div>
                <div className="workspace-card-info">
                  <span className="workspace-card-label">Status:</span>
                  <span className={`workspace-card-status ${workspace.status}`}>
                    {workspace.status}
                  </span>
                </div>
                {workspace.licenses && workspace.licenses.length > 0 && (
                  <div className="workspace-card-licenses">
                    <span className="workspace-card-label">Licenses:</span>
                    <div className="workspace-card-license-list">
                      {workspace.licenses.map((license, idx) => (
                        <span key={idx} className="workspace-card-license-tag">
                          {license}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="workspace-card-actions">
                <Button
                  onClick={() => handleViewSoW(workspace)}
                  variant="secondary"
                  size="small"
                  icon="visibility"
                >
                  View
                </Button>
                <Button
                  onClick={() => handleEdit(workspace)}
                  variant="secondary"
                  size="small"
                  icon="edit"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => handleDelete(workspace.workspace_id)}
                  variant="danger"
                  size="small"
                  icon="delete"
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && workspaces.length === 0 && (
        <div className="workspace-list-empty">
          <span className="material-symbols-outlined workspace-list-empty-icon">
            folder_open
          </span>
          <h2 className="workspace-list-empty-title">No workspaces yet</h2>
          <p className="workspace-list-empty-text">
            Create your first workspace to get started
          </p>
          <Button onClick={handleCreateNew} icon="add" variant="primary">
            Create Workspace
          </Button>
        </div>
      )}

      <WorkspaceForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess}
        workspace={editingWorkspace}
      />

      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess}
        workspace={currentWorkspace}
      />
    </div>
  );
};

export default WorkspaceList;

