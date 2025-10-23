import React, { useState, useEffect } from 'react';
import './WorkspaceForm.css';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import { useWorkspace } from '../../contexts/WorkspaceContext';

const SALESFORCE_LICENSES = [
  { value: 'Sales Cloud', label: 'Sales Cloud' },
  { value: 'Service Cloud', label: 'Service Cloud' },
  { value: 'Experience Cloud', label: 'Experience Cloud' },
  { value: 'Marketing Cloud', label: 'Marketing Cloud' },
  { value: 'Commerce Cloud', label: 'Commerce Cloud' },
  { value: 'Analytics Cloud', label: 'Analytics Cloud' },
  { value: 'Platform', label: 'Platform' },
  { value: 'Field Service Lightning', label: 'Field Service Lightning' },
];

const PROJECT_TYPES = [
  { value: 'Greenfield', label: 'Greenfield' },
  { value: 'Enhancement', label: 'Enhancement' },
];

const validateForm = (formData) => {
  const newErrors = {};
  if (!formData.name.trim()) newErrors.name = 'Workspace name is required';
  if (!formData.project_type) newErrors.project_type = 'Project type is required';
  if (formData.licenses.length === 0) newErrors.licenses = 'At least one license must be selected';
  return newErrors;
};

const WorkspaceForm = ({ isOpen, onClose, onSuccess, workspace }) => {
  const { createWorkspace, updateWorkspace, loading } = useWorkspace();
  const [formData, setFormData] = useState({ name: '', project_type: '', licenses: [] });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (workspace) {
      setFormData({ name: workspace.name || '', project_type: workspace.project_type || '',
        licenses: workspace.licenses || [] });
    } else {
      setFormData({ name: '', project_type: '', licenses: [] });
    }
    setErrors({});
  }, [workspace, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm(formData);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
    try {
      const result = workspace ? await updateWorkspace(workspace.workspace_id, formData)
        : await createWorkspace(formData);
      onSuccess(result);
    } catch (err) {
      console.error('Failed to save workspace:', err);
    }
  };

  const footer = (
    <>
      <Button onClick={onClose} variant="secondary" disabled={loading}>Cancel</Button>
      <Button onClick={handleSubmit} variant="primary" loading={loading}>
        {workspace ? 'Update' : 'Create'}
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={workspace ? 'Edit Workspace' : 'Create New Workspace'}
      footer={footer} size="medium" closeOnOverlayClick={!loading}>
      <form className="workspace-form" onSubmit={handleSubmit}>
        <Input label="Workspace Name" name="name" value={formData.name} onChange={handleChange}
          placeholder="Enter workspace name" error={errors.name} required disabled={loading} />
        <Select label="Project Type" name="project_type" value={formData.project_type}
          onChange={handleChange} options={PROJECT_TYPES} placeholder="Select project type"
          error={errors.project_type} required disabled={loading} />
        <Select label="Salesforce Licenses" name="licenses" value={formData.licenses}
          onChange={handleChange} options={SALESFORCE_LICENSES} error={errors.licenses}
          required multiple disabled={loading} />
      </form>
    </Modal>
  );
};

export default WorkspaceForm;

