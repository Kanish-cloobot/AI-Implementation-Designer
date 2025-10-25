import React from 'react';

/**
 * Extracts all source references from a data object recursively
 * @param {Object} data - The data object to search for source references
 * @param {Array} references - Accumulator array for references
 * @returns {Array} Array of all source references found
 */
export const extractSourceReferences = (data, references = []) => {
  if (!data || typeof data !== 'object') {
    return references;
  }

  // Check if current object has source_references
  if (data.source_references && Array.isArray(data.source_references)) {
    references.push(...data.source_references);
  }

  // Recursively search through all properties
  Object.values(data).forEach(value => {
    if (Array.isArray(value)) {
      value.forEach(item => {
        if (typeof item === 'object' && item !== null) {
          extractSourceReferences(item, references);
        }
      });
    } else if (typeof value === 'object' && value !== null) {
      extractSourceReferences(value, references);
    }
  });

  return references;
};

/**
 * Creates a clickable source reference indicator
 * @param {Array} sourceReferences - Array of source references
 * @param {Function} onSourceClick - Callback function when source is clicked
 * @returns {JSX.Element|null} Source reference indicator or null
 */
export const createSourceReferenceIndicator = (sourceReferences, onSourceClick) => {
  if (!sourceReferences || sourceReferences.length === 0) {
    return null;
  }

  const totalReferences = sourceReferences.length;
  const highConfidenceCount = sourceReferences.filter(ref => ref.confidence >= 0.8).length;
  const mediumConfidenceCount = sourceReferences.filter(ref => ref.confidence >= 0.6 && ref.confidence < 0.8).length;
  const lowConfidenceCount = sourceReferences.filter(ref => ref.confidence < 0.6).length;

  return (
    <div 
      className="source-reference-indicator"
      onClick={() => onSourceClick(sourceReferences)}
      title={`${totalReferences} source references available`}
    >
      <span className="material-symbols-outlined">source_notes</span>
      <span className="reference-count">{totalReferences}</span>
      {highConfidenceCount > 0 && (
        <span className="confidence-indicator high" title={`${highConfidenceCount} high confidence`}></span>
      )}
      {mediumConfidenceCount > 0 && (
        <span className="confidence-indicator medium" title={`${mediumConfidenceCount} medium confidence`}></span>
      )}
      {lowConfidenceCount > 0 && (
        <span className="confidence-indicator low" title={`${lowConfidenceCount} low confidence`}></span>
      )}
    </div>
  );
};

/**
 * Renders source references for a specific data item
 * @param {Object} item - The data item that may contain source references
 * @param {Function} onSourceClick - Callback function when source is clicked
 * @returns {JSX.Element|null} Source reference indicator or null
 */
export const renderSourceReferences = (item, onSourceClick) => {
  if (!item || !item.source_references || item.source_references.length === 0) {
    return null;
  }

  return createSourceReferenceIndicator(item.source_references, onSourceClick);
};

/**
 * Creates a table cell with source reference indicator
 * @param {*} value - The cell value
 * @param {Object} item - The full item object
 * @param {Function} onSourceClick - Callback function when source is clicked
 * @returns {JSX.Element} Table cell with source reference
 */
export const createTableCellWithSource = (value, item, onSourceClick) => {
  return (
    <div className="table-cell-with-source">
      <span className="cell-value">{value || '-'}</span>
      {renderSourceReferences(item, onSourceClick)}
    </div>
  );
};

/**
 * Creates a section header with source reference indicator
 * @param {string} title - The section title
 * @param {Object} sectionData - The section data that may contain source references
 * @param {Function} onSourceClick - Callback function when source is clicked
 * @returns {JSX.Element} Section header with source reference
 */
export const createSectionHeaderWithSource = (title, sectionData, onSourceClick) => {
  return (
    <div className="section-header-with-source">
      <h3 className="section-title">{title}</h3>
      {renderSourceReferences(sectionData, onSourceClick)}
    </div>
  );
};
