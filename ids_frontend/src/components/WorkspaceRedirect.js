import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { loadCurrentWorkspace } from '../utils/localStorage';

/**
 * Component that handles automatic redirection to saved workspace
 * This component checks if there's a saved workspace in localStorage
 * and redirects to the appropriate route
 */
const WorkspaceRedirect = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentWorkspace, loadWorkspaceData } = useWorkspace();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeWorkspace = async () => {
      try {
        // Check if we're already in a workspace route
        const currentPath = location.pathname;
        const isInWorkspaceRoute = currentPath.startsWith('/workspace/');
        
        // If we're not in a workspace route, check for saved workspace
        if (!isInWorkspaceRoute) {
          const savedWorkspace = loadCurrentWorkspace();
          if (savedWorkspace && savedWorkspace.workspace_id) {
            console.log('Found saved workspace, loading data:', savedWorkspace);
            // Load the workspace data to ensure it's properly set in context
            await loadWorkspaceData(savedWorkspace);
            // Redirect to dashboard
            navigate(`/workspace/${savedWorkspace.workspace_id}/dashboard`, { replace: true });
          }
        }
      } catch (error) {
        console.error('Error initializing workspace:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    if (!isInitialized) {
      initializeWorkspace();
    }
  }, [navigate, location.pathname, loadWorkspaceData, isInitialized]);

  return children;
};

export default WorkspaceRedirect;
