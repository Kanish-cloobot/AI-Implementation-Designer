import axios from 'axios';
import config from '../config';

const api = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const workspaceAPI = {
  getAll: () => api.get('/workspaces'),
  getById: (id) => api.get(`/workspaces/${id}`),
  getData: (id) => api.get(`/workspaces/${id}/data`),
  create: (data) => api.post('/workspaces', data),
  update: (id, data) => api.put(`/workspaces/${id}`, data),
  delete: (id) => api.delete(`/workspaces/${id}`),
};

export const documentAPI = {
  upload: (workspaceId, formData) => {
    return api.post(`/documents/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      params: { workspace_id: workspaceId },
    });
  },
  process: (documentId) => api.post(`/documents/${documentId}/process`),
  getById: (documentId) => api.get(`/documents/${documentId}`),
  getByWorkspace: (workspaceId) => api.get(`/documents/workspace/${workspaceId}`),
};

export const llmAPI = {
  getLatestStream: (documentId) => api.get(`/llm-streams/document/${documentId}/latest`),
};

export const meetingAPI = {
  create: (formData) => {
    return api.post('/meetings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getAll: (workspaceId, orgId = 'default_org', status = null) => {
    const params = { org_id: orgId };
    if (status) {
      params.status = status;
    }
    return api.get(`/meetings/${workspaceId}`, { params });
  },
  getDetail: (meetingId, orgId = 'default_org') => {
    return api.get(`/meetings/${meetingId}/detail`, {
      params: { org_id: orgId },
    });
  },
  update: (meetingId, data) => api.put(`/meetings/${meetingId}`, data),
  delete: (meetingId, orgId = 'default_org') => {
    return api.delete(`/meetings/${meetingId}`, {
      params: { org_id: orgId },
    });
  },
};

export default api;

