import React, { useState } from 'react';
import './SoWViewer.css';
import Button from '../../components/common/Button';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import DocumentationNavigation from './components/DocumentationNavigation';
import DocumentationDetails from './components/DocumentationDetails';
import { generateDocumentationSections } from './utils/documentationSections';

const AssumptionsSection = ({ assumptions }) => (
  assumptions && assumptions.length > 0 && (
    <div className="sow-viewer-section">
      <div className="sow-viewer-card">
        <h2 className="sow-viewer-section-title">
          <span className="material-symbols-outlined">info</span>
          Assumptions
        </h2>
        <ul className="sow-viewer-assumptions-list">
          {assumptions.map((assumption, index) => (
            <li key={index} className="sow-viewer-assumption-item">{assumption}</li>
          ))}
        </ul>
      </div>
    </div>
  )
);

const ValidationSection = ({ validation }) => (
  validation && (
    <div className="sow-viewer-section">
      <div className="sow-viewer-card sow-viewer-validation">
        <h2 className="sow-viewer-section-title">
          <span className="material-symbols-outlined">verified</span>
          Validation Summary
        </h2>
        <div className="sow-viewer-validation-content">
          <div className="sow-viewer-validation-item">
            <span className="sow-viewer-validation-label">JSON Validity:</span>
            <span className={`sow-viewer-validation-badge ${validation.json_validity ? 'valid' : 'invalid'}`}>
              {validation.json_validity ? 'Valid' : 'Invalid'}
            </span>
          </div>
          {validation.issues_detected && validation.issues_detected.length > 0 && (
            <div className="sow-viewer-validation-issues">
              <span className="sow-viewer-validation-label">Issues:</span>
              <ul>
                {validation.issues_detected.map((issue, index) => (<li key={index}>{issue}</li>))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
);

const SoWViewer = ({ onBack }) => {
  const { sowData, currentWorkspace, currentDocument } = useWorkspace();
  const [activeSection, setActiveSection] = useState('project-overview');

  console.log('SoWViewer - Current workspace:', currentWorkspace);
  console.log('SoWViewer - Current document:', currentDocument);
  console.log('SoWViewer - SoW data:', sowData);

  if (!sowData) {
    return (
      <div className="sow-viewer-empty">
        <p>No SoW data available for this workspace</p>
        {currentWorkspace && <p>Workspace: {currentWorkspace.name}</p>}
        {currentDocument && <p>Document: {currentDocument.file_name}</p>}
        <Button onClick={onBack} variant="secondary">Back to Workspaces</Button>
      </div>
    );
  }

  const sections = generateDocumentationSections(sowData);

  return (
    <div className="sow-viewer-container">
      <div className="sow-viewer-header">
        <div className="sow-viewer-header-left">
          <Button onClick={onBack} variant="secondary" icon="arrow_back" size="small">Back</Button>
          <div className="sow-viewer-header-info">
            <h1 className="sow-viewer-title">Statement of Work</h1>
            {currentWorkspace && <p className="sow-viewer-workspace">{currentWorkspace.name}</p>}
          </div>
        </div>
      </div>
      <div className="sow-viewer-documentation">
        <div className="sow-viewer-navigation">
          <DocumentationNavigation 
            sections={sections}
            activeSection={activeSection}
            onSectionSelect={setActiveSection}
          />
        </div>
        <div className="sow-viewer-details">
          <DocumentationDetails 
            activeSection={activeSection}
            sections={sections}
            sowData={sowData}
            currentWorkspace={currentWorkspace}
            currentDocument={currentDocument}
          />
        </div>
      </div>
    </div>
  );
};

export default SoWViewer;

