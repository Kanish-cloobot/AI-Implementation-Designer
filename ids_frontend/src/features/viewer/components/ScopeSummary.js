import React from 'react';
import './ScopeSummary.css';

const ScopeSummary = ({ data }) => {
  if (!data) return null;

  return (
    <div className="scope-summary">
      <h2 className="scope-summary-title">
        <span className="material-symbols-outlined">scope</span>
        Project Scope
      </h2>
      
      <div className="scope-summary-grid">
        <div className="scope-summary-card scope-in">
          <div className="scope-summary-card-header">
            <span className="material-symbols-outlined scope-icon">check_circle</span>
            <h3 className="scope-summary-card-title">In Scope</h3>
          </div>
          <ul className="scope-summary-list">
            {data.in_scope && data.in_scope.length > 0 ? (
              data.in_scope.map((item, index) => (
                <li key={index} className="scope-summary-list-item">
                  {item}
                </li>
              ))
            ) : (
              <li className="scope-summary-list-item-empty">No items specified</li>
            )}
          </ul>
        </div>

        <div className="scope-summary-card scope-out">
          <div className="scope-summary-card-header">
            <span className="material-symbols-outlined scope-icon">cancel</span>
            <h3 className="scope-summary-card-title">Out of Scope</h3>
          </div>
          <ul className="scope-summary-list">
            {data.out_of_scope && data.out_of_scope.length > 0 ? (
              data.out_of_scope.map((item, index) => (
                <li key={index} className="scope-summary-list-item">
                  {item}
                </li>
              ))
            ) : (
              <li className="scope-summary-list-item-empty">No items specified</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ScopeSummary;

