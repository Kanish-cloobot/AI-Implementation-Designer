import React, { useState } from 'react';
import './ModulesAndProcesses.css';

const ModulesAndProcesses = ({ data }) => {
  const [expandedModules, setExpandedModules] = useState([]);

  if (!data || data.length === 0) {
    return (
      <div className="modules-processes">
        <h2 className="modules-processes-title">
          <span className="material-symbols-outlined">widgets</span>
          Modules & Processes
        </h2>
        <p className="modules-processes-empty">No modules specified</p>
      </div>
    );
  }

  const toggleModule = (index) => {
    setExpandedModules((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="modules-processes">
      <h2 className="modules-processes-title">
        <span className="material-symbols-outlined">widgets</span>
        Modules & Processes
      </h2>
      
      <div className="modules-processes-grid">
        {data.map((module, index) => (
          <div key={index} className="module-card">
            <div
              className="module-card-header"
              onClick={() => toggleModule(index)}
            >
              <div className="module-card-header-left">
                <span className="material-symbols-outlined module-icon">
                  extension
                </span>
                <div className="module-card-header-info">
                  <h3 className="module-card-title">{module.module_name}</h3>
                  {module.description && (
                    <p className="module-card-description">{module.description}</p>
                  )}
                </div>
              </div>
              <span className={`material-symbols-outlined module-expand-icon ${
                expandedModules.includes(index) ? 'expanded' : ''
              }`}>
                expand_more
              </span>
            </div>

            {expandedModules.includes(index) && (
              <div className="module-card-content">
                {module.processes && module.processes.length > 0 ? (
                  <ul className="module-processes-list">
                    {module.processes.map((process, pIdx) => (
                      <li key={pIdx} className="module-process-item">
                        {process}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="module-processes-empty">No processes specified</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModulesAndProcesses;

