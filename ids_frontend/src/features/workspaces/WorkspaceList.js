import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './WorkspaceList.css';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import WorkspaceForm from './WorkspaceForm';
import DocumentUploadModal from '../documents/DocumentUploadModal';
import SoWViewer from '../viewer/SoWViewer';
import WorkspaceCard from './WorkspaceCard';
import ConfirmationPopup from '../../components/common/ConfirmationPopup';

const EmptyState = ({ onCreate }) => (
  <div className="workspace-list-empty">
    <span className="material-symbols-outlined workspace-list-empty-icon">folder_open</span>
    <h2 className="workspace-list-empty-title">No workspaces yet</h2>
    <p className="workspace-list-empty-text">Create your first workspace to get started</p>
    <Button onClick={onCreate} icon="add" variant="primary">Create Workspace</Button>
  </div>
);

const useWorkspaceHandlers = (workspaces, loading, error, fetchWorkspaces, deleteWorkspace, 
  currentWorkspace, sowData, loadWorkspaceData, collapseSidebar, showSnackbar) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(null);
  const [showSoWViewer, setShowSoWViewer] = useState(false);
  const [confirmationPopup, setConfirmationPopup] = useState({
    isOpen: false,
    workspaceId: null,
    workspaceName: ''
  });

  useEffect(() => { fetchWorkspaces(); }, [fetchWorkspaces]);

  const handleCreateNew = () => { setEditingWorkspace(null); setIsFormOpen(true); };
  const handleEdit = (workspace) => { setEditingWorkspace(workspace); setIsFormOpen(true); };
  
  const handleDelete = (workspace) => {
    setConfirmationPopup({
      isOpen: true,
      workspaceId: workspace.workspace_id,
      workspaceName: workspace.name
    });
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteWorkspace(confirmationPopup.workspaceId);
      showSnackbar('Workspace deleted successfully', 'success');
      setConfirmationPopup({ isOpen: false, workspaceId: null, workspaceName: '' });
    } catch (err) {
      console.error('Failed to delete workspace:', err);
      showSnackbar('Failed to delete workspace', 'error');
    }
  };

  const handleCancelDelete = () => {
    setConfirmationPopup({ isOpen: false, workspaceId: null, workspaceName: '' });
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
      collapseSidebar();
      showSnackbar('Workspace data loaded successfully', 'success');
    } catch (err) {
      console.error('Failed to load workspace data:', err);
      showSnackbar('Failed to load workspace data', 'error');
    }
  };

  return {
    isFormOpen, setIsFormOpen,
    isUploadModalOpen, setIsUploadModalOpen,
    editingWorkspace, setEditingWorkspace,
    showSoWViewer, setShowSoWViewer,
    confirmationPopup, setConfirmationPopup,
    handleCreateNew, handleEdit, handleDelete,
    handleConfirmDelete, handleCancelDelete,
    handleFormSuccess, handleUploadSuccess, handleViewSoW
  };
};

const WorkspaceList = () => {
  const navigate = useNavigate();
  const { workspaces, loading, error, fetchWorkspaces, deleteWorkspace, 
    currentWorkspace, sowData, loadWorkspaceData, collapseSidebar, showSnackbar } = useWorkspace();
  
  const {
    isFormOpen, setIsFormOpen,
    isUploadModalOpen, setIsUploadModalOpen,
    editingWorkspace,
    showSoWViewer, setShowSoWViewer,
    confirmationPopup,
    handleCreateNew, handleEdit, handleDelete,
    handleConfirmDelete, handleCancelDelete,
    handleFormSuccess, handleUploadSuccess, handleViewSoW
  } = useWorkspaceHandlers(workspaces, loading, error, fetchWorkspaces, deleteWorkspace, 
    currentWorkspace, sowData, loadWorkspaceData, collapseSidebar, showSnackbar);

  const handleMeetings = (workspace) => {
    navigate(`/workspace/${workspace.workspace_id}/meetings`);
  };

  const handleDashboard = (workspace) => {
    navigate(`/workspace/${workspace.workspace_id}/dashboard`);
  };

  const handleBRD = (workspace) => {
    navigate(`/workspace/${workspace.workspace_id}/brd`);
  };

  const handleRAID = (workspace) => {
    navigate(`/workspace/${workspace.workspace_id}/raid`);
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
            <WorkspaceCard
              key={workspace.workspace_id}
              workspace={workspace}
              onView={() => handleViewSoW(workspace)}
              onDashboard={() => handleDashboard(workspace)}
              onMeetings={() => handleMeetings(workspace)}
              onBRD={() => handleBRD(workspace)}
              onRAID={() => handleRAID(workspace)}
              onEdit={handleEdit}
              onDelete={() => handleDelete(workspace)}
            />
          ))}
        </div>
      )}
      {!loading && workspaces.length === 0 && <EmptyState onCreate={handleCreateNew} />}
      <WorkspaceForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)}
        onSuccess={handleFormSuccess} workspace={editingWorkspace} />
      <DocumentUploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)}
        onSuccess={handleUploadSuccess} workspace={currentWorkspace} />
      <ConfirmationPopup
        isOpen={confirmationPopup.isOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Workspace"
        message={`Are you sure you want to delete "${confirmationPopup.workspaceName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={loading}
      />
    </div>
  );
};

export default WorkspaceList;

