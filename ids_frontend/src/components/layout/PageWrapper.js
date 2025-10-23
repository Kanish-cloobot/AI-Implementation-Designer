import React from 'react';
import './PageWrapper.css';

const PageWrapper = ({ children }) => {
  return (
    <main className="page-wrapper">
      <div className="page-content">{children}</div>
    </main>
  );
};

export default PageWrapper;

