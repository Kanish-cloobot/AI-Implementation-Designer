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

export const WorkspaceProvider = ({ children }) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [currentWorkspace, setCurrentWorkspace] = useState(null);
  const [currentDocument, setCurrentDocument] = useState(null);
  const [sowData, setSowData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWorkspaces = useCallback(async () => {
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
  }, []);

  const createWorkspace = useCallback(async (workspaceData) => {
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
  }, []);

  const updateWorkspace = useCallback(async (id, workspaceData) => {
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
  }, []);

  const deleteWorkspace = useCallback(async (id) => {
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
  }, []);

  const uploadAndProcessDocument = useCallback(async (workspaceId, file) => {
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
        const parsedData = JSON.parse(streamData.response_payload);
        setSowData(parsedData);
      }
      
      return { document, streamData };
    } catch (err) {
      setError(err.message || 'Failed to process document');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSowData = useCallback(async (documentId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await llmAPI.getLatestStream(documentId);
      if (response.data.response_payload) {
        const parsedData = JSON.parse(response.data.response_payload);
        setSowData(parsedData);
      }
    } catch (err) {
      setError(err.message || 'Failed to load SoW data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    workspaces,
    currentWorkspace,
    currentDocument,
    sowData,
    loading,
    error,
    fetchWorkspaces,
    createWorkspace,
    updateWorkspace,
    deleteWorkspace,
    uploadAndProcessDocument,
    loadSowData,
    setCurrentWorkspace,
    setSowData,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};

