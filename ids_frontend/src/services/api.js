import axios from 'axios';
import config from '../config';

const api = axios.create({
  baseURL: config.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const workspaceAPI = {
  getAll: (payload = {}) => api.post('/workspaces/get-all', payload),
  getById: (payload) => api.post('/workspaces/get-by-id', payload),
  getData: (payload) => api.post('/workspaces/get-data', payload),
  create: (data) => api.post('/workspaces', data),
  update: (payload) => api.put('/workspaces/update', payload),
  delete: (payload) => api.delete('/workspaces/delete', { data: payload }),
};

export const documentAPI = {
  upload: (formData) => {
    return api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  process: (payload) => api.post('/documents/process', payload),
  getById: (payload) => api.post('/documents/get-by-id', payload),
  getByWorkspace: (payload) => api.post('/documents/get-by-workspace', payload),
};

export const llmAPI = {
  getLatestStream: (payload) => api.post('/llm-streams/get-latest', payload),
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
  getAll: (payload) => {
    return api.post('/meetings/get-all', payload);
  },
  getDetail: (payload) => {
    return api.post('/meetings/get-detail', payload);
  },
  update: (payload) => api.put('/meetings/update', payload),
  delete: (payload) => {
    return api.delete('/meetings/delete', { data: payload });
  },
  getStakeholders: (workspaceId, orgId = 'default_org') => {
    return api.get(`/workspaces/${workspaceId}/stakeholders?org_id=${orgId}`);
  },
};

export const dashboardAPI = {
  getDashboard: (payload) => {
    return api.post('/dashboard/get-dashboard', payload);
  },
  getSummary: (payload) => {
    return api.post('/dashboard/get-summary', payload);
  },
  getActivity: (payload) => {
    return api.post('/dashboard/get-activity', payload);
  },
  getDecisions: (payload) => {
    return api.post('/raid/get-section', { ...payload, section_name: 'decisions' });
  },
  getRequirements: (payload) => {
    return api.post('/brd/get-section', { ...payload, section_name: 'requirements' });
  },
  getRisksIssues: (payload) => {
    return api.post('/raid/get-section', { ...payload, section_name: 'risks_issues' });
  },
  getActionItems: (payload) => {
    return api.post('/raid/get-section', { ...payload, section_name: 'action_items' });
  },
  getDependencies: (payload) => {
    return api.post('/raid/get-section', { ...payload, section_name: 'dependencies' });
  },
  getMeetings: (payload) => {
    return api.post('/meetings/get-all', payload);
  },
};

export const brdAPI = {
  getBRD: (payload) => {
    return api.post('/brd/get-brd', payload);
  },
  getSummary: (payload) => {
    return api.post('/brd/get-summary', payload);
  },
  getSection: (payload) => {
    return api.post('/brd/get-section', payload);
  },
};

export const raidAPI = {
  getRAID: (payload) => {
    return api.post('/raid/get-raid', payload);
  },
  getSummary: (payload) => {
    return api.post('/raid/get-summary', payload);
  },
  getStatus: (payload) => {
    return api.post('/raid/get-status', payload);
  },
  getSection: (payload) => {
    return api.post('/raid/get-section', payload);
  },
};

export default api;

