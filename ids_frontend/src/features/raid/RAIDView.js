import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { raidAPI } from '../../services/api';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import DocumentationNavigation from '../viewer/components/DocumentationNavigation';
import DocumentationDetails from '../viewer/components/DocumentationDetails';
import SourceViewer from '../../components/common/SourceViewer';
import { generateRAIDSections } from './utils/raidSections';
import './RAIDView.css';

const RAIDView = () => {
  const { workspaceId } = useParams();
  const [loading, setLoading] = useState(true);
  const [raidData, setRaidData] = useState(null);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('risks-issues');
  const [riskIssueStatuses, setRiskIssueStatuses] = useState({});
  const [showSourceViewer, setShowSourceViewer] = useState(false);
  const [currentSourceReferences, setCurrentSourceReferences] = useState([]);

  useEffect(() => {
    fetchRAIDData();
  }, [workspaceId]);

  const fetchRAIDData = async () => {
    try {
      setLoading(true);
      setError(null);
      const payload = { workspace_id: workspaceId };
      const response = await raidAPI.getRAID(payload);
      setRaidData(response.data);
    } catch (err) {
      console.error('Error fetching RAID data:', err);
      setError('Failed to load RAID data');
    } finally {
      setLoading(false);
    }
  };

  const handleRiskIssueAction = (riskIssueIndex, action) => {
    setRiskIssueStatuses(prev => ({
      ...prev,
      [riskIssueIndex]: action
    }));
    
    // Here you could also make an API call to update the risk/issue status
    console.log(`Risk/Issue ${riskIssueIndex} ${action}ed`);
  };

  const handleSourceClick = (sourceReferences) => {
    setCurrentSourceReferences(sourceReferences);
    setShowSourceViewer(true);
  };

  const handleCloseSourceViewer = () => {
    setShowSourceViewer(false);
    setCurrentSourceReferences([]);
  };


  if (loading) {
    return (
      <div className="raid-loading">
        <Spinner />
        <p>Loading RAID data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="raid-error">
        <p>{error}</p>
        <Button onClick={fetchRAIDData}>Retry</Button>
      </div>
    );
  }

  if (!raidData) {
    return (
      <div className="raid-empty">
        <p>No RAID data available</p>
        <Button onClick={fetchRAIDData}>Refresh</Button>
      </div>
    );
  }

  const sections = generateRAIDSections(raidData, riskIssueStatuses, handleRiskIssueAction, handleSourceClick);

  return (
    <div className="raid-viewer-container">
      <div className="raid-viewer-header">
        <div className="raid-viewer-header-left">
          <div className="raid-viewer-header-info">
            <h1 className="raid-viewer-title">RAID Log</h1>
          </div>
        </div>
        <div className="raid-viewer-header-right">
          <Button onClick={fetchRAIDData} variant="secondary">
            <span className="material-symbols-outlined">refresh</span>
            Refresh
          </Button>
        </div>
      </div>
      <div className="raid-viewer-documentation">
        <div className="raid-viewer-navigation">
          <DocumentationNavigation 
            sections={sections}
            activeSection={activeSection}
            onSectionSelect={setActiveSection}
          />
        </div>
        <div className="raid-viewer-details">
          <DocumentationDetails 
            activeSection={activeSection}
            sections={sections}
            sowData={raidData}
            currentWorkspace={null}
            currentDocument={null}
          />
        </div>
      </div>
      
      {showSourceViewer && (
        <SourceViewer 
          sourceReferences={currentSourceReferences}
          onClose={handleCloseSourceViewer}
        />
      )}
    </div>
  );
};

export default RAIDView;
