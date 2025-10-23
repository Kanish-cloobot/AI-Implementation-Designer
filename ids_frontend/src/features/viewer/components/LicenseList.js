import React from 'react';
import './LicenseList.css';

const LicenseList = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="license-list-card">
        <h2 className="license-list-title">
          <span className="material-symbols-outlined">badge</span>
          Salesforce Licenses
        </h2>
        <p className="license-list-empty">No licenses specified</p>
      </div>
    );
  }

  return (
    <div className="license-list-card">
      <h2 className="license-list-title">
        <span className="material-symbols-outlined">badge</span>
        Salesforce Licenses
      </h2>
      
      <div className="license-list">
        {data.map((license, index) => (
          <div key={index} className="license-item">
            <div className="license-item-icon">
              <span className="material-symbols-outlined">verified</span>
            </div>
            <div className="license-item-info">
              <p className="license-item-type">{license.license_type}</p>
              {license.count && (
                <p className="license-item-count">
                  Count: <span>{license.count}</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LicenseList;

