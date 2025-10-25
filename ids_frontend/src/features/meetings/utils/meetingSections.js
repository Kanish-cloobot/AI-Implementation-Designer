import React from 'react';
import { createTableCellWithSource, renderSourceReferences } from '../../../utils/sourceReferenceUtils';
import '../../../utils/sourceReferenceUtils.css';

// Helper function to create table content for meeting data
const createTableContent = (data, columns, onSourceClick) => {
  if (!data || data.length === 0) {
    return (
      <div className="meeting-table-empty">
        <p>No data available</p>
      </div>
    );
  }

  return (
    <div className="meeting-table-container">
      <table className="meeting-table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index} className="meeting-table-header">
                {column.label}
              </th>
            ))}
            <th className="meeting-table-header">Sources</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="meeting-table-row">
              {columns.map((column, colIndex) => (
                <td key={colIndex} className="meeting-table-cell">
                  {column.render ? column.render(item[column.key], item) : item[column.key] || '-'}
                </td>
              ))}
              <td className="meeting-table-cell">
                {renderSourceReferences(item, onSourceClick)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Content creators for different sections
const createMeetingOverviewContent = (meetingData) => {
  if (!meetingData) return <p>No meeting overview data available</p>;
  
  const { meeting, files } = meetingData;
  
  return (
    <div className="meeting-overview-content">
      <div className="meeting-meta-info">
        <div className="meeting-meta-item">
          <span className="material-symbols-outlined">schedule</span>
          <div>
            <span className="meta-label">Date & Time</span>
            <span className="meta-value">
              {meeting.meeting_datetime ? new Date(meeting.meeting_datetime).toLocaleString() : 'Not set'}
            </span>
          </div>
        </div>
        <div className="meeting-meta-item">
          <span className="material-symbols-outlined">label</span>
          <div>
            <span className="meta-label">Status</span>
            <span className={`status-badge ${meeting.status}`}>{meeting.status}</span>
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
    </div>
  );
};

const createOrgStructureContent = (extractions) => {
  const buTeams = extractions?.bu_teams || [];
  const personas = extractions?.personas || [];
  
  return (
    <div className="org-structure-content">
      {buTeams.length > 0 && (
        <div className="org-section">
          <h3>Business Units & Teams</h3>
          {createTableContent(buTeams, [
            { key: 'business_unit', label: 'Business Unit' },
            { key: 'teams', label: 'Teams', render: (value) => Array.isArray(value) ? value.join(', ') : value },
            { key: 'notes_md', label: 'Notes' }
          ])}
        </div>
      )}
      
      {personas.length > 0 && (
        <div className="org-section">
          <h3>Personas</h3>
          {createTableContent(personas, [
            { key: 'persona_name', label: 'Persona' },
            { key: 'responsibilities', label: 'Responsibilities', render: (value) => Array.isArray(value) ? value.join(', ') : value },
            { key: 'primary_modules', label: 'Primary Modules', render: (value) => Array.isArray(value) ? value.join(', ') : value }
          ])}
        </div>
      )}
    </div>
  );
};

const createRequirementsContent = (extractions) => {
  const requirements = extractions?.requirements || [];
  const modulesProcesses = extractions?.modules_processes || [];
  const painPoints = extractions?.pain_points || [];
  const currentState = extractions?.current_state || [];
  const targetState = extractions?.target_state || [];
  
  return (
    <div className="requirements-content">
      {requirements.length > 0 && (
        <div className="requirements-section">
          <h3>Requirements</h3>
          {createTableContent(requirements, [
            { key: 'requirement_type', label: 'Type' },
            { key: 'description_md', label: 'Description' },
            { key: 'acceptance_criteria', label: 'Acceptance Criteria', render: (value) => Array.isArray(value) ? value.join('; ') : value }
          ])}
        </div>
      )}
      
      {modulesProcesses.length > 0 && (
        <div className="requirements-section">
          <h3>Modules and Processes</h3>
          {createTableContent(modulesProcesses, [
            { key: 'module_name', label: 'Module' },
            { key: 'processes', label: 'Processes', render: (value) => Array.isArray(value) ? value.join(', ') : value },
            { key: 'scope_tag', label: 'Scope' },
            { key: 'notes_md', label: 'Notes' }
          ])}
        </div>
      )}
      
      {painPoints.length > 0 && (
        <div className="requirements-section">
          <h3>Pain Points</h3>
          {createTableContent(painPoints, [
            { key: 'pain_point_md', label: 'Pain Point' },
            { key: 'affected_bu_md', label: 'Affected BU' },
            { key: 'impact_md', label: 'Impact' }
          ])}
        </div>
      )}
      
      {currentState.length > 0 && (
        <div className="requirements-section">
          <h3>Current State (As-is)</h3>
          {createTableContent(currentState, [
            { key: 'description_md', label: 'Description' }
          ])}
        </div>
      )}
      
      {targetState.length > 0 && (
        <div className="requirements-section">
          <h3>Target State (To-be)</h3>
          {createTableContent(targetState, [
            { key: 'description_md', label: 'Description' }
          ])}
        </div>
      )}
    </div>
  );
};

const createRAIDDContent = (extractions) => {
  const risksIssues = extractions?.risks_issues || [];
  const actionItems = extractions?.action_items || [];
  const decisions = extractions?.decisions || [];
  const dependencies = extractions?.dependencies || [];
  
  return (
    <div className="raidd-content">
      {risksIssues.length > 0 && (
        <div className="raidd-section">
          <h3>Risks and Issues</h3>
          {createTableContent(risksIssues, [
            { key: 'type', label: 'Type' },
            { key: 'description_md', label: 'Description' },
            { key: 'impact_md', label: 'Impact' },
            { key: 'mitigation_md', label: 'Mitigation' },
            { key: 'owner_md', label: 'Owner' },
            { key: 'due_date', label: 'Due Date' }
          ])}
        </div>
      )}
      
      {actionItems.length > 0 && (
        <div className="raidd-section">
          <h3>Action Items</h3>
          {createTableContent(actionItems, [
            { key: 'task_md', label: 'Task' },
            { key: 'item_status', label: 'Status' },
            { key: 'owner_md', label: 'Owner' },
            { key: 'due_date', label: 'Due Date' }
          ])}
        </div>
      )}
      
      {decisions.length > 0 && (
        <div className="raidd-section">
          <h3>Decisions</h3>
          {createTableContent(decisions, [
            { key: 'decision_md', label: 'Decision' },
            { key: 'rationale_md', label: 'Rationale' },
            { key: 'decided_on', label: 'Decided On' },
            { key: 'approver_md', label: 'Approver' }
          ])}
        </div>
      )}
      
      {dependencies.length > 0 && (
        <div className="raidd-section">
          <h3>Dependencies</h3>
          {createTableContent(dependencies, [
            { key: 'description_md', label: 'Description' },
            { key: 'type', label: 'Type' },
            { key: 'depends_on_md', label: 'Depends On' },
            { key: 'owner_md', label: 'Owner' }
          ])}
        </div>
      )}
    </div>
  );
};

const createDataSystemsContent = (extractions) => {
  const integrations = extractions?.integrations || [];
  const dataMigration = extractions?.data_migration || [];
  const dataModel = extractions?.data_model || [];
  const metadataUpdates = extractions?.metadata_updates || [];
  
  return (
    <div className="data-systems-content">
      {integrations.length > 0 && (
        <div className="data-systems-section">
          <h3>Applications to be Integrated</h3>
          {createTableContent(integrations, [
            { key: 'application_name', label: 'Application' },
            { key: 'purpose_md', label: 'Purpose' },
            { key: 'integration_type', label: 'Type' },
            { key: 'directionality', label: 'Directionality' },
            { key: 'notes_md', label: 'Notes' }
          ])}
        </div>
      )}
      
      {dataMigration.length > 0 && (
        <div className="data-systems-section">
          <h3>Data Migration</h3>
          {createTableContent(dataMigration, [
            { key: 'source_md', label: 'Source' },
            { key: 'mapping_notes_md', label: 'Mapping Notes' },
            { key: 'cleansing_rules_md', label: 'Cleansing Rules' },
            { key: 'tools_md', label: 'Tools' }
          ])}
        </div>
      )}
      
      {dataModel.length > 0 && (
        <div className="data-systems-section">
          <h3>Data Model</h3>
          {createTableContent(dataModel, [
            { key: 'entity_name', label: 'Entity' },
            { key: 'entity_type', label: 'Type' },
            { key: 'key_fields', label: 'Key Fields', render: (value) => Array.isArray(value) ? value.join(', ') : value },
            { key: 'relationships_md', label: 'Relationships' }
          ])}
        </div>
      )}
      
      {metadataUpdates.length > 0 && (
        <div className="data-systems-section">
          <h3>List of Metadata names to be updated / upgraded</h3>
          {createTableContent(metadataUpdates, [
            { key: 'component_type', label: 'Component Type' },
            { key: 'api_name_md', label: 'API Name' },
            { key: 'change_type', label: 'Change Type' },
            { key: 'scope_md', label: 'Scope' }
          ])}
        </div>
      )}
    </div>
  );
};

// Main function to generate meeting sections
export const generateMeetingSections = (meetingData, onSourceClick) => {
  const { meeting, extractions } = meetingData || {};
  
  return [
    {
      id: 'meeting-overview',
      title: 'Meeting Overview',
      icon: 'overview',
      content: createMeetingOverviewContent(meetingData)
    },
    {
      id: 'org-structure',
      title: 'Org structure',
      icon: 'corporate_fare',
      children: [
        {
          id: 'bu-teams',
          title: 'List of BU, Teams',
          icon: 'corporate_fare',
          content: createTableContent(extractions?.bu_teams || [], [
            { key: 'business_unit', label: 'Business Unit' },
            { key: 'teams', label: 'Teams', render: (value) => Array.isArray(value) ? value.join(', ') : value },
            { key: 'notes_md', label: 'Notes' }
          ], onSourceClick)
        },
        {
          id: 'personas',
          title: 'Personas',
          icon: 'account_circle',
          content: createTableContent(extractions?.personas || [], [
            { key: 'persona_name', label: 'Persona' },
            { key: 'responsibilities', label: 'Responsibilities', render: (value) => Array.isArray(value) ? value.join(', ') : value },
            { key: 'primary_modules', label: 'Primary Modules', render: (value) => Array.isArray(value) ? value.join(', ') : value }
          ], onSourceClick)
        },
        {
          id: 'modules-processes',
          title: 'Modules and Processes',
          icon: 'widgets',
          content: createTableContent(extractions?.modules_processes || [], [
            { key: 'module_name', label: 'Module' },
            { key: 'processes', label: 'Processes', render: (value) => Array.isArray(value) ? value.join(', ') : value },
            { key: 'scope_tag', label: 'Scope' },
            { key: 'notes_md', label: 'Notes' }
          ], onSourceClick)
        }
      ]
    },
    {
      id: 'requirements',
      title: 'Requirements',
      icon: 'assignment',
      children: [
        {
          id: 'requirements-list',
          title: 'Requirements',
          icon: 'assignment',
          content: createTableContent(extractions?.requirements || [], [
            { key: 'requirement_type', label: 'Type' },
            { key: 'description_md', label: 'Description' },
            { key: 'acceptance_criteria', label: 'Acceptance Criteria', render: (value) => Array.isArray(value) ? value.join('; ') : value }
          ], onSourceClick)
        },
        {
          id: 'pain-points',
          title: 'Pain Points',
          icon: 'error',
          content: createTableContent(extractions?.pain_points || [], [
            { key: 'pain_point_md', label: 'Pain Point' },
            { key: 'affected_bu_md', label: 'Affected BU' },
            { key: 'impact_md', label: 'Impact' }
          ], onSourceClick)
        },
        {
          id: 'current-state',
          title: 'Current State (As-is)',
          icon: 'history',
          content: createTableContent(extractions?.current_state || [], [
            { key: 'description_md', label: 'Description' }
          ], onSourceClick)
        },
        {
          id: 'target-state',
          title: 'Target State (To-be)',
          icon: 'flag',
          content: createTableContent(extractions?.target_state || [], [
            { key: 'description_md', label: 'Description' }
          ], onSourceClick)
        }
      ]
    },
    {
      id: 'raidd',
      title: 'RAIDD',
      icon: 'warning',
      children: [
        {
          id: 'risks-issues',
          title: 'Risks and Issues',
          icon: 'warning',
          content: createTableContent(extractions?.risks_issues || [], [
            { key: 'type', label: 'Type' },
            { key: 'description_md', label: 'Description' },
            { key: 'impact_md', label: 'Impact' },
            { key: 'mitigation_md', label: 'Mitigation' },
            { key: 'owner_md', label: 'Owner' },
            { key: 'due_date', label: 'Due Date' }
          ], onSourceClick)
        },
        {
          id: 'action-items',
          title: 'Action Items',
          icon: 'task_alt',
          content: createTableContent(extractions?.action_items || [], [
            { key: 'task_md', label: 'Task' },
            { key: 'item_status', label: 'Status' },
            { key: 'owner_md', label: 'Owner' },
            { key: 'due_date', label: 'Due Date' }
          ], onSourceClick)
        },
        {
          id: 'decisions',
          title: 'Decisions',
          icon: 'gavel',
          content: createTableContent(extractions?.decisions || [], [
            { key: 'decision_md', label: 'Decision' },
            { key: 'rationale_md', label: 'Rationale' },
            { key: 'decided_on', label: 'Decided On' },
            { key: 'approver_md', label: 'Approver' }
          ], onSourceClick)
        },
        {
          id: 'dependencies',
          title: 'Dependencies',
          icon: 'link',
          content: createTableContent(extractions?.dependencies || [], [
            { key: 'description_md', label: 'Description' },
            { key: 'type', label: 'Type' },
            { key: 'depends_on_md', label: 'Depends On' },
            { key: 'owner_md', label: 'Owner' }
          ], onSourceClick)
        }
      ]
    },
    {
      id: 'data-systems',
      title: 'Data & Systems',
      icon: 'storage',
      children: [
        {
          id: 'applications-integrate',
          title: 'Applications to be Integrated',
          icon: 'hub',
          content: createTableContent(extractions?.integrations || [], [
            { key: 'application_name', label: 'Application' },
            { key: 'purpose_md', label: 'Purpose' },
            { key: 'integration_type', label: 'Type' },
            { key: 'directionality', label: 'Directionality' },
            { key: 'notes_md', label: 'Notes' }
          ], onSourceClick)
        },
        {
          id: 'data-migration',
          title: 'Data Migration',
          icon: 'cloud_sync',
          content: createTableContent(extractions?.data_migration || [], [
            { key: 'source_md', label: 'Source' },
            { key: 'mapping_notes_md', label: 'Mapping Notes' },
            { key: 'cleansing_rules_md', label: 'Cleansing Rules' },
            { key: 'tools_md', label: 'Tools' }
          ], onSourceClick)
        },
        {
          id: 'data-model',
          title: 'Data Model',
          icon: 'table_chart',
          content: createTableContent(extractions?.data_model || [], [
            { key: 'entity_name', label: 'Entity' },
            { key: 'entity_type', label: 'Type' },
            { key: 'key_fields', label: 'Key Fields', render: (value) => Array.isArray(value) ? value.join(', ') : value },
            { key: 'relationships_md', label: 'Relationships' }
          ], onSourceClick)
        },
        {
          id: 'metadata-updates',
          title: 'List of Metadata names to be updated / upgraded',
          icon: 'code',
          content: createTableContent(extractions?.metadata_updates || [], [
            { key: 'component_type', label: 'Component Type' },
            { key: 'api_name_md', label: 'API Name' },
            { key: 'change_type', label: 'Change Type' },
            { key: 'scope_md', label: 'Scope' }
          ], onSourceClick)
        }
      ]
    }
  ];
};
