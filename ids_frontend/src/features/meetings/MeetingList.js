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
      const response = await meetingAPI.getAll(workspaceId, orgId, status);
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
      await meetingAPI.delete(deletingMeeting.meeting_id, orgId);
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
          {filteredMeetings.map((meeting) => (
            <div key={meeting.meeting_id} className="meeting-card">
              <div className="meeting-card-header">
                <div className="meeting-card-status">
                  <span className={`meeting-status-badge ${meeting.status}`}>
                    {meeting.status}
                  </span>
                </div>
                <div className="meeting-card-actions">
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
                </div>
              </div>

              <div
                className="meeting-card-body"
                onClick={() => handleViewDetails(meeting.meeting_id)}
              >
                <h3 className="meeting-card-name">{meeting.meeting_name}</h3>

                <div className="meeting-card-info">
                  <div className="meeting-info-item">
                    <span className="material-symbols-outlined">schedule</span>
                    <span>{formatDateTime(meeting.meeting_datetime)}</span>
                  </div>

                  {meeting.stakeholders && (
                    <div className="meeting-info-item">
                      <span className="material-symbols-outlined">group</span>
                      <span>{meeting.stakeholders}</span>
                    </div>
                  )}

                  {meeting.file_count > 0 && (
                    <div className="meeting-info-item">
                      <span className="material-symbols-outlined">attach_file</span>
                      <span>{meeting.file_count} file{meeting.file_count !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>

                {meeting.meeting_details && (
                  <p className="meeting-card-details">
                    {meeting.meeting_details.substring(0, 100)}
                    {meeting.meeting_details.length > 100 ? '...' : ''}
                  </p>
                )}
              </div>

              <div className="meeting-card-footer">
                <Button variant="secondary" onClick={() => handleViewDetails(meeting.meeting_id)}>
                  View Details
                </Button>
              </div>
            </div>
          ))}
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

