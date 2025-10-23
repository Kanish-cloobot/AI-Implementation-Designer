import React, { useState } from 'react';
import './DocumentUploadModal.css';
import Modal from '../../components/common/Modal';
import Button from '../../components/common/Button';
import { useWorkspace } from '../../contexts/WorkspaceContext';

const DocumentUploadModal = ({ isOpen, onClose, onSuccess, workspace }) => {
  const { uploadAndProcessDocument, loading } = useWorkspace();
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const [processingStatus, setProcessingStatus] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    handleFile(file);
  };

  const handleFile = (file) => {
    if (!file) return;

    const validTypes = ['application/pdf', 'application/msword', 
                       'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                       'text/plain'];
    
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid document (PDF, DOC, DOCX, or TXT)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setError('');
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    if (!workspace) {
      setError('No workspace selected');
      return;
    }

    try {
      setProcessingStatus('Uploading document...');
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setProcessingStatus('Processing with AI...');
      await uploadAndProcessDocument(workspace.workspace_id, selectedFile);
      
      setProcessingStatus('Extraction complete!');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSuccess();
    } catch (err) {
      setError(err.message || 'Failed to process document');
      setProcessingStatus('');
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedFile(null);
      setError('');
      setProcessingStatus('');
      onClose();
    }
  };

  const footer = (
    <>
      <Button onClick={handleClose} variant="secondary" disabled={loading}>
        Cancel
      </Button>
      <Button 
        onClick={handleSubmit} 
        variant="primary" 
        loading={loading}
        disabled={!selectedFile || loading}
      >
        Upload & Process
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Upload Statement of Work"
      footer={footer}
      size="medium"
      closeOnOverlayClick={!loading}
    >
      <div className="document-upload-container">
        <p className="document-upload-description">
          Upload your Statement of Work or Sales Hand-off document to extract implementation insights.
        </p>

        <div
          className={`document-upload-dropzone ${dragActive ? 'active' : ''} ${
            selectedFile ? 'has-file' : ''
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !loading && document.getElementById('file-input').click()}
        >
          <input
            id="file-input"
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
            style={{ display: 'none' }}
            disabled={loading}
          />
          
          {selectedFile ? (
            <div className="document-upload-file-info">
              <span className="material-symbols-outlined document-upload-file-icon">
                description
              </span>
              <div className="document-upload-file-details">
                <p className="document-upload-file-name">{selectedFile.name}</p>
                <p className="document-upload-file-size">
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
              {!loading && (
                <button
                  className="document-upload-remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              )}
            </div>
          ) : (
            <>
              <span className="material-symbols-outlined document-upload-icon">
                cloud_upload
              </span>
              <p className="document-upload-text">
                <strong>Click to upload</strong> or drag and drop
              </p>
              <p className="document-upload-hint">
                PDF, DOC, DOCX, or TXT (Max 10MB)
              </p>
            </>
          )}
        </div>

        {error && <div className="document-upload-error">{error}</div>}
        
        {processingStatus && (
          <div className="document-upload-status">
            <span className="material-symbols-outlined document-upload-status-icon">
              pending
            </span>
            <span>{processingStatus}</span>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default DocumentUploadModal;

