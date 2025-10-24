import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import Spinner from '../common/Spinner';

const WorkspaceWrapper = ({ children }) => {
  const { workspaceId } = useParams();
  const { currentWorkspace, loadWorkspaceData, loading, error } = useWorkspace();
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(false);

  console.log('WorkspaceWrapper - workspaceId:', workspaceId);
  console.log('WorkspaceWrapper - currentWorkspace:', currentWorkspace);

  useEffect(() => {
    const loadWorkspace = async () => {
      // Only load if we don't have the current workspace or it's a different workspace
      if (!currentWorkspace || currentWorkspace.workspace_id !== workspaceId) {
        setIsLoadingWorkspace(true);
        try {
          // Create a minimal workspace object with the ID
          const workspace = { workspace_id: workspaceId };
          await loadWorkspaceData(workspace);
        } catch (err) {
          console.error('Failed to load workspace:', err);
        } finally {
          setIsLoadingWorkspace(false);
        }
      }
    };

    if (workspaceId && workspaceId !== 'undefined') {
      loadWorkspace();
    }
  }, [workspaceId, currentWorkspace, loadWorkspaceData]);

  if (isLoadingWorkspace || loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <Spinner size="large" />
        <p style={{ color: '#FFFFFF', fontFamily: 'Montserrat, sans-serif' }}>
          Loading workspace...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <p style={{ color: '#FF6B6B', fontFamily: 'Montserrat, sans-serif' }}>
          Error loading workspace: {error}
        </p>
      </div>
    );
  }

  return children;
};

export default WorkspaceWrapper;
