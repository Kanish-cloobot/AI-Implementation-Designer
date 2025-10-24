import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { WorkspaceProvider, useWorkspace } from './contexts/WorkspaceContext';
import PageWrapper from './components/layout/PageWrapper';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import SecondarySidebar from './components/layout/SecondarySidebar';
import WorkspaceList from './features/workspaces/WorkspaceList';
import MeetingList from './features/meetings/MeetingList';
import MeetingDetail from './features/meetings/MeetingDetail';
import Dashboard from './features/dashboard/Dashboard';
import SoWViewer from './features/viewer/SoWViewer';
import BRDView from './features/brd/BRDView';
import RAIDView from './features/raid/RAIDView';
import Snackbar from './components/common/Snackbar';

const AppContent = () => {
  const { snackbar, hideSnackbar } = useWorkspace();

  return (
    <div className="app">
      <Header />
      <div className="app-body">
        <Sidebar />
        <SecondarySidebar />
        <PageWrapper>
          <Routes>
            <Route path="/" element={<Navigate to="/workspaces" replace />} />
            <Route path="/workspaces" element={<WorkspaceList />} />
            <Route
              path="/workspace/:workspaceId/dashboard"
              element={<Dashboard />}
            />
            <Route
              path="/workspace/:workspaceId/meetings"
              element={<WorkspaceWithMeetings />}
            />
            <Route
              path="/workspace/:workspaceId/meeting/:meetingId"
              element={<MeetingDetail />}
            />
            <Route
              path="/workspace/:workspaceId/sow"
              element={<SoWViewer />}
            />
            <Route
              path="/workspace/:workspaceId/brd"
              element={<BRDView />}
            />
            <Route
              path="/workspace/:workspaceId/raid"
              element={<RAIDView />}
            />
          </Routes>
        </PageWrapper>
      </div>
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        type={snackbar.type}
        duration={snackbar.duration}
        onClose={hideSnackbar}
      />
    </div>
  );
};

const WorkspaceWithMeetings = () => {
  const { workspaceId } = useParams();
  return <MeetingList workspaceId={workspaceId} />;
};

function App() {
  return (
    <BrowserRouter>
      <WorkspaceProvider>
        <AppContent />
      </WorkspaceProvider>
    </BrowserRouter>
  );
}

export default App;

