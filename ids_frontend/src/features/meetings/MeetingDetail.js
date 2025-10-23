import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { meetingAPI } from '../../services/api';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import './MeetingDetail.css';

const MeetingDetail = () => {
  const { workspaceId, meetingId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [meetingData, setMeetingData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({});

  useEffect(() => {
    fetchMeetingDetail();
  }, [meetingId]);

  const fetchMeetingDetail = async () => {
    try {
      setLoading(true);
      const response = await meetingAPI.getDetail(meetingId);
      setMeetingData(response.data);
    } catch (error) {
      console.error('Error fetching meeting detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
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

  const renderCountBadge = (count, color = 'default') => {
    if (!count || count === 0) return null;
    return <span className={`count-badge ${color}`}>{count}</span>;
  };

  const renderSection = (title, data, renderContent, icon, color = 'default') => {
    const count = Array.isArray(data) ? data.length : 0;
    const isExpanded = expandedSections[title] !== false;

    return (
      <div className="extraction-section">
        <div className="extraction-section-header" onClick={() => toggleSection(title)}>
          <div className="extraction-section-title">
            <span className={`material-symbols-outlined icon-${color}`}>{icon}</span>
            <h3>{title}</h3>
            {renderCountBadge(count, color)}
          </div>
          <span className="material-symbols-outlined">
            {isExpanded ? 'expand_less' : 'expand_more'}
          </span>
        </div>
        {isExpanded && (
          <div className="extraction-section-content">
            {count === 0 ? (
              <p className="extraction-empty">No {title.toLowerCase()} extracted</p>
            ) : (
              renderContent(data)
            )}
          </div>
        )}
      </div>
    );
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

  const renderRequirements = (data) => (
    <div className="extraction-items">
      {data.map((item, index) => (
        <div key={index} className="extraction-item">
          <div className="extraction-item-header">
            <span className="item-type-badge">{item.requirement_type}</span>
          </div>
          <p className="item-description">{item.description_md}</p>
          {item.acceptance_criteria && item.acceptance_criteria.length > 0 && (
            <div className="item-criteria">
              <strong>Acceptance Criteria:</strong>
              <ul>
                {item.acceptance_criteria.map((criteria, idx) => (
                  <li key={idx}>{criteria}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderActionItems = (data) => (
    <div className="extraction-items">
      {data.map((item, index) => (
        <div key={index} className="extraction-item action-item">
          <div className="action-item-header">
            <span className={`action-status ${item.item_status}`}>{item.item_status}</span>
            {item.due_date && <span className="action-date">{item.due_date}</span>}
          </div>
          <p className="item-description">{item.task_md}</p>
          {item.owner_md && (
            <div className="item-owner">
              <span className="material-symbols-outlined">person</span>
              {item.owner_md}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderDecisions = (data) => (
    <div className="extraction-items">
      {data.map((item, index) => (
        <div key={index} className="extraction-item decision-item">
          <p className="item-description">{item.decision_md}</p>
          {item.rationale_md && (
            <div className="item-rationale">
              <strong>Rationale:</strong> {item.rationale_md}
            </div>
          )}
          <div className="decision-meta">
            {item.decided_on && <span>Decided on: {item.decided_on}</span>}
            {item.approver_md && <span>Approver: {item.approver_md}</span>}
          </div>
        </div>
      ))}
    </div>
  );

  const renderRisksIssues = (data) => (
    <div className="extraction-items">
      {data.map((item, index) => (
        <div key={index} className="extraction-item risk-item">
          <div className="risk-header">
            <span className={`risk-type ${item.type}`}>{item.type}</span>
            {item.due_date && <span className="risk-date">{item.due_date}</span>}
          </div>
          <p className="item-description">{item.description_md}</p>
          {item.impact_md && (
            <div className="risk-detail">
              <strong>Impact:</strong> {item.impact_md}
            </div>
          )}
          {item.mitigation_md && (
            <div className="risk-detail">
              <strong>Mitigation:</strong> {item.mitigation_md}
            </div>
          )}
          {item.owner_md && (
            <div className="item-owner">
              <span className="material-symbols-outlined">person</span>
              {item.owner_md}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderGenericList = (data, fields) => (
    <div className="extraction-items">
      {data.map((item, index) => (
        <div key={index} className="extraction-item generic-item">
          {fields.map((field) => {
            const value = item[field.key];
            if (!value) return null;

            return (
              <div key={field.key} className="generic-field">
                <strong>{field.label}:</strong>
                {Array.isArray(value) ? (
                  <ul>
                    {value.map((v, idx) => (
                      <li key={idx}>{v}</li>
                    ))}
                  </ul>
                ) : (
                  <span>{value}</span>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );

  const renderUnifiedTable = () => {
    if (!extractions) return null;

    const groupedExtractions = [];
    
    // Group extraction data by type
    Object.entries(extractions).forEach(([type, data]) => {
      if (Array.isArray(data) && data.length > 0) {
        groupedExtractions.push({
          type: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          items: data
        });
      }
    });

    return (
      <div className="unified-extractions-table">
        <table className="extractions-table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {groupedExtractions.map((group, groupIndex) => (
              <tr key={group.type}>
                <td className="extraction-type">
                  <span className="type-badge">{group.type}</span>
                </td>
                <td className="extraction-details">
                  <div className="extraction-content">
                    {group.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="extraction-item-group">
                        {Object.entries(item).map(([key, value]) => {
                          if (!value || key === 'id' || key === 'meeting_id' || key === 'workspace_id' || key === 'org_id' || key === 'status' || key === 'created_at' || key === 'updated_at') return null;
                          
                          return (
                            <div key={key} className="extraction-field">
                              <strong>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:</strong>
                              {Array.isArray(value) ? (
                                <ul>
                                  {value.map((v, idx) => (
                                    <li key={idx}>{v}</li>
                                  ))}
                                </ul>
                              ) : (
                                <span>{value}</span>
                              )}
                            </div>
                          );
                        })}
                        {itemIndex < group.items.length - 1 && <hr className="item-separator" />}
                      </div>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

  return (
    <div className="meeting-detail-container">
      <div className="meeting-detail-header">
        <Button
          variant="secondary"
          onClick={() => navigate(`/workspace/${workspaceId}`)}
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back to Workspace
        </Button>

        <h1 className="meeting-detail-title">{meeting.meeting_name}</h1>
      </div>

      <div className="meeting-detail-content">
        {renderOverview()}
        {extractions && renderUnifiedTable()}
      </div>
    </div>
  );
};

export default MeetingDetail;

