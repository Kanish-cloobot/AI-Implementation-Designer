import React, { useState, useEffect } from 'react';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Spinner from '../../components/common/Spinner';
import { meetingAPI } from '../../services/api';
import './MeetingForm.css';

const MeetingForm = ({ workspaceId, orgId = 'default_org', meeting, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    meeting_name: '',
    stakeholders: '',
    meeting_datetime: '',
    meeting_details: '',
    status: 'scheduled',
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingFiles, setProcessingFiles] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (meeting) {
      setFormData({
        meeting_name: meeting.meeting_name || '',
        stakeholders: meeting.stakeholders || '',
        meeting_datetime: meeting.meeting_datetime || '',
        meeting_details: meeting.meeting_details || '',
        status: meeting.status || 'scheduled',
      });
    }
  }, [meeting]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter((file) => {
      const ext = file.name.split('.').pop().toLowerCase();
      return ['pdf', 'docx', 'doc', 'txt'].includes(ext);
    });

    if (validFiles.length !== selectedFiles.length) {
      alert('Some files were skipped. Only PDF, DOCX, and TXT files are allowed.');
    }

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const handleRemoveFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.meeting_name.trim()) {
      newErrors.meeting_name = 'Meeting name is required';
    }

    if (!formData.meeting_datetime) {
      newErrors.meeting_datetime = 'Date and time are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log('Form submission started');
    console.log('Form data:', formData);
    console.log('Workspace ID:', workspaceId);
    console.log('Org ID:', orgId);

    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    try {
      setLoading(true);

      if (meeting) {
        console.log('Updating existing meeting');
        await meetingAPI.update(meeting.meeting_id, {
          ...formData,
          org_id: orgId,
        });
      } else {
        console.log('Creating new meeting');
        setProcessingFiles(files.length > 0);
        const formDataToSend = new FormData();
        formDataToSend.append('workspace_id', workspaceId);
        formDataToSend.append('org_id', orgId);
        formDataToSend.append('meeting_name', formData.meeting_name);
        formDataToSend.append('stakeholders', formData.stakeholders);
        formDataToSend.append('meeting_datetime', formData.meeting_datetime);
        formDataToSend.append('meeting_details', formData.meeting_details);
        formDataToSend.append('status', formData.status);

        files.forEach((file) => {
          formDataToSend.append('files', file);
        });

        console.log('Sending form data to API');
        console.log('Form data values:');
        console.log('- workspace_id:', workspaceId);
        console.log('- meeting_name:', formData.meeting_name);
        console.log('- stakeholders:', formData.stakeholders);
        console.log('- meeting_datetime:', formData.meeting_datetime);
        console.log('- meeting_details:', formData.meeting_details);
        console.log('- status:', formData.status);
        
        const response = await meetingAPI.create(formDataToSend);
        console.log('API response:', response);
      }

      console.log('Meeting saved successfully');
      onSuccess();
    } catch (error) {
      console.error('Error saving meeting:', error);
      console.error('Error details:', error.response?.data);
      alert('Failed to save meeting. Please try again.');
    } finally {
      setLoading(false);
      setProcessingFiles(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Modal isOpen={true} onClose={onClose} title={meeting ? 'Edit Meeting' : 'Create New Meeting'}>
      <form onSubmit={handleSubmit} className="meeting-form">
        {processingFiles && (
          <div className="meeting-form-processing">
            <Spinner />
            <p>Processing files and extracting insights...</p>
            <p className="processing-note">This may take a few moments. Please wait.</p>
          </div>
        )}

        <div className="meeting-form-content">
          <div className="meeting-form-group">
            <label htmlFor="meeting_name" className="meeting-form-label">
              Meeting Name <span className="required">*</span>
            </label>
            <Input
              id="meeting_name"
              name="meeting_name"
              value={formData.meeting_name}
              onChange={handleInputChange}
              placeholder="e.g., Requirements Gathering Session"
              error={errors.meeting_name}
              disabled={loading}
            />
          </div>

          <div className="meeting-form-group">
            <label htmlFor="meeting_datetime" className="meeting-form-label">
              Date & Time <span className="required">*</span>
            </label>
            <Input
              id="meeting_datetime"
              name="meeting_datetime"
              type="datetime-local"
              value={formData.meeting_datetime}
              onChange={handleInputChange}
              error={errors.meeting_datetime}
              disabled={loading}
            />
          </div>

          <div className="meeting-form-group">
            <label htmlFor="stakeholders" className="meeting-form-label">
              Stakeholders
            </label>
            <Input
              id="stakeholders"
              name="stakeholders"
              value={formData.stakeholders}
              onChange={handleInputChange}
              placeholder="e.g., Sarah Chen, Mike Johnson, Alex Kim"
              disabled={loading}
            />
          </div>

          <div className="meeting-form-group">
            <label htmlFor="status" className="meeting-form-label">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="meeting-form-select"
              disabled={loading}
            >
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="meeting-form-group">
            <label htmlFor="meeting_details" className="meeting-form-label">
              Meeting Details
            </label>
            <textarea
              id="meeting_details"
              name="meeting_details"
              value={formData.meeting_details}
              onChange={handleInputChange}
              placeholder="Add any notes or context about this meeting..."
              className="meeting-form-textarea"
              rows="4"
              disabled={loading}
            />
          </div>

          {!meeting && (
            <div className="meeting-form-group">
              <label className="meeting-form-label">
                Upload Files (Optional)
              </label>
              <p className="meeting-form-hint">
                Upload meeting transcripts, notes, or documents to extract insights automatically.
                Supported formats: PDF, DOCX, TXT
              </p>

              <div className="meeting-file-upload">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept=".pdf,.docx,.doc,.txt"
                  onChange={handleFileSelect}
                  className="meeting-file-input"
                  disabled={loading}
                />
                <label htmlFor="file-upload" className="meeting-file-label">
                  <span className="material-symbols-outlined">upload_file</span>
                  Choose Files
                </label>
              </div>

              {files.length > 0 && (
                <div className="meeting-files-list">
                  {files.map((file, index) => (
                    <div key={index} className="meeting-file-item">
                      <div className="meeting-file-info">
                        <span className="material-symbols-outlined">description</span>
                        <div className="meeting-file-details">
                          <span className="meeting-file-name">{file.name}</span>
                          <span className="meeting-file-size">{formatFileSize(file.size)}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="meeting-file-remove"
                        disabled={loading}
                      >
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="meeting-form-actions">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? (
              <>
                <Spinner size="small" />
                {processingFiles ? 'Processing...' : 'Saving...'}
              </>
            ) : meeting ? (
              'Update Meeting'
            ) : (
              'Create Meeting'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default MeetingForm;

