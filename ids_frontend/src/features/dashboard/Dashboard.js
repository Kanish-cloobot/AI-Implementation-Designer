import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { dashboardAPI } from '../../services/api';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import './Dashboard.css';

const Dashboard = () => {
  const { workspaceId } = useParams();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [workspaceId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await dashboardAPI.getDashboard(workspaceId);
      setDashboardData(response.data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
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

  const renderSummaryCard = (title, count, icon, color = 'default') => (
    <div className={`summary-card ${color}`}>
      <div className="summary-card-icon">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div className="summary-card-content">
        <h3 className="summary-card-title">{title}</h3>
        <p className="summary-card-count">{count}</p>
      </div>
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

      {/* Summary Cards */}
      <div className="dashboard-summary">
        <h2 className="section-title">Project Summary</h2>
        <div className="summary-cards-grid">
          {renderSummaryCard(
            'Meetings',
            safeSummary.meeting_count || 0,
            'event',
            'blue'
          )}
          {renderSummaryCard(
            'Requirements',
            safeSummary.requirements_count || 0,
            'assignment',
            'purple'
          )}
          {renderSummaryCard(
            'Risks & Issues',
            safeSummary.risks_issues_count || 0,
            'warning',
            'red'
          )}
          {renderSummaryCard(
            'Action Items',
            safeSummary.action_items_count || 0,
            'task_alt',
            'orange'
          )}
          {renderSummaryCard(
            'Decisions',
            safeSummary.decisions_count || 0,
            'gavel',
            'green'
          )}
          {renderSummaryCard(
            'Dependencies',
            safeSummary.dependencies_count || 0,
            'link',
            'blue'
          )}
        </div>
      </div>

      {/* <div className="dashboard-content">
        <div className="dashboard-section">
          <h2 className="section-title">Recent Meetings</h2>
          <div className="recent-meetings">
            {safeRecentMeetings.length > 0 ? (
              safeRecentMeetings.map(renderRecentMeeting)
            ) : (
              <p className="empty-state">No recent meetings</p>
            )}
          </div>
        </div>

        <div className="dashboard-section">
          <h2 className="section-title">Upcoming Meetings</h2>
          <div className="upcoming-meetings">
            {safeUpcomingMeetings.length > 0 ? (
              safeUpcomingMeetings.map(renderRecentMeeting)
            ) : (
              <p className="empty-state">No upcoming meetings</p>
            )}
          </div>
        </div>

        <div className="dashboard-section">
          <h2 className="section-title">Recent Activity</h2>
          <div className="recent-activity">
            {recent_activity && recent_activity.length > 0 ? (
              recent_activity.map(renderActivityItem)
            ) : (
              <p className="empty-state">No recent activity</p>
            )}
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default Dashboard;
