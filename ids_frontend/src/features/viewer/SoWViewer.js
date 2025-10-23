import React from 'react';
import './SoWViewer.css';
import Button from '../../components/common/Button';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import ScopeSummary from './components/ScopeSummary';
import ModulesAndProcesses from './components/ModulesAndProcesses';
import Stakeholders from './components/Stakeholders';
import LicenseList from './components/LicenseList';

const SoWViewer = ({ onBack }) => {
  const { sowData, currentWorkspace } = useWorkspace();

  if (!sowData) {
    return (
      <div className="sow-viewer-empty">
        <p>No SoW data available</p>
        <Button onClick={onBack} variant="secondary">
          Back to Workspaces
        </Button>
      </div>
    );
  }

  return (
    <div className="sow-viewer-container">
      <div className="sow-viewer-header">
        <div className="sow-viewer-header-left">
          <Button onClick={onBack} variant="secondary" icon="arrow_back" size="small">
            Back
          </Button>
          <div className="sow-viewer-header-info">
            <h1 className="sow-viewer-title">Statement of Work</h1>
            {currentWorkspace && (
              <p className="sow-viewer-workspace">{currentWorkspace.name}</p>
            )}
          </div>
        </div>
      </div>

      <div className="sow-viewer-content">
        <div className="sow-viewer-section">
          <ScopeSummary data={sowData.scope_summary} />
        </div>

        <div className="sow-viewer-section">
          <ModulesAndProcesses data={sowData.modules} />
        </div>

        <div className="sow-viewer-grid">
          <div className="sow-viewer-section">
            <Stakeholders data={sowData.business_units} />
          </div>

          <div className="sow-viewer-section">
            <LicenseList data={sowData.salesforce_licenses} />
          </div>
        </div>

        {sowData.assumptions && sowData.assumptions.length > 0 && (
          <div className="sow-viewer-section">
            <div className="sow-viewer-card">
              <h2 className="sow-viewer-section-title">
                <span className="material-symbols-outlined">info</span>
                Assumptions
              </h2>
              <ul className="sow-viewer-assumptions-list">
                {sowData.assumptions.map((assumption, index) => (
                  <li key={index} className="sow-viewer-assumption-item">
                    {assumption}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {sowData.validation_summary && (
          <div className="sow-viewer-section">
            <div className="sow-viewer-card sow-viewer-validation">
              <h2 className="sow-viewer-section-title">
                <span className="material-symbols-outlined">verified</span>
                Validation Summary
              </h2>
              <div className="sow-viewer-validation-content">
                <div className="sow-viewer-validation-item">
                  <span className="sow-viewer-validation-label">JSON Validity:</span>
                  <span className={`sow-viewer-validation-badge ${
                    sowData.validation_summary.json_validity ? 'valid' : 'invalid'
                  }`}>
                    {sowData.validation_summary.json_validity ? 'Valid' : 'Invalid'}
                  </span>
                </div>
                {sowData.validation_summary.issues_detected && 
                 sowData.validation_summary.issues_detected.length > 0 && (
                  <div className="sow-viewer-validation-issues">
                    <span className="sow-viewer-validation-label">Issues:</span>
                    <ul>
                      {sowData.validation_summary.issues_detected.map((issue, index) => (
                        <li key={index}>{issue}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SoWViewer;

