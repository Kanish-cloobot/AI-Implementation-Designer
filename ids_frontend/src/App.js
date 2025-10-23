import React from 'react';
import './App.css';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import PageWrapper from './components/layout/PageWrapper';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import WorkspaceList from './features/workspaces/WorkspaceList';

function App() {
  return (
    <WorkspaceProvider>
      <div className="app">
        <Header />
        <div className="app-body">
          <Sidebar />
          <PageWrapper>
            <WorkspaceList />
          </PageWrapper>
        </div>
      </div>
    </WorkspaceProvider>
  );
}

export default App;

