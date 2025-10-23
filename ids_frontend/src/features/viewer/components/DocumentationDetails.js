import React from 'react';
import './DocumentationDetails.css';
import Button from '../../../components/common/Button';

const DocumentationDetails = ({ 
  activeSection, 
  sections, 
  sowData, 
  currentWorkspace, 
  currentDocument 
}) => {
  const getSectionContent = (sectionId) => {
    const section = findSectionById(sections, sectionId);
    return section ? section.content : null;
  };

  const findSectionById = (sections, id) => {
    for (const section of sections) {
      if (section.id === id) return section;
      if (section.children) {
        const found = findSectionById(section.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const getActiveSectionTitle = () => {
    const section = findSectionById(sections, activeSection);
    return section ? section.title : 'Details';
  };

  const content = getSectionContent(activeSection);

  return (
    <div className="doc-details">
      <div className="doc-details-header">
        <div className="doc-details-header-left">
          <h2 className="doc-details-title">Details</h2>
          <div className="doc-details-tabs">
            <div className="doc-details-tab active">
              {getActiveSectionTitle()}
            </div>
          </div>
        </div>
        {/* <div className="doc-details-header-right">
          <Button 
            variant="secondary" 
            size="small" 
            icon="open_in_new"
            onClick={() => {
              // TODO: Implement SDLC integration
              console.log('Open in SDLC clicked');
            }}
          >
            Open in SDLC
          </Button>
        </div> */}
      </div>
      
      <div className="doc-details-content">
        {content ? (
          <div className="doc-details-section">
            <h1 className="doc-details-main-title">{getActiveSectionTitle()}</h1>
            <div className="doc-details-main-content">
              {content}
            </div>
          </div>
        ) : (
          <div className="doc-details-empty">
            <p>Select a section from the navigation to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentationDetails;
