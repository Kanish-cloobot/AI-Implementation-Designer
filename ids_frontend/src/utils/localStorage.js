// localStorage utility functions for workspace management

const WORKSPACE_STORAGE_KEY = 'currentWorkspace';

export const saveCurrentWorkspace = (workspace) => {
  try {
    localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(workspace));
  } catch (error) {
    console.error('Failed to save workspace to localStorage:', error);
  }
};

export const loadCurrentWorkspace = () => {
  try {
    const workspace = localStorage.getItem(WORKSPACE_STORAGE_KEY);
    return workspace ? JSON.parse(workspace) : null;
  } catch (error) {
    console.error('Failed to load workspace from localStorage:', error);
    return null;
  }
};

export const clearCurrentWorkspace = () => {
  try {
    localStorage.removeItem(WORKSPACE_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear workspace from localStorage:', error);
  }
};
