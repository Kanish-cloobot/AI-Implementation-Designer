import React, { createContext, useState, useContext, useCallback } from 'react';
import { workspaceAPI, documentAPI, llmAPI } from '../services/api';

const WorkspaceContext = createContext();

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

const useFetchWorkspaces = (setWorkspaces, setLoading, setError) => {
  return useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await workspaceAPI.getAll();
      setWorkspaces(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch workspaces');
    } finally {
      setLoading(false);
    }
  }, [setWorkspaces, setLoading, setError]);
};

const useCreateWorkspace = (setWorkspaces, setCurrentWorkspace, setLoading, setError) => {
  return useCallback(async (workspaceData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await workspaceAPI.create(workspaceData);
      setWorkspaces((prev) => [...prev, response.data]);
      setCurrentWorkspace(response.data);
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to create workspace');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setWorkspaces, setCurrentWorkspace, setLoading, setError]);
};

const useUpdateWorkspace = (setWorkspaces, setLoading, setError) => {
  return useCallback(async (id, workspaceData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await workspaceAPI.update(id, workspaceData);
      setWorkspaces((prev) =>
        prev.map((ws) => (ws.workspace_id === id ? response.data : ws))
      );
      return response.data;
    } catch (err) {
      setError(err.message || 'Failed to update workspace');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setWorkspaces, setLoading, setError]);
};

const useDeleteWorkspace = (setWorkspaces, setLoading, setError) => {
  return useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);
      await workspaceAPI.delete(id);
      setWorkspaces((prev) => prev.filter((ws) => ws.workspace_id !== id));
    } catch (err) {
      setError(err.message || 'Failed to delete workspace');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setWorkspaces, setLoading, setError]);
};

const useUploadAndProcess = (setCurrentDocument, setSowData, setLoading, setError) => {
  return useCallback(async (workspaceId, file) => {
    try {
      setLoading(true);
      setError(null);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', 'SOW');
      const uploadResponse = await documentAPI.upload(workspaceId, formData);
      const document = uploadResponse.data;
      setCurrentDocument(document);
      const processResponse = await documentAPI.process(document.document_id);
      const streamData = processResponse.data;
      if (streamData.response_payload) {
        setSowData(JSON.parse(streamData.response_payload));
      }
      return { document, streamData };
    } catch (err) {
      setError(err.message || 'Failed to process document');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setCurrentDocument, setSowData, setLoading, setError]);
};

const useLoadSowData = (setSowData, setLoading, setError) => {
  return useCallback(async (documentId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await llmAPI.getLatestStream(documentId);
      if (response.data.response_payload) {
        setSowData(JSON.parse(response.data.response_payload));
      }
    } catch (err) {
      setError(err.message || 'Failed to load SoW data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setSowData, setLoading, setError]);
};

const useLoadWorkspaceData = (setCurrentWorkspace, setSowData, setCurrentDocument, setLoading, setError) => {
  return useCallback(async (workspace) => {
    try {
      setLoading(true);
      setError(null);
      
      // Clear previous data first
      setSowData(null);
      setCurrentDocument(null);
      
      console.log(`Loading workspace data for ${workspace.workspace_id}:`, workspace);
      
      // Use the new API endpoint that gets all data in one call
      const response = await workspaceAPI.getData(workspace.workspace_id);
      const data = response.data;
      
      console.log(`Workspace data response for ${workspace.workspace_id}:`, data);
      
      // Set the workspace (use the one from response to ensure it's fresh)
      setCurrentWorkspace(data.workspace);
      
      if (data.document && data.sow_data) {
        console.log(`Setting document and SoW data for workspace ${workspace.workspace_id}:`, {
          document: data.document,
          sowData: data.sow_data
        });
        setCurrentDocument(data.document);
        setSowData(data.sow_data);
      } else {
        console.log(`No document or SoW data found for workspace ${workspace.workspace_id}`);
        setCurrentDocument(null);
        setSowData(null);
      }
    } catch (err) {
      console.error('Error loading workspace data:', err);
      setError(err.message || 'Failed to load workspace data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setCurrentWorkspace, setSowData, setCurrentDocument, setLoading, setError]);
};

export const WorkspaceProvider = ({ children }) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [sowData, setSowData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWorkspaces = useFetchWorkspaces(setWorkspaces, setLoading, setError);
  const createWorkspace = useCreateWorkspace(setWorkspaces, setCurrentWorkspace, setLoading, setError);
  const updateWorkspace = useUpdateWorkspace(setWorkspaces, setLoading, setError);
  const deleteWorkspace = useDeleteWorkspace(setWorkspaces, setLoading, setError);
  const uploadAndProcessDocument = useUploadAndProcess(setCurrentDocument, setSowData, setLoading, setError);
  const loadSowData = useLoadSowData(setSowData, setLoading, setError);
  const loadWorkspaceData = useLoadWorkspaceData(setCurrentWorkspace, setSowData, setCurrentDocument, setLoading, setError);

  const clearWorkspaceData = useCallback(() => {
    setCurrentWorkspace(null);
    setCurrentDocument(null);
    setSowData(null);
  }, []);

  const value = {
    workspaces, currentWorkspace, currentDocument, sowData, loading, error,
    fetchWorkspaces, createWorkspace, updateWorkspace, deleteWorkspace,
    uploadAndProcessDocument, loadSowData, loadWorkspaceData, clearWorkspaceData,
    setCurrentWorkspace, setSowData,
  };

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
};

