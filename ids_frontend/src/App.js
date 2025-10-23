import React, { useState } from 'react';
import './App.css';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import PageWrapper from './components/layout/PageWrapper';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import WorkspaceList from './features/workspaces/WorkspaceList';

function App() {
  const [currentView, setCurrentView] = useState('workspace-list');

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
    <WorkspaceProvider>
      <div className="app">
        <Header />
        <div className="app-body">
          <Sidebar onNavigate={handleSidebarNavigation} />
          <PageWrapper>
            {renderCurrentView()}
          </PageWrapper>
        </div>
      </div>
    </WorkspaceProvider>
  );
}

export default App;

