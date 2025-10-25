import React, { useState } from 'react';
import './SourceViewer.css';

const SourceViewer = ({ sourceReferences, onClose }) => {
  const [activeReference, setActiveReference] = useState(null);

  if (!sourceReferences || sourceReferences.length === 0) {
    return null;
  }

  const handleReferenceClick = (reference) => {
    setActiveReference(reference);
  };

  const renderSourceReference = (reference, index) => {
    const confidenceColor = reference.confidence >= 0.8 ? '#4CAF50' : 
                           reference.confidence >= 0.6 ? '#FF9800' : '#F44336';
    
    return (
      <div 
        key={index} 
        className="source-reference-item"
        onClick={() => handleReferenceClick(reference)}
      >
        <div className="source-reference-header">
          <div className="source-reference-file">
            <span className="material-symbols-outlined">description</span>
            <span className="file-name">{reference.file_name}</span>
          </div>
          <div className="source-reference-confidence" style={{ backgroundColor: confidenceColor }}>
            {Math.round(reference.confidence * 100)}%
          </div>
        </div>
        
        <div className="source-reference-section">
          <span className="material-symbols-outlined">location_on</span>
          <span className="section-name">{reference.page_section}</span>
        </div>
        
        <div className="source-reference-quote">
          <span className="quote-text">"{reference.quote_text}"</span>
        </div>
      </div>
    );
  };

  const renderDetailedView = () => {
    if (!activeReference) return null;

    return (
      <div className="source-reference-detail">
        <div className="source-reference-detail-header">
          <h3>Source Reference Details</h3>
          <button 
            className="close-detail-btn"
            onClick={() => setActiveReference(null)}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="source-reference-detail-content">
          <div className="detail-section">
            <h4>File Information</h4>
            <div className="detail-item">
              <span className="detail-label">File Name:</span>
              <span className="detail-value">{activeReference.file_name}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Section:</span>
              <span className="detail-value">{activeReference.page_section}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Confidence:</span>
              <span className="detail-value confidence-badge" style={{ 
                backgroundColor: activeReference.confidence >= 0.8 ? '#4CAF50' : 
                                activeReference.confidence >= 0.6 ? '#FF9800' : '#F44336'
              }}>
                {Math.round(activeReference.confidence * 100)}%
              </span>
            </div>
          </div>
          
          <div className="detail-section">
            <h4>Quote</h4>
            <div className="quote-detail">
              <span className="quote-mark">"</span>
              <span className="quote-text-detail">{activeReference.quote_text}</span>
              <span className="quote-mark">"</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="source-viewer-overlay">
      <div className="source-viewer-container">
        <div className="source-viewer-header">
          <h2>Source References</h2>
          <button className="close-viewer-btn" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div className="source-viewer-content">
          <div className="source-references-list">
            <h3>All References ({sourceReferences.length})</h3>
            <div className="references-container">
              {sourceReferences.map((reference, index) => 
                renderSourceReference(reference, index)
              )}
            </div>
          </div>
          
          {activeReference && (
            <div className="source-reference-detail-panel">
              {renderDetailedView()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SourceViewer;
