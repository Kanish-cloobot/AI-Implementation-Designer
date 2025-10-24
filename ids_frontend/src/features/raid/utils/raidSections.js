export const generateRAIDSections = (raidData, riskIssueStatuses = {}, handleRiskIssueAction = () => {}) => {
  if (!raidData) return [];

  const sections = [];

  // Risks & Issues Section
  if (raidData.risks_issues && raidData.risks_issues.length > 0) {
    sections.push({
      id: 'risks-issues',
      title: 'Risks & Issues',
      icon: 'warning',
      content: (
        <div className="raid-content-section">
          <h2 className="raid-section-title">
            <span className="material-symbols-outlined">warning</span>
            Risks & Issues
          </h2>
          <div className="raid-items">
            {raidData.risks_issues.map((item, index) => {
              const currentStatus = riskIssueStatuses[index] || 'pending';
              return (
                <div key={index} className="raid-item risk-item">
                  <div className="risk-header">
                    <div className="risk-header-left">
                      <span className={`risk-type ${item.type}`}>{item.type}</span>
                      {item.due_date && <span className="risk-date">{item.due_date}</span>}
                    </div>
                    <div className="risk-header-right">
                      <div className="risk-actions">
                        {currentStatus === 'pending' && (
                          <>
                            <button 
                              className="risk-action-btn resolve-btn"
                              onClick={() => handleRiskIssueAction(index, 'resolved')}
                              title="Resolve"
                            >
                              <span className="material-symbols-outlined">check_circle</span>
                            </button>
                            <button 
                              className="risk-action-btn review-btn"
                              onClick={() => handleRiskIssueAction(index, 'review')}
                              title="Under Review"
                            >
                              <span className="material-symbols-outlined">visibility</span>
                            </button>
                            <button 
                              className="risk-action-btn ignore-btn"
                              onClick={() => handleRiskIssueAction(index, 'ignored')}
                              title="Ignore"
                            >
                              <span className="material-symbols-outlined">block</span>
                            </button>
                          </>
                        )}
                        {currentStatus === 'resolved' && (
                          <span className="risk-status-indicator resolved">✓ Resolved</span>
                        )}
                        {currentStatus === 'ignored' && (
                          <span className="risk-status-indicator ignored">⊘ Ignored</span>
                        )}
                        {currentStatus === 'review' && (
                          <span className="risk-status-indicator review">👁 Under Review</span>
                        )}
                      </div>
                    </div>
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
              );
            })}
          </div>
        </div>
      )
    });
  }

  // Action Items Section
  if (raidData.action_items && raidData.action_items.length > 0) {
    sections.push({
      id: 'action-items',
      title: 'Action Items',
      icon: 'task_alt',
      content: (
        <div className="raid-content-section">
          <h2 className="raid-section-title">
            <span className="material-symbols-outlined">task_alt</span>
            Action Items
          </h2>
          <div className="raid-items">
            {raidData.action_items.map((item, index) => (
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
        </div>
      )
    });
  }

  // Decisions Section
  if (raidData.decisions && raidData.decisions.length > 0) {
    sections.push({
      id: 'decisions',
      title: 'Decisions',
      icon: 'gavel',
      content: (
        <div className="raid-content-section">
          <h2 className="raid-section-title">
            <span className="material-symbols-outlined">gavel</span>
            Decisions
          </h2>
          <div className="raid-items">
            {raidData.decisions.map((item, index) => (
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
        </div>
      )
    });
  }

  // Dependencies Section
  if (raidData.dependencies && raidData.dependencies.length > 0) {
    sections.push({
      id: 'dependencies',
      title: 'Dependencies',
      icon: 'link',
      content: (
        <div className="raid-content-section">
          <h2 className="raid-section-title">
            <span className="material-symbols-outlined">link</span>
            Dependencies
          </h2>
          <div className="raid-items">
            {raidData.dependencies.map((item, index) => (
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
        </div>
      )
    });
  }

  // Pain Points Section
  if (raidData.pain_points && raidData.pain_points.length > 0) {
    sections.push({
      id: 'pain-points',
      title: 'Pain Points',
      icon: 'error',
      content: (
        <div className="raid-content-section">
          <h2 className="raid-section-title">
            <span className="material-symbols-outlined">error</span>
            Pain Points
          </h2>
          <div className="raid-items">
            {raidData.pain_points.map((item, index) => (
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
