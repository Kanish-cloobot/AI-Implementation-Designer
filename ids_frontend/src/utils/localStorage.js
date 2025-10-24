/**
 * Local Storage utilities for workspace management
 */

const WORKSPACE_STORAGE_KEY = 'cloo_workspace_current';

/**
 * Save current workspace to localStorage
 * @param {Object} workspace - The workspace object to save
 */
export const saveCurrentWorkspace = (workspace) => {
  try {
    if (workspace && workspace.workspace_id) {
      const workspaceData = {
        workspace_id: workspace.workspace_id,
        name: workspace.name,
        project_type: workspace.project_type,
        status: workspace.status,
        licenses: workspace.licenses || [],
        created_at: workspace.created_at,
        updated_at: workspace.updated_at
      };
      localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(workspaceData));
      console.log('Workspace saved to localStorage:', workspaceData);
    }
  } catch (error) {
    console.error('Failed to save workspace to localStorage:', error);
  }
};

/**
 * Load current workspace from localStorage
 * @returns {Object|null} The saved workspace object or null if not found
 */
export const loadCurrentWorkspace = () => {
  try {
    const savedWorkspace = localStorage.getItem(WORKSPACE_STORAGE_KEY);
    if (savedWorkspace) {
      const workspace = JSON.parse(savedWorkspace);
      console.log('Workspace loaded from localStorage:', workspace);
      return workspace;
    }
  } catch (error) {
    console.error('Failed to load workspace from localStorage:', error);
  }
  return null;
};

/**
 * Clear current workspace from localStorage
 */
export const clearCurrentWorkspace = () => {
  try {
    localStorage.removeItem(WORKSPACE_STORAGE_KEY);
    console.log('Workspace cleared from localStorage');
  } catch (error) {
    console.error('Failed to clear workspace from localStorage:', error);
  }
};

/**
 * Check if a workspace is currently saved in localStorage
 * @returns {boolean} True if a workspace is saved
 */
export const hasCurrentWorkspace = () => {
  try {
    return localStorage.getItem(WORKSPACE_STORAGE_KEY) !== null;
  } catch (error) {
    console.error('Failed to check workspace in localStorage:', error);
    return false;
  }
};
