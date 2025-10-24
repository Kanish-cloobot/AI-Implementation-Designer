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
      const payload = { meeting_id: meetingId };
      const response = await meetingAPI.getDetail(payload);
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

      <div className="meeting-detail-tabs">
        <button
          className={`detail-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`detail-tab ${activeTab === 'requirements' ? 'active' : ''}`}
          onClick={() => setActiveTab('requirements')}
        >
          Requirements
        </button>
        <button
          className={`detail-tab ${activeTab === 'actions' ? 'active' : ''}`}
          onClick={() => setActiveTab('actions')}
        >
          Actions
        </button>
        <button
          className={`detail-tab ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          Insights
        </button>
        <button
          className={`detail-tab ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          Notes
        </button>
      </div>

      <div className="meeting-detail-content">
        {activeTab === 'overview' && renderOverview()}

        {activeTab === 'requirements' && extractions && (
          <div className="extractions-container">
            {renderSection(
              'Requirements',
              extractions.requirements || [],
              renderRequirements,
              'assignment',
              'purple'
            )}
            {renderSection(
              'Modules & Processes',
              extractions.modules_processes || [],
              (data) =>
                renderGenericList(data, [
                  { key: 'module_name', label: 'Module' },
                  { key: 'processes', label: 'Processes' },
                  { key: 'scope_tag', label: 'Scope' },
                  { key: 'notes_md', label: 'Notes' },
                ]),
              'widgets',
              'blue'
            )}
            {renderSection(
              'Personas',
              extractions.personas || [],
              (data) =>
                renderGenericList(data, [
                  { key: 'persona_name', label: 'Persona' },
                  { key: 'responsibilities', label: 'Responsibilities' },
                  { key: 'primary_modules', label: 'Primary Modules' },
                ]),
              'account_circle',
              'green'
            )}
          </div>
        )}

        {activeTab === 'actions' && extractions && (
          <div className="extractions-container">
            {renderSection(
              'Action Items',
              extractions.action_items || [],
              renderActionItems,
              'task_alt',
              'orange'
            )}
            {renderSection(
              'Decisions',
              extractions.decisions || [],
              renderDecisions,
              'gavel',
              'green'
            )}
            {renderSection(
              'Dependencies',
              extractions.dependencies || [],
              (data) =>
                renderGenericList(data, [
                  { key: 'description_md', label: 'Description' },
                  { key: 'type', label: 'Type' },
                  { key: 'depends_on_md', label: 'Depends On' },
                  { key: 'owner_md', label: 'Owner' },
                ]),
              'link',
              'blue'
            )}
          </div>
        )}

        {activeTab === 'insights' && extractions && (
          <div className="extractions-container">
            {renderSection(
              'Risks & Issues',
              extractions.risks_issues || [],
              renderRisksIssues,
              'warning',
              'red'
            )}
            {renderSection(
              'Pain Points',
              extractions.pain_points || [],
              (data) =>
                renderGenericList(data, [
                  { key: 'pain_point_md', label: 'Pain Point' },
                  { key: 'affected_bu_md', label: 'Affected BU' },
                  { key: 'impact_md', label: 'Impact' },
                ]),
              'error',
              'orange'
            )}
            {renderSection(
              'Business Units & Teams',
              extractions.bu_teams || [],
              (data) =>
                renderGenericList(data, [
                  { key: 'business_unit', label: 'Business Unit' },
                  { key: 'teams', label: 'Teams' },
                  { key: 'notes_md', label: 'Notes' },
                ]),
              'corporate_fare',
              'purple'
            )}
            {renderSection(
              'Licenses',
              extractions.licenses || [],
              (data) =>
                renderGenericList(data, [
                  { key: 'license_type', label: 'License Type' },
                  { key: 'count', label: 'Count' },
                  { key: 'allocation_md', label: 'Allocation' },
                  { key: 'notes_md', label: 'Notes' },
                ]),
              'license',
              'blue'
            )}
          </div>
        )}

        {activeTab === 'notes' && extractions && (
          <div className="extractions-container">
            {renderSection(
              'Current State (As-Is)',
              extractions.current_state || [],
              (data) =>
                renderGenericList(data, [{ key: 'description_md', label: 'Description' }]),
              'history',
              'orange'
            )}
            {renderSection(
              'Target State (To-Be)',
              extractions.target_state || [],
              (data) =>
                renderGenericList(data, [{ key: 'description_md', label: 'Description' }]),
              'flag',
              'green'
            )}
            {renderSection(
              'Applications to Integrate',
              extractions.integrations || [],
              (data) =>
                renderGenericList(data, [
                  { key: 'application_name', label: 'Application' },
                  { key: 'purpose_md', label: 'Purpose' },
                  { key: 'integration_type', label: 'Type' },
                  { key: 'directionality', label: 'Directionality' },
                  { key: 'notes_md', label: 'Notes' },
                ]),
              'hub',
              'blue'
            )}
            {renderSection(
              'Data Migration',
              extractions.data_migration || [],
              (data) =>
                renderGenericList(data, [
                  { key: 'source_md', label: 'Source' },
                  { key: 'mapping_notes_md', label: 'Mapping Notes' },
                  { key: 'cleansing_rules_md', label: 'Cleansing Rules' },
                  { key: 'tools_md', label: 'Tools' },
                ]),
              'cloud_sync',
              'purple'
            )}
            {renderSection(
              'Data Model',
              extractions.data_model || [],
              (data) =>
                renderGenericList(data, [
                  { key: 'entity_name', label: 'Entity' },
                  { key: 'entity_type', label: 'Type' },
                  { key: 'key_fields', label: 'Key Fields' },
                  { key: 'relationships_md', label: 'Relationships' },
                ]),
              'table_chart',
              'blue'
            )}
            {renderSection(
              'Metadata Updates',
              extractions.metadata_updates || [],
              (data) =>
                renderGenericList(data, [
                  { key: 'component_type', label: 'Component Type' },
                  { key: 'api_name_md', label: 'API Name' },
                  { key: 'change_type', label: 'Change Type' },
                  { key: 'scope_md', label: 'Scope' },
                ]),
              'code',
              'purple'
            )}
            {renderSection(
              'Scope Summary',
              extractions.scope_summary || [],
              (data) =>
                renderGenericList(data, [
                  { key: 'in_scope_md', label: 'In Scope' },
                  { key: 'out_of_scope_md', label: 'Out of Scope' },
                  { key: 'future_phase_md', label: 'Future Phase' },
                ]),
              'checklist',
              'green'
            )}
            {renderSection(
              'Assumptions & Gaps',
              extractions.assumptions_gaps || [],
              (data) =>
                renderGenericList(data, [{ key: 'note_md', label: 'Note' }]),
              'help_outline',
              'orange'
            )}
            {renderSection(
              'Source References',
              extractions.source_references || [],
              (data) =>
                renderGenericList(data, [{ key: 'reference_md', label: 'Reference' }]),
              'source_notes',
              'blue'
            )}
            {renderSection(
              'Validation Summary',
              extractions.validation_summary || [],
              (data) =>
                renderGenericList(data, [
                  { key: 'json_validity', label: 'JSON Valid' },
                  { key: 'issues_detected', label: 'Issues Detected' },
                ]),
              'verified',
              'green'
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingDetail;

