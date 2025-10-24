export const generateBRDSections = (brdData, requirementStatuses = {}, handleRequirementAction = () => {}) => {
  if (!brdData) return [];

  const sections = [];

  // Business Units & Teams Section
  if (brdData.business_units_teams && brdData.business_units_teams.length > 0) {
    sections.push({
      id: 'business-units-teams',
      title: 'Business Units & Teams',
      icon: 'corporate_fare',
      content: (
        <div className="brd-content-section">
          <h2 className="brd-section-title">
            <span className="material-symbols-outlined">corporate_fare</span>
            Business Units & Teams
          </h2>
          <div className="brd-items">
            {brdData.business_units_teams.map((item, index) => (
              <div key={index} className="brd-item">
                <div className="brd-field">
                  <strong>Business Unit:</strong>
                  <span>{item.business_unit}</span>
                </div>
                {item.teams && (
                  <div className="brd-field">
                    <strong>Teams:</strong>
                    {Array.isArray(item.teams) ? (
                      <ul>
                        {item.teams.map((team, idx) => (
                          <li key={idx}>{team}</li>
                        ))}
                      </ul>
                    ) : (
                      <span>{item.teams}</span>
                    )}
                  </div>
                )}
                {item.notes_md && (
                  <div className="brd-field">
                    <strong>Notes:</strong>
                    <span>{item.notes_md}</span>
                  </div>
                )}
                <div className="brd-item-meta">
                  <span className="created-at">{formatDateTime(item.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    });
  }

  // Modules & Processes Section
  if (brdData.modules_processes && brdData.modules_processes.length > 0) {
    sections.push({
      id: 'modules-processes',
      title: 'Modules & Processes',
      icon: 'widgets',
      content: (
        <div className="brd-content-section">
          <h2 className="brd-section-title">
            <span className="material-symbols-outlined">widgets</span>
            Modules & Processes
          </h2>
          <div className="brd-items">
            {brdData.modules_processes.map((item, index) => (
              <div key={index} className="brd-item">
                <div className="brd-field">
                  <strong>Module:</strong>
                  <span>{item.module_name}</span>
                </div>
                {item.processes && (
                  <div className="brd-field">
                    <strong>Processes:</strong>
                    {Array.isArray(item.processes) ? (
                      <ul>
                        {item.processes.map((process, idx) => (
                          <li key={idx}>{process}</li>
                        ))}
                      </ul>
                    ) : (
                      <span>{item.processes}</span>
                    )}
                  </div>
                )}
                {item.scope_tag && (
                  <div className="brd-field">
                    <strong>Scope:</strong>
                    <span>{item.scope_tag}</span>
                  </div>
                )}
                {item.notes_md && (
                  <div className="brd-field">
                    <strong>Notes:</strong>
                    <span>{item.notes_md}</span>
                  </div>
                )}
                <div className="brd-item-meta">
                  <span className="created-at">{formatDateTime(item.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    });
  }

  // License List Section
  if (brdData.license_list && brdData.license_list.length > 0) {
    sections.push({
      id: 'license-list',
      title: 'License List',
      icon: 'license',
      content: (
        <div className="brd-content-section">
          <h2 className="brd-section-title">
            <span className="material-symbols-outlined">license</span>
            License List
          </h2>
          <div className="brd-items">
            {brdData.license_list.map((item, index) => (
              <div key={index} className="brd-item">
                <div className="brd-field">
                  <strong>License Type:</strong>
                  <span>{item.license_type}</span>
                </div>
                {item.count && (
                  <div className="brd-field">
                    <strong>Count:</strong>
                    <span>{item.count}</span>
                  </div>
                )}
                {item.allocation_md && (
                  <div className="brd-field">
                    <strong>Allocation:</strong>
                    <span>{item.allocation_md}</span>
                  </div>
                )}
                {item.notes_md && (
                  <div className="brd-field">
                    <strong>Notes:</strong>
                    <span>{item.notes_md}</span>
                  </div>
                )}
                <div className="brd-item-meta">
                  <span className="created-at">{formatDateTime(item.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    });
  }

  // Personas Section
  if (brdData.personas && brdData.personas.length > 0) {
    sections.push({
      id: 'personas',
      title: 'Personas',
      icon: 'account_circle',
      content: (
        <div className="brd-content-section">
          <h2 className="brd-section-title">
            <span className="material-symbols-outlined">account_circle</span>
            Personas
          </h2>
          <div className="brd-items">
            {brdData.personas.map((item, index) => (
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
        </div>
      )
    });
  }

  // Requirements Section
  if (brdData.requirements && brdData.requirements.length > 0) {
    sections.push({
      id: 'requirements',
      title: 'Requirements',
      icon: 'assignment',
      content: (
        <div className="brd-content-section">
          <h2 className="brd-section-title">
            <span className="material-symbols-outlined">assignment</span>
            Requirements
          </h2>
          <div className="requirements-table-container">
            <table className="requirements-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {brdData.requirements.map((item, index) => {
                  const currentStatus = requirementStatuses[index] || 'pending';
                  return (
                    <tr key={index} className="requirement-row">
                      <td className="requirement-type-cell">
                        <span className="requirement-type-badge">{item.requirement_type}</span>
                      </td>
                      <td className="requirement-description-cell">
                        <div className="requirement-description-text">{item.description_md}</div>
                      </td>
                      <td className="requirement-status-cell">
                        <span className={`requirement-status ${currentStatus}`}>
                          {currentStatus === 'approved' ? 'Approved' : 
                           currentStatus === 'rejected' ? 'Rejected' : 
                           currentStatus === 'review' ? 'Under Review' : 'Pending'}
                        </span>
                      </td>
                      <td className="requirement-created-cell">
                        <span className="requirement-created">{formatDateTime(item.created_at)}</span>
                      </td>
                      <td className="requirement-actions-cell">
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
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )
    });
  }

  // Current State Section
  if (brdData.current_state && brdData.current_state.length > 0) {
    sections.push({
      id: 'current-state',
      title: 'Current State (As-Is)',
      icon: 'history',
      content: (
        <div className="brd-content-section">
          <h2 className="brd-section-title">
            <span className="material-symbols-outlined">history</span>
            Current State (As-Is)
          </h2>
          <div className="brd-items">
            {brdData.current_state.map((item, index) => (
              <div key={index} className="brd-item">
                <div className="brd-field">
                  <strong>Description:</strong>
                  <span>{item.description_md}</span>
                </div>
                <div className="brd-item-meta">
                  <span className="created-at">{formatDateTime(item.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    });
  }

  // Target State Section
  if (brdData.target_state && brdData.target_state.length > 0) {
    sections.push({
      id: 'target-state',
      title: 'Target State (To-Be)',
      icon: 'flag',
      content: (
        <div className="brd-content-section">
          <h2 className="brd-section-title">
            <span className="material-symbols-outlined">flag</span>
            Target State (To-Be)
          </h2>
          <div className="brd-items">
            {brdData.target_state.map((item, index) => (
              <div key={index} className="brd-item">
                <div className="brd-field">
                  <strong>Description:</strong>
                  <span>{item.description_md}</span>
                </div>
                <div className="brd-item-meta">
                  <span className="created-at">{formatDateTime(item.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    });
  }

  // Applications to Integrate Section
  if (brdData.applications_to_integrate && brdData.applications_to_integrate.length > 0) {
    sections.push({
      id: 'applications-integrate',
      title: 'Applications to Integrate',
      icon: 'hub',
      content: (
        <div className="brd-content-section">
          <h2 className="brd-section-title">
            <span className="material-symbols-outlined">hub</span>
            Applications to Integrate
          </h2>
          <div className="brd-items">
            {brdData.applications_to_integrate.map((item, index) => (
              <div key={index} className="brd-item">
                <div className="brd-field">
                  <strong>Application:</strong>
                  <span>{item.application_name}</span>
                </div>
                {item.purpose_md && (
                  <div className="brd-field">
                    <strong>Purpose:</strong>
                    <span>{item.purpose_md}</span>
                  </div>
                )}
                {item.integration_type && (
                  <div className="brd-field">
                    <strong>Type:</strong>
                    <span>{item.integration_type}</span>
                  </div>
                )}
                {item.directionality && (
                  <div className="brd-field">
                    <strong>Directionality:</strong>
                    <span>{item.directionality}</span>
                  </div>
                )}
                {item.notes_md && (
                  <div className="brd-field">
                    <strong>Notes:</strong>
                    <span>{item.notes_md}</span>
                  </div>
                )}
                <div className="brd-item-meta">
                  <span className="created-at">{formatDateTime(item.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    });
  }

  // Data Migration Section
  if (brdData.data_migration && brdData.data_migration.length > 0) {
    sections.push({
      id: 'data-migration',
      title: 'Data Migration',
      icon: 'cloud_sync',
      content: (
        <div className="brd-content-section">
          <h2 className="brd-section-title">
            <span className="material-symbols-outlined">cloud_sync</span>
            Data Migration
          </h2>
          <div className="brd-items">
            {brdData.data_migration.map((item, index) => (
              <div key={index} className="brd-item">
                {item.source_md && (
                  <div className="brd-field">
                    <strong>Source:</strong>
                    <span>{item.source_md}</span>
                  </div>
                )}
                {item.mapping_notes_md && (
                  <div className="brd-field">
                    <strong>Mapping Notes:</strong>
                    <span>{item.mapping_notes_md}</span>
                  </div>
                )}
                {item.cleansing_rules_md && (
                  <div className="brd-field">
                    <strong>Cleansing Rules:</strong>
                    <span>{item.cleansing_rules_md}</span>
                  </div>
                )}
                {item.tools_md && (
                  <div className="brd-field">
                    <strong>Tools:</strong>
                    <span>{item.tools_md}</span>
                  </div>
                )}
                <div className="brd-item-meta">
                  <span className="created-at">{formatDateTime(item.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    });
  }

  // Data Model Section
  if (brdData.data_model && brdData.data_model.length > 0) {
    sections.push({
      id: 'data-model',
      title: 'Data Model',
      icon: 'table_chart',
      content: (
        <div className="brd-content-section">
          <h2 className="brd-section-title">
            <span className="material-symbols-outlined">table_chart</span>
            Data Model
          </h2>
          <div className="brd-items">
            {brdData.data_model.map((item, index) => (
              <div key={index} className="brd-item">
                <div className="brd-field">
                  <strong>Entity:</strong>
                  <span>{item.entity_name}</span>
                </div>
                {item.entity_type && (
                  <div className="brd-field">
                    <strong>Type:</strong>
                    <span>{item.entity_type}</span>
                  </div>
                )}
                {item.key_fields && (
                  <div className="brd-field">
                    <strong>Key Fields:</strong>
                    <span>{item.key_fields}</span>
                  </div>
                )}
                {item.relationships_md && (
                  <div className="brd-field">
                    <strong>Relationships:</strong>
                    <span>{item.relationships_md}</span>
                  </div>
                )}
                <div className="brd-item-meta">
                  <span className="created-at">{formatDateTime(item.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    });
  }

  // Metadata Updates Section
  if (brdData.metadata_updates && brdData.metadata_updates.length > 0) {
    sections.push({
      id: 'metadata-updates',
      title: 'Metadata Updates',
      icon: 'code',
      content: (
        <div className="brd-content-section">
          <h2 className="brd-section-title">
            <span className="material-symbols-outlined">code</span>
            Metadata Updates
          </h2>
          <div className="brd-items">
            {brdData.metadata_updates.map((item, index) => (
              <div key={index} className="brd-item">
                <div className="brd-field">
                  <strong>Component Type:</strong>
                  <span>{item.component_type}</span>
                </div>
                {item.api_name_md && (
                  <div className="brd-field">
                    <strong>API Name:</strong>
                    <span>{item.api_name_md}</span>
                  </div>
                )}
                {item.change_type && (
                  <div className="brd-field">
                    <strong>Change Type:</strong>
                    <span>{item.change_type}</span>
                  </div>
                )}
                {item.scope_md && (
                  <div className="brd-field">
                    <strong>Scope:</strong>
                    <span>{item.scope_md}</span>
                  </div>
                )}
                <div className="brd-item-meta">
                  <span className="created-at">{formatDateTime(item.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
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
