import React, { useEffect, useState } from 'react';
import './WorkspaceList.css';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import WorkspaceForm from './WorkspaceForm';
import DocumentUploadModal from '../documents/DocumentUploadModal';
import SoWViewer from '../viewer/SoWViewer';
import WorkspaceCard from './WorkspaceCard';

const EmptyState = ({ onCreate }) => (
  <div className="workspace-list-empty">
    <span className="material-symbols-outlined workspace-list-empty-icon">folder_open</span>
    <h2 className="workspace-list-empty-title">No workspaces yet</h2>
    <p className="workspace-list-empty-text">Create your first workspace to get started</p>
    <Button onClick={onCreate} icon="add" variant="primary">Create Workspace</Button>
  </div>
);

const WorkspaceList = () => {
  const { workspaces, loading, error, fetchWorkspaces, deleteWorkspace, currentWorkspace, sowData, loadWorkspaceData } = useWorkspace();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(null);
  const [showSoWViewer, setShowSoWViewer] = useState(false);

  useEffect(() => { fetchWorkspaces(); }, [fetchWorkspaces]);

  const handleCreateNew = () => { setEditingWorkspace(null); setIsFormOpen(true); };
  const handleEdit = (workspace) => { setEditingWorkspace(workspace); setIsFormOpen(true); };
  
  const handleDelete = async (workspaceId) => {
    if (window.confirm('Are you sure you want to delete this workspace?')) {
      try {
        await deleteWorkspace(workspaceId);
      } catch (err) {
        console.error('Failed to delete workspace:', err);
      }
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    if (!editingWorkspace) setIsUploadModalOpen(true);
  };

  const handleUploadSuccess = () => { setIsUploadModalOpen(false); setShowSoWViewer(true); };
  const handleViewSoW = async (workspace) => { 
    try {
      await loadWorkspaceData(workspace);
      setShowSoWViewer(true);
    } catch (err) {
      console.error('Failed to load workspace data:', err);
    }
  };

  if (showSoWViewer && sowData) {
    return <SoWViewer onBack={() => setShowSoWViewer(false)} />;
  }

  return (
    <div className="workspace-list-container">
      <div className="workspace-list-header">
        <h1 className="workspace-list-title">Workspaces</h1>
        <Button onClick={handleCreateNew} icon="add" variant="primary">New Workspace</Button>
      </div>
      {error && <div className="workspace-list-error">{error}</div>}
      {loading && !workspaces.length ? (
        <div className="workspace-list-loading"><Spinner size="large" /></div>
      ) : (
        <div className="workspace-grid">
          {workspaces.map((workspace) => (
            <WorkspaceCard key={workspace.workspace_id} workspace={workspace}
              onView={() => handleViewSoW(workspace)} onEdit={handleEdit} onDelete={handleDelete} />
          ))}
        </div>
      )}
      {!loading && workspaces.length === 0 && <EmptyState onCreate={handleCreateNew} />}
      <WorkspaceForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess} workspace={editingWorkspace} />
      <DocumentUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess} workspace={currentWorkspace} />
    </div>
  );
};

export default WorkspaceList;

