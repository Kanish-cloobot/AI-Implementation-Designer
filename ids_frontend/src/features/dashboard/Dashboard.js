import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { dashboardAPI, raidAPI } from '../../services/api';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import RightPanel from '../../components/common/RightPanel';
import DocumentationNavigation from '../viewer/components/DocumentationNavigation';
import DocumentationDetails from '../viewer/components/DocumentationDetails';
import { generateRAIDSections } from '../raid/utils/raidSections';
import './Dashboard.css';

const Dashboard = () => {
  const { workspaceId } = useParams();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [raidData, setRaidData] = useState(null);
  const [raidLoading, setRaidLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeRaidSection, setActiveRaidSection] = useState('risks-issues');
  
  // Right panel state
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [rightPanelData, setRightPanelData] = useState(null);
  const [rightPanelLoading, setRightPanelLoading] = useState(false);
  const [rightPanelError, setRightPanelError] = useState(null);
  const [rightPanelConfig, setRightPanelConfig] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [workspaceId]);

  useEffect(() => {
    if (activeTab === 'raidd') {
      fetchRaidData();
    }
  }, [activeTab, workspaceId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const payload = { workspace_id: workspaceId };
      const response = await dashboardAPI.getDashboard(payload);
      setDashboardData(response.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchRaidData = async () => {
    try {
      setRaidLoading(true);
      setError(null);
      const payload = { workspace_id: workspaceId };
      const response = await raidAPI.getRAID(payload);
      setRaidData(response.data);
    } catch (err) {
      console.error('Error fetching RAID data:', err);
      setError('Failed to load RAID data');
    } finally {
      setRaidLoading(false);
    }
  };

  const handleSummaryCardClick = async (cardType) => {
    const payload = { workspace_id: workspaceId };
    
    // Define configurations for different card types
    const panelConfigs = {
      meetings: {
        title: 'Meetings',
        icon: 'event',
        apiCall: () => dashboardAPI.getMeetings(payload),
        columns: [
          { key: 'meeting_name', header: 'Meeting Name', className: 'primary-column' },
          { key: 'meeting_datetime', header: 'Date & Time', className: 'date-column', accessor: (item) => item.meeting_datetime ? new Date(item.meeting_datetime).toLocaleString() : 'Not set' },
          { key: 'status', header: 'Status', className: 'status-column' }
        ]
      },
      requirements: {
        title: 'Requirements',
        icon: 'assignment',
        apiCall: () => dashboardAPI.getRequirements(payload),
        columns: [
          { key: 'description_md', header: 'Requirement', className: 'primary-column' },
          { key: 'requirement_type', header: 'Type', className: 'status-column' },
          { key: 'acceptance_criteria', header: 'Acceptance Criteria', className: 'description-column', accessor: (item) => item.acceptance_criteria && Array.isArray(item.acceptance_criteria) ? item.acceptance_criteria.join(', ') : 'N/A' }
        ]
      },
      'risks-issues': {
        title: 'Risks & Issues',
        icon: 'warning',
        apiCall: () => dashboardAPI.getRisksIssues(payload),
        columns: [
          { key: 'type', header: 'Type', className: 'primary-column' },
          { key: 'description_md', header: 'Description', className: 'description-column' },
          { key: 'impact_md', header: 'Impact', className: 'impact-column' },
          { key: 'owner_md', header: 'Owner', className: 'owner-column' }
        ]
      },
      'action-items': {
        title: 'Action Items',
        icon: 'task_alt',
        apiCall: () => dashboardAPI.getActionItems(payload),
        columns: [
          { key: 'task_md', header: 'Task', className: 'primary-column' },
          { key: 'item_status', header: 'Status', className: 'status-column' },
          { key: 'owner_md', header: 'Owner', className: 'owner-column' },
          { key: 'due_date', header: 'Due Date', className: 'date-column' }
        ]
      },
      decisions: {
        title: 'Decisions',
        icon: 'gavel',
        apiCall: () => dashboardAPI.getDecisions(payload),
        columns: [
          { key: 'decision_md', header: 'Decision', className: 'primary-column' },
          { key: 'rationale_md', header: 'Rationale', className: 'rationale-column' },
          { key: 'approver_md', header: 'Approver', className: 'approver-column' },
          { key: 'decided_on', header: 'Decided On', className: 'date-column' }
        ]
      },
      dependencies: {
        title: 'Dependencies',
        icon: 'link',
        apiCall: () => dashboardAPI.getDependencies(payload),
        columns: [
          { key: 'type', header: 'Type', className: 'primary-column' },
          { key: 'description_md', header: 'Description', className: 'description-column' },
          { key: 'depends_on_md', header: 'Depends On', className: 'depends-on-column' },
          { key: 'owner_md', header: 'Owner', className: 'owner-column' }
        ]
      }
    };

    const config = panelConfigs[cardType];
    if (!config) return;

    try {
      setRightPanelLoading(true);
      setRightPanelError(null);
      setRightPanelConfig(config);
      setRightPanelOpen(true);
      
      const response = await config.apiCall();
      console.log('API Response:', response.data);
      
      // Handle both direct array and nested data structure
      const responseData = response.data;
      if (responseData && responseData.data && Array.isArray(responseData.data)) {
        console.log('Using nested data:', responseData.data);
        setRightPanelData(responseData.data);
      } else if (Array.isArray(responseData)) {
        console.log('Using direct array:', responseData);
        setRightPanelData(responseData);
      } else {
        console.log('No valid data found, using empty array');
        setRightPanelData([]);
      }
    } catch (err) {
      console.error(`Error fetching ${cardType} data:`, err);
      setRightPanelError(`Failed to load ${config.title.toLowerCase()}`);
    } finally {
      setRightPanelLoading(false);
    }
  };

  const closeRightPanel = () => {
    setRightPanelOpen(false);
    setRightPanelData(null);
    setRightPanelError(null);
    setRightPanelConfig(null);
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

  const renderSummaryCard = (title, count, icon, color = 'default', cardType = null) => (
    <div 
      className={`summary-card ${color} ${cardType ? 'summary-card-clickable' : ''}`}
      onClick={cardType ? () => handleSummaryCardClick(cardType) : undefined}
    >
      <div className="summary-card-icon">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className="summary-card-content">
        <h3 className="summary-card-title">{title}</h3>
        <p className="summary-card-count">{count}</p>
      </div>
      {cardType && (
        <div className="summary-card-arrow">
          <span className="material-symbols-outlined">chevron_right</span>
        </div>
      )}
    </div>
  );

  const renderRecentMeeting = (meeting) => (
    <div key={meeting.meeting_id} className="recent-meeting-item">
      <div className="meeting-info">
        <h4 className="meeting-name">{meeting.meeting_name}</h4>
        <p className="meeting-datetime">{formatDateTime(meeting.meeting_datetime)}</p>
        <span className={`meeting-status ${meeting.status}`}>{meeting.status}</span>
      </div>
    </div>
  );

  const renderActivityItem = (activity) => (
    <div key={`${activity.type}-${activity.created_at}`} className="activity-item">
      <div className="activity-icon">
        <span className={`material-symbols-outlined icon-${activity.color}`}>
          {activity.icon}
        </span>
      </div>
      <div className="activity-content">
        <p className="activity-description">{activity.description}</p>
        <span className="activity-type">{activity.type}</span>
        <span className="activity-time">{formatDateTime(activity.created_at)}</span>
      </div>
    </div>
  );


  if (loading) {
    return (
      <div className="dashboard-loading">
        <Spinner />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <p>{error}</p>
        <Button onClick={fetchDashboardData}>Retry</Button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="dashboard-empty">
        <p>No dashboard data available</p>
        <Button onClick={fetchDashboardData}>Refresh</Button>
      </div>
    );
  }

  const { summary, recent_meetings, upcoming_meetings, recent_activity } = dashboardData;
  
  // Ensure we have valid data structures
  const safeSummary = summary || {};
  const safeRecentMeetings = Array.isArray(recent_meetings) ? recent_meetings : [];
  const safeUpcomingMeetings = Array.isArray(upcoming_meetings) ? upcoming_meetings : [];
  const safeRecentActivity = Array.isArray(recent_activity) ? recent_activity : [];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Project Dashboard</h1>
        <Button onClick={fetchDashboardData} variant="secondary">
          <span className="material-symbols-outlined">refresh</span>
          Refresh
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="dashboard-tabs">
        <button 
          className={`dashboard-tab ${activeTab === 'overview' ? 'dashboard-tab-active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        {/* <button 
          className={`dashboard-tab ${activeTab === 'raidd' ? 'dashboard-tab-active' : ''}`}
          onClick={() => setActiveTab('raidd')}
        >
          RAIDD
        </button> */}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="dashboard-content">
          {/* Summary Cards */}
          <div className="dashboard-summary">
            <h2 className="section-title">Project Summary</h2>
            <div className="summary-cards-grid">
              {renderSummaryCard(
                'Meetings',
                safeSummary.meeting_count || 0,
                'event',
                'blue',
                'meetings'
              )}
              {renderSummaryCard(
                'Requirements',
                safeSummary.requirements_count || 0,
                'assignment',
                'purple',
                'requirements'
              )}
              {renderSummaryCard(
                'Risks & Issues',
                safeSummary.risks_issues_count || 0,
                'warning',
                'red',
                'risks-issues'
              )}
              {renderSummaryCard(
                'Action Items',
                safeSummary.action_items_count || 0,
                'task_alt',
                'orange',
                'action-items'
              )}
              {renderSummaryCard(
                'Decisions',
                safeSummary.decisions_count || 0,
                'gavel',
                'green',
                'decisions'
              )}
              {renderSummaryCard(
                'Dependencies',
                safeSummary.dependencies_count || 0,
                'link',
                'blue',
                'dependencies'
              )}
            </div>
          </div>

          {/* Content Sections */}
          {/* <div className="dashboard-sections">
            <div className="dashboard-section">
              <h3 className="section-subtitle">Requirements</h3>
              <div className="section-content">
                <p className="empty-state">No requirements defined yet</p>
              </div>
            </div>
            
            <div className="dashboard-section">
              <h3 className="section-subtitle">Personas</h3>
              <div className="section-content">
                <p className="empty-state">No personas defined yet</p>
              </div>
            </div>
            
            <div className="dashboard-section">
              <h3 className="section-subtitle">Data Model</h3>
              <div className="section-content">
                <p className="empty-state">No data model defined yet</p>
              </div>
            </div>
            
            <div className="dashboard-section">
              <h3 className="section-subtitle">Bo-list</h3>
              <div className="section-content">
                <p className="empty-state">No backlog items defined yet</p>
              </div>
            </div>
          </div> */}
        </div>
      )}

      {activeTab === 'raidd' && (
        <div className="dashboard-raid-container">
          {raidLoading ? (
            <div className="dashboard-loading">
              <Spinner />
              <p>Loading RAID data...</p>
            </div>
          ) : raidData ? (
            <div className="dashboard-raid-documentation">
              <div className="dashboard-raid-navigation">
                <DocumentationNavigation 
                  sections={generateRAIDSections(raidData)}
                  activeSection={activeRaidSection}
                  onSectionSelect={setActiveRaidSection}
                />
              </div>
              <div className="dashboard-raid-details">
                <DocumentationDetails 
                  activeSection={activeRaidSection}
                  sections={generateRAIDSections(raidData)}
                  sowData={raidData}
                  currentWorkspace={null}
                  currentDocument={null}
                />
              </div>
            </div>
          ) : (
            <div className="dashboard-section">
              <h2 className="section-title">RAIDD Data</h2>
              <div className="section-content">
                <p className="empty-state">No RAID data available</p>
                <Button onClick={fetchRaidData}>Load RAID Data</Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Right Panel */}
      <RightPanel
        isOpen={rightPanelOpen}
        onClose={closeRightPanel}
        title={rightPanelConfig?.title}
        data={rightPanelData}
        loading={rightPanelLoading}
        error={rightPanelError}
        columns={rightPanelConfig?.columns}
        icon={rightPanelConfig?.icon}
        emptyMessage={`No ${rightPanelConfig?.title?.toLowerCase() || 'data'} available`}
      />
    </div>
  );
};

export default Dashboard;
