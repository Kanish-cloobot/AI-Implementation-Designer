import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { raidAPI } from '../../services/api';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import './RAIDView.css';

const RAIDView = () => {
  const { workspaceId } = useParams();
  const [loading, setLoading] = useState(true);
  const [raidData, setRaidData] = useState(null);
  const [error, setError] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});

  const fetchRAIDData = useCallback(async () => {
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
  }, [workspaceId]);

  useEffect(() => {
    fetchRAIDData();
  }, [fetchRAIDData]);

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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderSection = (title, data, renderContent, icon, color = 'default') => {
    const count = Array.isArray(data) ? data.length : 0;
    const isExpanded = expandedSections[title] !== false;

    return (
      <div className="raid-section">
        <div className="raid-section-header" onClick={() => toggleSection(title)}>
          <div className="raid-section-title">
            <span className={`material-symbols-outlined icon-${color}`}>{icon}</span>
            <h3>{title}</h3>
            <span className="section-count">{count}</span>
          </div>
          <span className="material-symbols-outlined">
            {isExpanded ? 'expand_less' : 'expand_more'}
          </span>
        </div>
        {isExpanded && (
          <div className="raid-section-content">
            {count === 0 ? (
              <p className="section-empty">No {title.toLowerCase()} found</p>
            ) : (
              renderContent(data)
            )}
          </div>
        )}
      </div>
    );
  };

  const renderRisksIssues = (data) => (
    <div className="raid-items">
      {data.map((item, index) => (
        <div key={index} className="raid-item risk-item">
          <div className="risk-header">
            <span className={`risk-type ${item.type}`}>{item.type}</span>
            {item.due_date && <span className="risk-date">{item.due_date}</span>}
          </div>
          <p className="risk-description">{item.description_md}</p>
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
            <div className="risk-owner">
              <span className="material-symbols-outlined">person</span>
              {item.owner_md}
            </div>
          )}
          <div className="raid-item-meta">
            <span className="created-at">{formatDateTime(item.created_at)}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderActionItems = (data) => (
    <div className="raid-items">
      {data.map((item, index) => (
        <div key={index} className="raid-item action-item">
          <div className="action-header">
            <span className={`action-status ${item.item_status}`}>{item.item_status}</span>
            {item.due_date && <span className="action-date">{item.due_date}</span>}
          </div>
          <p className="action-description">{item.task_md}</p>
          {item.owner_md && (
            <div className="action-owner">
              <span className="material-symbols-outlined">person</span>
              {item.owner_md}
            </div>
          )}
          <div className="raid-item-meta">
            <span className="created-at">{formatDateTime(item.created_at)}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderDecisions = (data) => (
    <div className="raid-items">
      {data.map((item, index) => (
        <div key={index} className="raid-item decision-item">
          <p className="decision-description">{item.decision_md}</p>
          {item.rationale_md && (
            <div className="decision-rationale">
              <strong>Rationale:</strong> {item.rationale_md}
            </div>
          )}
          <div className="decision-meta">
            {item.decided_on && <span>Decided on: {item.decided_on}</span>}
            {item.approver_md && <span>Approver: {item.approver_md}</span>}
          </div>
          <div className="raid-item-meta">
            <span className="created-at">{formatDateTime(item.created_at)}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderDependencies = (data) => (
    <div className="raid-items">
      {data.map((item, index) => (
        <div key={index} className="raid-item dependency-item">
          <div className="dependency-header">
            <span className="dependency-type">{item.type}</span>
          </div>
          <p className="dependency-description">{item.description_md}</p>
          {item.depends_on_md && (
            <div className="dependency-detail">
              <strong>Depends On:</strong> {item.depends_on_md}
            </div>
          )}
          {item.owner_md && (
            <div className="dependency-owner">
              <span className="material-symbols-outlined">person</span>
              {item.owner_md}
            </div>
          )}
          <div className="raid-item-meta">
            <span className="created-at">{formatDateTime(item.created_at)}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPainPoints = (data) => (
    <div className="raid-items">
      {data.map((item, index) => (
        <div key={index} className="raid-item pain-point-item">
          <p className="pain-point-description">{item.pain_point_md}</p>
          {item.affected_bu_md && (
            <div className="pain-point-detail">
              <strong>Affected BU:</strong> {item.affected_bu_md}
            </div>
          )}
          {item.impact_md && (
            <div className="pain-point-detail">
              <strong>Impact:</strong> {item.impact_md}
            </div>
          )}
          <div className="raid-item-meta">
            <span className="created-at">{formatDateTime(item.created_at)}</span>
          </div>
        </div>
      ))}
    </div>
  );

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

  return (
    <div className="raid-container">
      <div className="raid-header">
        <h1 className="raid-title">RAID Log</h1>
        <Button onClick={fetchRAIDData} variant="secondary">
          <span className="material-symbols-outlined">refresh</span>
          Refresh
        </Button>
      </div>

      <div className="raid-content">
        {renderSection(
          'Risks & Issues',
          raidData.risks_issues || [],
          renderRisksIssues,
          'warning',
          'red'
        )}

        {renderSection(
          'Action Items',
          raidData.action_items || [],
          renderActionItems,
          'task_alt',
          'orange'
        )}

        {renderSection(
          'Decisions',
          raidData.decisions || [],
          renderDecisions,
          'gavel',
          'green'
        )}

        {renderSection(
          'Dependencies',
          raidData.dependencies || [],
          renderDependencies,
          'link',
          'blue'
        )}

        {renderSection(
          'Pain Points',
          raidData.pain_points || [],
          renderPainPoints,
          'error',
          'orange'
        )}
      </div>
    </div>
  );
};

export default RAIDView;
