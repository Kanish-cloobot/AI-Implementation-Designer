import React, { useState } from 'react';
import './SoWViewer.css';
import Button from '../../components/common/Button';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import DocumentationNavigation from './components/DocumentationNavigation';
import DocumentationDetails from './components/DocumentationDetails';
import { generateDocumentationSections } from './utils/documentationSections';


const SoWViewer = ({ onBack = () => {} }) => {
  const { sowData, currentWorkspace, currentDocument, expandSidebar } = useWorkspace();
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
          <Button onClick={() => { expandSidebar(); onBack(); }} variant="secondary" icon="arrow_back" size="small">Back</Button>
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

