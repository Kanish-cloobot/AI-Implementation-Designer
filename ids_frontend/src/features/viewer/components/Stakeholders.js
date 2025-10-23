import React from 'react';
import './Stakeholders.css';

const Stakeholders = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="stakeholders-card">
        <h2 className="stakeholders-title">
          <span className="material-symbols-outlined">groups</span>
          Stakeholders
        </h2>
        <p className="stakeholders-empty">No stakeholders specified</p>
      </div>
    );
  }

  return (
    <div className="stakeholders-card">
      <h2 className="stakeholders-title">
        <span className="material-symbols-outlined">groups</span>
        Stakeholders
      </h2>
      
      <div className="stakeholders-list">
        {data.map((bu, index) => (
          <div key={index} className="stakeholder-bu">
            <h3 className="stakeholder-bu-name">
              <span className="material-symbols-outlined">business</span>
              {bu.business_unit_name}
            </h3>
            
            {bu.stakeholders && bu.stakeholders.length > 0 ? (
              <div className="stakeholder-items">
                {bu.stakeholders.map((stakeholder, sIdx) => (
                  <div key={sIdx} className="stakeholder-item">
                    <div className="stakeholder-item-header">
                      <span className="material-symbols-outlined stakeholder-icon">
                        person
                      </span>
                      <div className="stakeholder-item-info">
                        <p className="stakeholder-name">{stakeholder.name}</p>
                        {stakeholder.designation && (
                          <p className="stakeholder-designation">
                            {stakeholder.designation}
                          </p>
                        )}
                        {stakeholder.email && (
                          <p className="stakeholder-email">
                            <span className="material-symbols-outlined">email</span>
                            {stakeholder.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="stakeholder-items-empty">No stakeholders specified</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stakeholders;

