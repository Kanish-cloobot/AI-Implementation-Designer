import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate, useParams, useLocation, useNavigate } from 'react-router-dom';
import { WorkspaceProvider, useWorkspace } from './contexts/WorkspaceContext';
import PageWrapper from './components/layout/PageWrapper';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import WorkspaceSidebar from './components/layout/WorkspaceSidebar';
import WorkspaceWrapper from './components/layout/WorkspaceWrapper';
import WorkspaceRedirect from './components/WorkspaceRedirect';
  import WorkspaceList from './features/workspaces/WorkspaceList';
import MeetingList from './features/meetings/MeetingList';
import MeetingDetail from './features/meetings/MeetingDetail';
import Dashboard from './features/dashboard/Dashboard';
import BRDView from './features/brd/BRDView';
import RAIDView from './features/raid/RAIDView';
import SoWViewer from './features/viewer/SoWViewer';
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
          <WorkspaceRedirect>
            <Routes>
              <Route path="/" element={<Navigate to="/workspaces" replace />} />
              <Route path="/workspaces" element={<WorkspaceList />} />
              <Route
                path="/workspace/:workspaceId/view"
                element={
                  <WorkspaceWrapper>
                    <WorkspaceView />
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
          </WorkspaceRedirect>
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

const WorkspaceView = () => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/workspaces');
  };
  
  return <SoWViewer onBack={handleBack} />;
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

