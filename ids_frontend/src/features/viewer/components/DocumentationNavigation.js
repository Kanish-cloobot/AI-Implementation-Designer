import React, { useState } from 'react';
import './DocumentationNavigation.css';

const DocumentationNavigation = ({ sections, activeSection, onSectionSelect }) => {
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const renderSection = (section, level = 0) => {
    const isExpanded = expandedSections[section.id];
    const isActive = activeSection === section.id;
    const hasChildren = section.children && section.children.length > 0;

    return (
      <div key={section.id} className="doc-nav-item">
        <div 
          className={`doc-nav-section ${isActive ? 'active' : ''}`}
          style={{ paddingLeft: `${level * 16 + 12}px` }}
          onClick={() => {
            if (hasChildren) {
              toggleSection(section.id);
            } else {
              onSectionSelect(section.id);
            }
          }}
        >
          <div className="doc-nav-section-content">
            {hasChildren && (
              <span className="material-symbols-outlined doc-nav-expand-icon">
                {isExpanded ? 'expand_less' : 'expand_more'}
              </span>
            )}
            <span className="material-symbols-outlined doc-nav-icon">
              {section.icon || 'description'}
            </span>
            <span className="doc-nav-title">{section.title}</span>
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="doc-nav-children">
            {section.children.map(child => renderSection(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="doc-navigation">
      <div className="doc-nav-header">
        <h2 className="doc-nav-title">Documentation Outline</h2>
      </div>
      <div className="doc-nav-content">
        {sections.map(section => renderSection(section))}
      </div>
    </div>
  );
};

export default DocumentationNavigation;
