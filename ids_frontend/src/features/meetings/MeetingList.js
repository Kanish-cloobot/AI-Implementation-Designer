import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { meetingAPI } from '../../services/api';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import Snackbar from '../../components/common/Snackbar';
import ConfirmationPopup from '../../components/common/ConfirmationPopup';
import MeetingForm from './MeetingForm';
import './MeetingList.css';

const MeetingList = ({ workspaceId, orgId = 'default_org' }) => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('scheduled');
  const [showForm, setShowForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [deletingMeeting, setDeletingMeeting] = useState(null);
  const [snackbar, setSnackbar] = useState({ show: false, message: '', type: 'success' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchMeetings();
  }, [workspaceId, activeTab]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const status = activeTab === 'scheduled' ? 'scheduled' : activeTab === 'completed' ? 'completed' : null;
      const payload = { 
        workspace_id: workspaceId, 
        org_id: orgId, 
        status: status 
      };
      const response = await meetingAPI.getAll(payload);
      setMeetings(response.data);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      showSnackbar('Failed to load meetings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = () => {
    setEditingMeeting(null);
    setShowForm(true);
  };

  const handleEditMeeting = (meeting) => {
    setEditingMeeting(meeting);
    setShowForm(true);
  };

  const handleDeleteClick = (meeting) => {
    setDeletingMeeting(meeting);
  };

  const handleDeleteConfirm = async () => {
    try {
      const payload = { 
        meeting_id: deletingMeeting.meeting_id, 
        org_id: orgId 
      };
      await meetingAPI.delete(payload);
      showSnackbar('Meeting deleted successfully', 'success');
      setDeletingMeeting(null);
      fetchMeetings();
    } catch (error) {
      console.error('Error deleting meeting:', error);
      showSnackbar('Failed to delete meeting', 'error');
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingMeeting(null);
    fetchMeetings();
    showSnackbar(
      editingMeeting ? 'Meeting updated successfully' : 'Meeting created successfully',
      'success'
    );
  };

  const handleViewDetails = (meetingId) => {
    navigate(`/workspace/${workspaceId}/meeting/${meetingId}`);
  };

  const showSnackbar = (message, type = 'success') => {
    setSnackbar({ show: true, message, type });
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

  const getFilteredMeetings = () => {
    if (activeTab === 'all') return meetings;
    return meetings;
  };

  const filteredMeetings = getFilteredMeetings();

  return (
    <div className="meeting-list-container">
      <div className="meeting-list-header">
        <div className="meeting-list-title-section">
          <h2 className="meeting-list-title">Meetings</h2>
          <p className="meeting-list-subtitle">
            Schedule meetings and extract insights from conversations
          </p>
        </div>
        <Button variant="primary" onClick={handleCreateMeeting}>
          <span className="material-symbols-outlined">add</span>
          Create Meeting
        </Button>
      </div>

      <div className="meeting-tabs">
        <button
          className={`meeting-tab ${activeTab === 'scheduled' ? 'active' : ''}`}
          onClick={() => setActiveTab('scheduled')}
        >
          Scheduled Meetings
        </button>
        <button
          className={`meeting-tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          Completed Meetings
        </button>
        <button
          className={`meeting-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          Extended Insights
        </button>
      </div>

      {loading ? (
        <div className="meeting-list-loading">
          <Spinner />
        </div>
      ) : filteredMeetings.length === 0 ? (
        <div className="meeting-list-empty">
          <span className="material-symbols-outlined">event_available</span>
          <p>No meetings found</p>
          <Button variant="secondary" onClick={handleCreateMeeting}>
            Create Your First Meeting
          </Button>
        </div>
      ) : (
        <div className="meeting-list-grid">
          <table className="meeting-table">
            <thead className="meeting-table-header">
              <tr>
                <th>Meeting Name</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Stakeholders</th>
                <th>Files</th>
                <th>Details</th>
                <th className="actions">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMeetings.map((meeting) => (
                <tr key={meeting.meeting_id} className="meeting-table-row">
                  <td className="meeting-table-cell">
                    <div className="meeting-name" onClick={() => handleViewDetails(meeting.meeting_id)}>
                      {meeting.meeting_name}
                    </div>
                  </td>
                  <td className="meeting-table-cell">
                    <div className="meeting-datetime">{formatDateTime(meeting.meeting_datetime)}</div>
                  </td>
                  <td className="meeting-table-cell status">
                    <span className={`meeting-status-badge ${meeting.status}`}>
                      {meeting.status}
                    </span>
                  </td>
                  <td className="meeting-table-cell">
                    {meeting.stakeholders || '-'}
                  </td>
                  <td className="meeting-table-cell">
                    {meeting.file_count > 0 ? `${meeting.file_count} file${meeting.file_count !== 1 ? 's' : ''}` : '-'}
                  </td>
                  <td className="meeting-table-cell">
                    {meeting.meeting_details ? (
                      meeting.meeting_details.length > 50
                        ? `${meeting.meeting_details.substring(0, 50)}...`
                        : meeting.meeting_details
                    ) : '-'}
                  </td>
                  <td className="meeting-table-cell actions">
                    <button
                      className="meeting-action-btn"
                      onClick={() => handleEditMeeting(meeting)}
                      title="Edit Meeting"
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button
                      className="meeting-action-btn"
                      onClick={() => handleDeleteClick(meeting)}
                      title="Delete Meeting"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <MeetingForm
          workspaceId={workspaceId}
          orgId={orgId}
          meeting={editingMeeting}
          onClose={() => {
            setShowForm(false);
            setEditingMeeting(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}

      {deletingMeeting && (
        <ConfirmationPopup
          title="Delete Meeting"
          message={`Are you sure you want to delete "${deletingMeeting.meeting_name}"? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingMeeting(null)}
        />
      )}

      {snackbar.show && (
        <Snackbar
          message={snackbar.message}
          type={snackbar.type}
          onClose={() => setSnackbar({ ...snackbar, show: false })}
        />
      )}
    </div>
  );
};

export default MeetingList;

