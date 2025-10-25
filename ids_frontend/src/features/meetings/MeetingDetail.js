import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { meetingAPI } from '../../services/api';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import DocumentationNavigation from '../viewer/components/DocumentationNavigation';
import DocumentationDetails from '../viewer/components/DocumentationDetails';
import SourceViewer from '../../components/common/SourceViewer';
import { generateMeetingSections } from './utils/meetingSections';
import { extractSourceReferences } from '../../utils/sourceReferenceUtils';
import './MeetingDetail.css';

const MeetingDetail = () => {
  const { workspaceId, meetingId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [meetingData, setMeetingData] = useState(null);
  const [activeTab, setActiveTab] = useState('outline');
  const [activeSection, setActiveSection] = useState('meeting-overview');
  const [showSourceViewer, setShowSourceViewer] = useState(false);
  const [currentSourceReferences, setCurrentSourceReferences] = useState([]);

  useEffect(() => {
    fetchMeetingDetail();
  }, [meetingId]);

  const fetchMeetingDetail = async () => {
    try {
      setLoading(true);
      const payload = { meeting_id: meetingId };
      const response = await meetingAPI.getDetail(payload);
      setMeetingData(response.data);
    } catch (error) {
      console.error('Error fetching meeting detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSourceClick = (sourceReferences) => {
    setCurrentSourceReferences(sourceReferences);
    setShowSourceViewer(true);
  };

  const handleCloseSourceViewer = () => {
    setShowSourceViewer(false);
    setCurrentSourceReferences([]);
  };


  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'Not set';
    const date = new Date(dateTimeStr);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };


  const renderOverview = () => {
    if (!meetingData) return null;

    const { meeting, files } = meetingData;

    return (
      <div className="meeting-overview">
        <div className="meeting-meta-grid">
          <div className="meeting-meta-item">
            <span className="material-symbols-outlined">schedule</span>
            <div>
              <span className="meta-label">Date & Time</span>
              <span className="meta-value">{formatDateTime(meeting.meeting_datetime)}</span>
            </div>
          </div>

          <div className="meeting-meta-item">
            <span className="material-symbols-outlined">label</span>
            <div>
              <span className="meta-label">Status</span>
              <span className={`status-badge ${meeting.status}`}>
                {meeting.status}
              </span>
            </div>
          </div>

          {meeting.stakeholders && (
            <div className="meeting-meta-item">
              <span className="material-symbols-outlined">group</span>
              <div>
                <span className="meta-label">Stakeholders</span>
                <span className="meta-value">{meeting.stakeholders}</span>
              </div>
            </div>
          )}

          {files && files.length > 0 && (
            <div className="meeting-meta-item">
              <span className="material-symbols-outlined">attach_file</span>
              <div>
                <span className="meta-label">Files</span>
                <span className="meta-value">{files.length} uploaded</span>
              </div>
            </div>
          )}
        </div>

        {meeting.meeting_details && (
          <div className="meeting-details-section">
            <h3>Meeting Details</h3>
            <p>{meeting.meeting_details}</p>
          </div>
        )}

        {files && files.length > 0 && (
          <div className="meeting-files-section">
            <h3>Uploaded Files</h3>
            <div className="meeting-files-list">
              {files.map((file) => (
                <div key={file.file_id} className="meeting-file-card">
                  <span className="material-symbols-outlined">description</span>
                  <span className="file-name">{file.file_name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };


  if (loading) {
    return (
      <div className="meeting-detail-loading">
        <Spinner />
      </div>
    );
  }

  if (!meetingData) {
    return (
      <div className="meeting-detail-error">
        <p>Meeting not found</p>
        <Button onClick={() => navigate(`/workspace/${workspaceId}`)}>Back to Workspace</Button>
      </div>
    );
  }

  const { meeting, extractions } = meetingData;

  const sections = generateMeetingSections(meetingData, handleSourceClick);

  return (
    <div className="meeting-detail-container">
      <div className="meeting-detail-header">
        {/* <Button
          variant="secondary"
          onClick={() => navigate(`/workspace/${workspaceId}`)}
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Workspace
        </Button> */}

        <h1 className="meeting-detail-title">{meeting.meeting_name}</h1>
      </div>

      <div className="meeting-detail-tabs">
        <button
          className={`detail-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
      </div>

      <div className="meeting-detail-content">
        {activeTab === 'overview' && renderOverview()}

        {activeTab !== 'overview' && (
          <div className="meeting-outline-container">
            <div className="meeting-outline-navigation">
              <DocumentationNavigation 
                sections={sections}
                activeSection={activeSection}
                onSectionSelect={setActiveSection}
              />
            </div>
            <div className="meeting-outline-details">
              <DocumentationDetails 
                activeSection={activeSection}
                sections={sections}
                sowData={meetingData}
                currentWorkspace={null}
                currentDocument={null}
              />
            </div>
          </div>
        )}

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

export default MeetingDetail;

