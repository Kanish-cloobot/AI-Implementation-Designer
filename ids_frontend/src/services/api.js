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
    console.log('API: Creating meeting with form data:', formData);
    console.log('API: Base URL:', api.defaults.baseURL);
    
    // Debug: Log FormData contents
    console.log('API: FormData entries:');
    for (let [key, value] of formData.entries()) {
      console.log(`API: ${key}:`, value);
    }
    
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

export const dashboardAPI = {
  getDashboard: (workspaceId, orgId = 'default_org') => {
    return api.get(`/dashboard/${workspaceId}`, {
      params: { org_id: orgId },
    });
  },
  getSummary: (workspaceId, orgId = 'default_org') => {
    return api.get(`/dashboard/${workspaceId}/summary`, {
      params: { org_id: orgId },
    });
  },
  getActivity: (workspaceId, orgId = 'default_org', limit = 10) => {
    return api.get(`/dashboard/${workspaceId}/activity`, {
      params: { org_id: orgId, limit },
    });
  },
};

export const brdAPI = {
  getBRD: (workspaceId, orgId = 'default_org') => {
    return api.get(`/brd/${workspaceId}`, {
      params: { org_id: orgId },
    });
  },
  getSummary: (workspaceId, orgId = 'default_org') => {
    return api.get(`/brd/${workspaceId}/summary`, {
      params: { org_id: orgId },
    });
  },
  getSection: (workspaceId, sectionName, orgId = 'default_org') => {
    return api.get(`/brd/${workspaceId}/section/${sectionName}`, {
      params: { org_id: orgId },
    });
  },
};

export const raidAPI = {
  getRAID: (workspaceId, orgId = 'default_org') => {
    return api.get(`/raid/${workspaceId}`, {
      params: { org_id: orgId },
    });
  },
  getSummary: (workspaceId, orgId = 'default_org') => {
    return api.get(`/raid/${workspaceId}/summary`, {
      params: { org_id: orgId },
    });
  },
  getStatus: (workspaceId, orgId = 'default_org') => {
    return api.get(`/raid/${workspaceId}/status`, {
      params: { org_id: orgId },
    });
  },
  getSection: (workspaceId, sectionName, orgId = 'default_org') => {
    return api.get(`/raid/${workspaceId}/section/${sectionName}`, {
      params: { org_id: orgId },
    });
  },
};

export default api;

