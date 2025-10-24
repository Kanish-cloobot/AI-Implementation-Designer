import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { loadCurrentWorkspace, saveCurrentWorkspace, clearCurrentWorkspace } from '../../utils/localStorage';
import Spinner from '../common/Spinner';

const WorkspaceWrapper = ({ children }) => {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const { currentWorkspace, loadWorkspaceData, loading, error } = useWorkspace();
  const [isLoadingWorkspace, setIsLoadingWorkspace] = useState(false);
  const loadingRef = useRef(false);

  console.log('WorkspaceWrapper - workspaceId:', workspaceId);
  console.log('WorkspaceWrapper - currentWorkspace:', currentWorkspace);

  useEffect(() => {
    const loadWorkspace = async () => {
      // Only load if we don't have the current workspace or it's a different workspace
      // and we're not already loading
      if ((!currentWorkspace || currentWorkspace.workspace_id !== workspaceId) && !loadingRef.current) {
        loadingRef.current = true;
        setIsLoadingWorkspace(true);
        try {
          // Create a minimal workspace object with the ID
          const workspace = { workspace_id: workspaceId };
          await loadWorkspaceData(workspace);
          // Save the workspace to localStorage for future reference
          if (currentWorkspace) {
            saveCurrentWorkspace(currentWorkspace);
          }
        } catch (err) {
          console.error('Failed to load workspace:', err);
        } finally {
          setIsLoadingWorkspace(false);
          loadingRef.current = false;
        }
      }
    };

    // Check if workspaceId is valid (not undefined, null, or empty string)
    if (workspaceId && workspaceId !== 'undefined' && workspaceId !== 'null' && workspaceId.trim() !== '') {
      loadWorkspace();
    } else {
      console.warn('Invalid workspace ID from URL:', workspaceId);
      // Try to get workspace from localStorage as fallback
      const savedWorkspace = loadCurrentWorkspace();
      if (savedWorkspace && savedWorkspace.workspace_id) {
        console.log('Using saved workspace as fallback:', savedWorkspace);
        // Redirect to the correct URL with the saved workspace ID
        const currentPath = window.location.pathname;
        const newPath = currentPath.replace('undefined', savedWorkspace.workspace_id);
        navigate(newPath, { replace: true });
      } else {
        console.error('No valid workspace ID found in URL or localStorage');
        // Redirect to workspaces list
        navigate('/workspaces', { replace: true });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

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
