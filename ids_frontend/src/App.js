import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import { WorkspaceProvider, useWorkspace } from './contexts/WorkspaceContext';
import PageWrapper from './components/layout/PageWrapper';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import WorkspaceSidebar from './components/layout/WorkspaceSidebar';
import WorkspaceWrapper from './components/layout/WorkspaceWrapper';
import WorkspaceList from './features/workspaces/WorkspaceList';
import MeetingList from './features/meetings/MeetingList';
import MeetingDetail from './features/meetings/MeetingDetail';
import Dashboard from './features/dashboard/Dashboard';
import SoWViewer from './features/viewer/SoWViewer';
import BRDView from './features/brd/BRDView';
import RAIDView from './features/raid/RAIDView';
import Snackbar from './components/common/Snackbar';

const AppContent = () => {
  const { snackbar, hideSnackbar, sidebarCollapsed } = useWorkspace();
  const location = useLocation();
  
  // Check if we're inside a workspace
  const isWorkspaceRoute = location.pathname.startsWith('/workspace/');
  
  return (
    <div className="app">
      <Header />
      <div className={`app-body ${isWorkspaceRoute ? 'app-body-workspace' : ''} ${isWorkspaceRoute && sidebarCollapsed ? 'app-body-collapsed' : ''}`}>
        {isWorkspaceRoute ? <WorkspaceSidebar /> : <Sidebar />}
        <PageWrapper>
          <Routes>
            <Route path="/" element={<Navigate to="/workspaces" replace />} />
            <Route path="/workspaces" element={<WorkspaceList />} />
            <Route
              path="/workspace/:workspaceId/view"
              element={
                <WorkspaceWrapper>
                  <SoWViewer />
                </WorkspaceWrapper>
              }
            />
            <Route
              path="/workspace/:workspaceId/dashboard"
              element={
                <WorkspaceWrapper>
                  <Dashboard />
                </WorkspaceWrapper>
              }
            />
            <Route
              path="/workspace/:workspaceId/meetings"
              element={
                <WorkspaceWrapper>
                  <WorkspaceWithMeetings />
                </WorkspaceWrapper>
              }
            />
            <Route
              path="/workspace/:workspaceId/meeting/:meetingId"
              element={
                <WorkspaceWrapper>
                  <MeetingDetail />
                </WorkspaceWrapper>
              }
            />
            <Route
              path="/workspace/:workspaceId/brd"
              element={
                <WorkspaceWrapper>
                  <BRDView />
                </WorkspaceWrapper>
              }
            />
            <Route
              path="/workspace/:workspaceId/raid"
              element={
                <WorkspaceWrapper>
                  <RAIDView />
                </WorkspaceWrapper>
              }
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

