import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { brdAPI } from '../../services/api';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import DocumentationNavigation from '../viewer/components/DocumentationNavigation';
import DocumentationDetails from '../viewer/components/DocumentationDetails';
import { generateBRDSections } from './utils/brdSections';
import './BRDView.css';

const BRDView = () => {
  const { workspaceId } = useParams();
  const [loading, setLoading] = useState(true);
  const [brdData, setBrdData] = useState(null);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('business-units-teams');
  const [requirementStatuses, setRequirementStatuses] = useState({});

  useEffect(() => {
    fetchBRDData();
  }, [workspaceId]);

  const fetchBRDData = async () => {
    try {
      setLoading(true);
      setError(null);
      const payload = { workspace_id: workspaceId };
      const response = await brdAPI.getBRD(payload);
      setBrdData(response.data);
    } catch (err) {
      console.error('Error fetching BRD data:', err);
      setError('Failed to load BRD data');
    } finally {
      setLoading(false);
    }
  };

  const handleRequirementAction = (requirementIndex, action) => {
    setRequirementStatuses(prev => ({
      ...prev,
      [requirementIndex]: action
    }));
    
    // Here you could also make an API call to update the requirement status
    console.log(`Requirement ${requirementIndex} ${action}ed`);
  };


  if (loading) {
    return (
      <div className="brd-loading">
        <Spinner />
        <p>Loading BRD data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="brd-error">
        <p>{error}</p>
        <Button onClick={fetchBRDData}>Retry</Button>
      </div>
    );
  }

  if (!brdData) {
    return (
      <div className="brd-empty">
        <p>No BRD data available</p>
        <Button onClick={fetchBRDData}>Refresh</Button>
      </div>
    );
  }

  const sections = generateBRDSections(brdData, requirementStatuses, handleRequirementAction);

  return (
    <div className="brd-viewer-container">
      <div className="brd-viewer-header">
        <div className="brd-viewer-header-left">
          <div className="brd-viewer-header-info">
            <h1 className="brd-viewer-title">Business Requirements Document (BRD)</h1>
          </div>
        </div>
        <div className="brd-viewer-header-right">
          <Button onClick={fetchBRDData} variant="secondary">
            <span className="material-symbols-outlined">refresh</span>
            Refresh
          </Button>
        </div>
      </div>
      <div className="brd-viewer-documentation">
        <div className="brd-viewer-navigation">
          <DocumentationNavigation 
            sections={sections}
            activeSection={activeSection}
            onSectionSelect={setActiveSection}
          />
        </div>
        <div className="brd-viewer-details">
          <DocumentationDetails 
            activeSection={activeSection}
            sections={sections}
            sowData={brdData}
            currentWorkspace={null}
            currentDocument={null}
          />
        </div>
      </div>
    </div>
  );
};

export default BRDView;
