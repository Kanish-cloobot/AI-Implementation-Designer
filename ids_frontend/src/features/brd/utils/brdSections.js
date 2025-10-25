import GenericBRDTable from '../components/GenericBRDTable';

// Helper function to format values
const formatValue = (value, column) => {
  if (value === null || value === undefined || value === '') {
    return '-';
  }
  
  if (Array.isArray(value)) {
    return (
      <ul className="brd-table-list">
        {value.map((item, idx) => (
          <li key={idx}>{item}</li>
        ))}
      </ul>
    );
  }
  
  if (typeof value === 'object') {
    return JSON.stringify(value, null, 2);
  }
  
  return value;
};

export const generateBRDSections = (brdData, requirementStatuses = {}, handleRequirementAction = () => {}) => {
  if (!brdData) return [];

  const sections = [];

  // Business Units & Teams Section
  if (brdData.business_units_teams && brdData.business_units_teams.length > 0) {
    const businessUnitsColumns = [
      {
        key: 'business_unit',
        header: 'Business Unit',
        accessor: (item) => item.business_unit,
        className: 'primary-column'
      },
      {
        key: 'teams',
        header: 'Teams',
        accessor: (item) => item.teams,
        className: 'teams-column'
      },
      {
        key: 'notes_md',
        header: 'Notes',
        accessor: (item) => item.notes_md,
        className: 'notes-column'
      }
    ];

    sections.push({
      id: 'business-units-teams',
      title: 'Business Units & Teams',
      icon: 'corporate_fare',
      content: (
        <GenericBRDTable
          data={brdData.business_units_teams}
          columns={businessUnitsColumns}
          title="Business Units & Teams"
          icon="corporate_fare"
          showTitle={false}
        />
      )
    });
  }

  // Modules & Processes Section
  if (brdData.modules_processes && brdData.modules_processes.length > 0) {
    const modulesColumns = [
      {
        key: 'module_name',
        header: 'Module',
        accessor: (item) => item.module_name,
        className: 'primary-column'
      },
      {
        key: 'processes',
        header: 'Processes',
        accessor: (item) => item.processes,
        className: 'processes-column'
      },
      {
        key: 'scope_tag',
        header: 'Scope',
        accessor: (item) => item.scope_tag,
        className: 'scope-column'
      },
      {
        key: 'notes_md',
        header: 'Notes',
        accessor: (item) => item.notes_md,
        className: 'notes-column'
      }
    ];

    sections.push({
      id: 'modules-processes',
      title: 'Modules & Processes',
      icon: 'widgets',
      content: (
        <GenericBRDTable
          data={brdData.modules_processes}
          columns={modulesColumns}
          title="Modules & Processes"
          icon="widgets"
          showTitle={false}
        />
      )
    });
  }

  // License List Section
  if (brdData.license_list && brdData.license_list.length > 0) {
    const licenseColumns = [
      {
        key: 'license_type',
        header: 'License Type',
        accessor: (item) => item.license_type,
        className: 'primary-column'
      },
      {
        key: 'count',
        header: 'Count',
        accessor: (item) => item.count,
        className: 'count-column'
      },
      {
        key: 'allocation_md',
        header: 'Allocation',
        accessor: (item) => item.allocation_md,
        className: 'allocation-column'
      },
      {
        key: 'notes_md',
        header: 'Notes',
        accessor: (item) => item.notes_md,
        className: 'notes-column'
      }
    ];

    sections.push({
      id: 'license-list',
      title: 'License List',
      icon: 'license',
      content: (
        <GenericBRDTable
          data={brdData.license_list}
          columns={licenseColumns}
          title="License List"
          icon="license"
          showTitle={false}
        />
      )
    });
  }

  // Personas Section
  if (brdData.personas && brdData.personas.length > 0) {
    const personasColumns = [
      {
        key: 'persona_name',
        header: 'Persona',
        accessor: (item) => item.persona_name,
        className: 'primary-column'
      },
      {
        key: 'responsibilities',
        header: 'Responsibilities',
        accessor: (item) => item.responsibilities,
        className: 'responsibilities-column'
      },
      {
        key: 'primary_modules',
        header: 'Primary Modules',
        accessor: (item) => item.primary_modules,
        className: 'modules-column'
      }
    ];

    sections.push({
      id: 'personas',
      title: 'Personas',
      icon: 'account_circle',
      content: (
        <GenericBRDTable
          data={brdData.personas}
          columns={personasColumns}
          title="Personas"
          icon="account_circle"
          showTitle={false}
        />
      )
    });
  }

  // Requirements Section
  if (brdData.requirements && brdData.requirements.length > 0) {
    const requirementsColumns = [
      {
        key: 'requirement_type',
        header: 'Type',
        accessor: (item) => item.requirement_type,
        className: 'type-column'
      },
      {
        key: 'description_md',
        header: 'Description',
        accessor: (item) => item.description_md,
        className: 'description-column'
      },
      {
        key: 'status',
        header: 'Status',
        accessor: (item, index) => {
          const currentStatus = requirementStatuses[index] || 'pending';
          return currentStatus;
        },
        className: 'status-column'
      },
      {
        key: 'actions',
        header: 'Actions',
        accessor: (item, index) => {
          const currentStatus = requirementStatuses[index] || 'pending';
          return { status: currentStatus, index };
        },
        className: 'actions-column'
      }
    ];

    const customRowRenderer = (item, column, index) => {
      if (column.key === 'requirement_type') {
        return <span className="requirement-type-badge">{item.requirement_type}</span>;
      }
      
      if (column.key === 'status') {
        const currentStatus = requirementStatuses[index] || 'pending';
        return (
          <span className={`requirement-status ${currentStatus}`}>
            {currentStatus === 'approved' ? 'Approved' : 
             currentStatus === 'rejected' ? 'Rejected' : 
             currentStatus === 'review' ? 'Under Review' : 'Pending'}
          </span>
        );
      }
      
      if (column.key === 'actions') {
        const currentStatus = requirementStatuses[index] || 'pending';
        return (
          <div className="requirement-actions">
            {currentStatus === 'pending' && (
              <>
                <button 
                  className="requirement-action-btn approve-btn"
                  onClick={() => handleRequirementAction(index, 'approved')}
                >
                  <span className="material-symbols-outlined">check</span>
                  Approve
                </button>
                <button 
                  className="requirement-action-btn review-btn"
                  onClick={() => handleRequirementAction(index, 'review')}
                >
                  <span className="material-symbols-outlined">visibility</span>
                  Review
                </button>
                <button 
                  className="requirement-action-btn reject-btn"
                  onClick={() => handleRequirementAction(index, 'rejected')}
                >
                  <span className="material-symbols-outlined">close</span>
                  Reject
                </button>
              </>
            )}
            {currentStatus === 'approved' && (
              <span className="requirement-status-text approved">✓ Approved</span>
            )}
            {currentStatus === 'rejected' && (
              <span className="requirement-status-text rejected">✗ Rejected</span>
            )}
            {currentStatus === 'review' && (
              <span className="requirement-status-text review">👁 Under Review</span>
            )}
          </div>
        );
      }
      
      return formatValue(column.accessor ? column.accessor(item, index) : item[column.key], column);
    };

    sections.push({
      id: 'requirements',
      title: 'Requirements',
      icon: 'assignment',
      content: (
        <GenericBRDTable
          data={brdData.requirements}
          columns={requirementsColumns}
          title="Requirements"
          icon="assignment"
          className="requirements-table"
          customRowRenderer={customRowRenderer}
          showTitle={false}
        />
      )
    });
  }

  // Current State Section
  if (brdData.current_state && brdData.current_state.length > 0) {
    const currentStateColumns = [
      {
        key: 'description_md',
        header: 'Description',
        accessor: (item) => item.description_md,
        className: 'description-column'
      }
    ];

    sections.push({
      id: 'current-state',
      title: 'Current State (As-Is)',
      icon: 'history',
      content: (
        <GenericBRDTable
          data={brdData.current_state}
          columns={currentStateColumns}
          title="Current State (As-Is)"
          icon="history"
          showTitle={false}
        />
      )
    });
  }

  // Target State Section
  if (brdData.target_state && brdData.target_state.length > 0) {
    const targetStateColumns = [
      {
        key: 'description_md',
        header: 'Description',
        accessor: (item) => item.description_md,
        className: 'description-column'
      }
    ];

    sections.push({
      id: 'target-state',
      title: 'Target State (To-Be)',
      icon: 'flag',
      content: (
        <GenericBRDTable
          data={brdData.target_state}
          columns={targetStateColumns}
          title="Target State (To-Be)"
          icon="flag"
          showTitle={false}
        />
      )
    });
  }

  // Applications to Integrate Section
  if (brdData.applications_to_integrate && brdData.applications_to_integrate.length > 0) {
    const applicationsColumns = [
      {
        key: 'application_name',
        header: 'Application',
        accessor: (item) => item.application_name,
        className: 'primary-column'
      },
      {
        key: 'purpose_md',
        header: 'Purpose',
        accessor: (item) => item.purpose_md,
        className: 'purpose-column'
      },
      {
        key: 'integration_type',
        header: 'Type',
        accessor: (item) => item.integration_type,
        className: 'type-column'
      },
      {
        key: 'directionality',
        header: 'Directionality',
        accessor: (item) => item.directionality,
        className: 'directionality-column'
      },
      {
        key: 'notes_md',
        header: 'Notes',
        accessor: (item) => item.notes_md,
        className: 'notes-column'
      }
    ];

    sections.push({
      id: 'applications-integrate',
      title: 'Applications to Integrate',
      icon: 'hub',
      content: (
        <GenericBRDTable
          data={brdData.applications_to_integrate}
          columns={applicationsColumns}
          title="Applications to Integrate"
          icon="hub"
          showTitle={false}
        />
      )
    });
  }

  // Data Migration Section
  if (brdData.data_migration && brdData.data_migration.length > 0) {
    const dataMigrationColumns = [
      {
        key: 'source_md',
        header: 'Source',
        accessor: (item) => item.source_md,
        className: 'source-column'
      },
      {
        key: 'mapping_notes_md',
        header: 'Mapping Notes',
        accessor: (item) => item.mapping_notes_md,
        className: 'mapping-column'
      },
      {
        key: 'cleansing_rules_md',
        header: 'Cleansing Rules',
        accessor: (item) => item.cleansing_rules_md,
        className: 'cleansing-column'
      },
      {
        key: 'tools_md',
        header: 'Tools',
        accessor: (item) => item.tools_md,
        className: 'tools-column'
      }
    ];

    sections.push({
      id: 'data-migration',
      title: 'Data Migration',
      icon: 'cloud_sync',
      content: (
        <GenericBRDTable
          data={brdData.data_migration}
          columns={dataMigrationColumns}
          title="Data Migration"
          icon="cloud_sync"
          showTitle={false}
        />
      )
    });
  }

  // Data Model Section
  if (brdData.data_model && brdData.data_model.length > 0) {
    const dataModelColumns = [
      {
        key: 'entity_name',
        header: 'Entity',
        accessor: (item) => item.entity_name,
        className: 'primary-column'
      },
      {
        key: 'entity_type',
        header: 'Type',
        accessor: (item) => item.entity_type,
        className: 'type-column'
      },
      {
        key: 'key_fields',
        header: 'Key Fields',
        accessor: (item) => item.key_fields,
        className: 'fields-column'
      },
      {
        key: 'relationships_md',
        header: 'Relationships',
        accessor: (item) => item.relationships_md,
        className: 'relationships-column'
      }
    ];

    sections.push({
      id: 'data-model',
      title: 'Data Model',
      icon: 'table_chart',
      content: (
        <GenericBRDTable
          data={brdData.data_model}
          columns={dataModelColumns}
          title="Data Model"
          icon="table_chart"
          showTitle={false}
        />
      )
    });
  }

  // Pain Points Section
  if (brdData.pain_points && brdData.pain_points.length > 0) {
    const painPointsColumns = [
      {
        key: 'pain_point_md',
        header: 'Pain Point',
        accessor: (item) => item.pain_point_md,
        className: 'primary-column warning'
      },
      {
        key: 'affected_bu_md',
        header: 'Affected Business Unit',
        accessor: (item) => item.affected_bu_md,
        className: 'business-unit-column'
      },
      {
        key: 'impact_md',
        header: 'Impact',
        accessor: (item) => item.impact_md,
        className: 'impact-column'
      }
    ];

    sections.push({
      id: 'pain-points',
      title: 'Pain Points',
      icon: 'warning',
      content: (
        <GenericBRDTable
          data={brdData.pain_points}
          columns={painPointsColumns}
          title="Pain Points"
          icon="warning"
          className="pain-points-table"
          showTitle={false}
        />
      )
    });
  }

  // Metadata Updates Section
  if (brdData.metadata_updates && brdData.metadata_updates.length > 0) {
    const metadataColumns = [
      {
        key: 'component_type',
        header: 'Component Type',
        accessor: (item) => item.component_type,
        className: 'type-column'
      },
      {
        key: 'api_name_md',
        header: 'API Name',
        accessor: (item) => item.api_name_md,
        className: 'api-column'
      },
      {
        key: 'change_type',
        header: 'Change Type',
        accessor: (item) => item.change_type,
        className: 'change-column'
      },
      {
        key: 'scope_md',
        header: 'Scope',
        accessor: (item) => item.scope_md,
        className: 'scope-column'
      }
    ];

    sections.push({
      id: 'metadata-updates',
      title: 'Metadata Updates',
      icon: 'code',
      content: (
        <GenericBRDTable
          data={brdData.metadata_updates}
          columns={metadataColumns}
          title="Metadata Updates"
          icon="code"
          showTitle={false}
        />
      )
    });
  }

  return sections;
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
