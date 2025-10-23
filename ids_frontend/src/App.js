import React, { useState } from 'react';
import './App.css';
import { WorkspaceProvider, useWorkspace } from './contexts/WorkspaceContext';
import PageWrapper from './components/layout/PageWrapper';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import WorkspaceList from './features/workspaces/WorkspaceList';
import Snackbar from './components/common/Snackbar';

const AppContent = () => {
  const [currentView, setCurrentView] = useState('workspace-list');
  const { snackbar, hideSnackbar } = useWorkspace();

  const handleSidebarNavigation = () => {
    setCurrentView('workspace-list');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'workspace-list':
        return <WorkspaceList onNavigateToViewer={() => setCurrentView('sow-viewer')} />;
      case 'sow-viewer':
        return <WorkspaceList onNavigateToViewer={() => setCurrentView('sow-viewer')} />;
      default:
        return <WorkspaceList onNavigateToViewer={() => setCurrentView('sow-viewer')} />;
    }
  };

  return (
    <div className="app">
      <Header />
      <div className="app-body">
        <Sidebar onNavigate={handleSidebarNavigation} />
        <PageWrapper>
          {renderCurrentView()}
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

function App() {
  return (
    <WorkspaceProvider>
      <AppContent />
    </WorkspaceProvider>
  );
}

export default App;

