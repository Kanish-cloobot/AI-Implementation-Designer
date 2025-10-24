import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { brdAPI } from '../../services/api';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import './BRDView.css';

const BRDView = () => {
  const { workspaceId } = useParams();
  const [loading, setLoading] = useState(true);
  const [brdData, setBrdData] = useState(null);
  const [error, setError] = useState(null);
  const [activeSection, setActiveSection] = useState('business_units_teams');
  const [expandedSections, setExpandedSections] = useState({});

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
      <div className="brd-section">
        <div className="brd-section-header" onClick={() => toggleSection(title)}>
          <div className="brd-section-title">
            <span className={`material-symbols-outlined icon-${color}`}>{icon}</span>
            <h3>{title}</h3>
            <span className="section-count">{count}</span>
          </div>
          <span className="material-symbols-outlined">
            {isExpanded ? 'expand_less' : 'expand_more'}
          </span>
        </div>
        {isExpanded && (
          <div className="brd-section-content">
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

  const renderGenericList = (data, fields) => (
    <div className="brd-items">
      {data.map((item, index) => (
        <div key={index} className="brd-item">
          {fields.map((field) => {
            const value = item[field.key];
            if (!value) return null;

            return (
              <div key={field.key} className="brd-field">
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
          <div className="brd-item-meta">
            <span className="created-at">{formatDateTime(item.created_at)}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderRequirements = (data) => (
    <div className="brd-items">
      {data.map((item, index) => (
        <div key={index} className="brd-item requirement-item">
          <div className="requirement-header">
            <span className="requirement-type">{item.requirement_type}</span>
          </div>
          <p className="requirement-description">{item.description_md}</p>
          {item.acceptance_criteria && (
            <div className="requirement-criteria">
              <strong>Acceptance Criteria:</strong>
              <ul>
                {Array.isArray(item.acceptance_criteria) && item.acceptance_criteria.length > 0
                  ? item.acceptance_criteria.map((criteria, idx) => (
                      <li key={idx}>{criteria}</li>
                    ))
                  : <li>{item.acceptance_criteria}</li>
                }
              </ul>
            </div>
          )}
          <div className="brd-item-meta">
            <span className="created-at">{formatDateTime(item.created_at)}</span>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPersonas = (data) => (
    <div className="brd-items">
      {data.map((item, index) => (
        <div key={index} className="brd-item persona-item">
          <h4 className="persona-name">{item.persona_name}</h4>
          {item.responsibilities && (
            <div className="persona-responsibilities">
              <strong>Responsibilities:</strong>
              <ul>
                {Array.isArray(item.responsibilities) 
                  ? item.responsibilities.map((resp, idx) => (
                      <li key={idx}>{resp}</li>
                    ))
                  : <li>{item.responsibilities}</li>
                }
              </ul>
            </div>
          )}
          {item.primary_modules && (
            <div className="persona-modules">
              <strong>Primary Modules:</strong>
              <ul>
                {Array.isArray(item.primary_modules)
                  ? item.primary_modules.map((module, idx) => (
                      <li key={idx}>{module}</li>
                    ))
                  : <li>{item.primary_modules}</li>
                }
              </ul>
            </div>
          )}
          <div className="brd-item-meta">
            <span className="created-at">{formatDateTime(item.created_at)}</span>
          </div>
        </div>
      ))}
    </div>
  );

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

  return (
    <div className="brd-container">
      <div className="brd-header">
        <h1 className="brd-title">Business Requirements Document (BRD)</h1>
        <Button onClick={fetchBRDData} variant="secondary">
          <span className="material-symbols-outlined">refresh</span>
          Refresh
        </Button>
      </div>

      <div className="brd-content">
        {renderSection(
          'Business Units & Teams',
          brdData.business_units_teams || [],
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
          'Modules & Processes',
          brdData.modules_processes || [],
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
          'License List',
          brdData.license_list || [],
          (data) =>
            renderGenericList(data, [
              { key: 'license_type', label: 'License Type' },
              { key: 'count', label: 'Count' },
              { key: 'allocation_md', label: 'Allocation' },
              { key: 'notes_md', label: 'Notes' },
            ]),
          'license',
          'green'
        )}

        {renderSection(
          'Personas',
          brdData.personas || [],
          renderPersonas,
          'account_circle',
          'orange'
        )}

        {renderSection(
          'Requirements',
          brdData.requirements || [],
          renderRequirements,
          'assignment',
          'purple'
        )}

        {renderSection(
          'Current State (As-Is)',
          brdData.current_state || [],
          (data) =>
            renderGenericList(data, [{ key: 'description_md', label: 'Description' }]),
          'history',
          'orange'
        )}

        {renderSection(
          'Target State (To-Be)',
          brdData.target_state || [],
          (data) =>
            renderGenericList(data, [{ key: 'description_md', label: 'Description' }]),
          'flag',
          'green'
        )}

        {renderSection(
          'Applications to Integrate',
          brdData.applications_to_integrate || [],
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
          brdData.data_migration || [],
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
          brdData.data_model || [],
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
          brdData.metadata_updates || [],
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
      </div>
    </div>
  );
};

export default BRDView;
