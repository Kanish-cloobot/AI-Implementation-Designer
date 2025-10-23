import React from 'react';

const createProjectOverviewContent = (scopeSummary) => (
  <div className="doc-details-content-section">
    <h3 className="doc-details-content-title">Project Overview</h3>
    <p className="doc-details-content-text">
      This project involves implementing Salesforce CRM to manage all client relationships and 
      service workflows for Horizon Travel Group (HTG). The implementation will support customer 
      lifecycle management, automate manual processes, and provide data-driven insights to improve 
      client service quality and operational visibility.
    </p>
    
    <h3 className="doc-details-content-title">In Scope</h3>
    {scopeSummary?.in_scope && scopeSummary.in_scope.length > 0 ? (
      <ul className="doc-details-list">
        {scopeSummary.in_scope.map((item, index) => (
          <li key={index} className="doc-details-list-item">{item}</li>
        ))}
      </ul>
    ) : (
      <p className="doc-details-content-text">No in-scope items defined.</p>
    )}
    
    <h3 className="doc-details-content-title">Out of Scope</h3>
    {scopeSummary?.out_of_scope && scopeSummary.out_of_scope.length > 0 ? (
      <ul className="doc-details-list">
        {scopeSummary.out_of_scope.map((item, index) => (
          <li key={index} className="doc-details-list-item">{item}</li>
        ))}
      </ul>
    ) : (
      <p className="doc-details-content-text">No out-of-scope items defined.</p>
    )}
  </div>
);

const createAssumptionsContent = (assumptions) => (
  <div className="doc-details-content-section">
    {assumptions && assumptions.length > 0 ? (
      <ul className="doc-details-list">
        {assumptions.map((assumption, index) => (
          <li key={index} className="doc-details-list-item">
            {typeof assumption === 'string' ? assumption : 
             typeof assumption === 'object' && assumption !== null ? 
               assumption.text || assumption.description || JSON.stringify(assumption) : 
               String(assumption)}
          </li>
        ))}
      </ul>
    ) : (
      <p className="doc-details-content-text">No assumptions defined.</p>
    )}
  </div>
);

const createModulesContent = (modules) => (
  <div className="doc-details-content-section">
    {modules && modules.length > 0 ? (
      <div className="doc-details-content-section">
        {modules.map((module, index) => (
          <div key={index} className="doc-details-content-section">
            <h3 className="doc-details-content-title">{module.module_name}</h3>
            <p className="doc-details-content-text">{module.description}</p>
            {module.processes && module.processes.length > 0 && (
              <div>
                <h4 className="doc-details-content-title">Processes:</h4>
                <ul className="doc-details-list">
                  {module.processes.map((process, pIndex) => (
                    <li key={pIndex} className="doc-details-list-item">
                      {typeof process === 'string' ? process : 
                       typeof process === 'object' && process !== null ? 
                         process.name || process.description || JSON.stringify(process) : 
                         String(process)}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    ) : (
      <p className="doc-details-content-text">No modules defined.</p>
    )}
  </div>
);

const createLicensesContent = (licenses) => (
  <div className="doc-details-content-section">
    {licenses && licenses.length > 0 ? (
      <ul className="doc-details-list">
        {licenses.map((license, index) => (
          <li key={index} className="doc-details-list-item">
            {typeof license === 'string' ? license : 
             typeof license === 'object' && license !== null ? 
               `${license.license_type || 'License'}: ${license.count || 1}` : 
               String(license)}
          </li>
        ))}
      </ul>
    ) : (
      <p className="doc-details-content-text">No Salesforce licenses defined.</p>
    )}
  </div>
);

const createBusinessUnitsContent = (businessUnits) => (
  <div className="doc-details-content-section">
    {businessUnits && businessUnits.length > 0 ? (
      <div className="doc-details-content-section">
        {businessUnits.map((unit, index) => (
          <div key={index} className="doc-details-content-section">
            <h3 className="doc-details-content-title">{unit.business_unit_name}</h3>
            {unit.stakeholders && unit.stakeholders.length > 0 ? (
              <div>
                <h4 className="doc-details-content-title">Stakeholders:</h4>
                <ul className="doc-details-list">
                  {unit.stakeholders.map((stakeholder, sIndex) => (
                    <li key={sIndex} className="doc-details-list-item">
                      <strong>{stakeholder.name}</strong> - {stakeholder.designation}
                      {stakeholder.email && <span> ({stakeholder.email})</span>}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="doc-details-content-text">No stakeholders defined for this business unit.</p>
            )}
          </div>
        ))}
      </div>
    ) : (
      <p className="doc-details-content-text">No business units defined.</p>
    )}
  </div>
);

const createValidationContent = (validationSummary) => (
  <div className="doc-details-content-section">
    {validationSummary ? (
      <div>
        <div className="doc-details-content-section">
          <h3 className="doc-details-content-title">JSON Validity</h3>
          <span className={`doc-details-validation-badge ${validationSummary.json_validity ? 'valid' : 'invalid'}`}>
            {validationSummary.json_validity ? 'Valid' : 'Invalid'}
          </span>
        </div>
        
        {validationSummary.issues_detected && validationSummary.issues_detected.length > 0 && (
          <div className="doc-details-content-section">
            <h3 className="doc-details-content-title">Issues Detected</h3>
            <ul className="doc-details-list">
              {validationSummary.issues_detected.map((issue, index) => (
                <li key={index} className="doc-details-list-item">
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    ) : (
      <p className="doc-details-content-text">No validation information available.</p>
    )}
  </div>
);

const createOverviewSection = (sowData) => ({
  id: 'overview',
  title: 'Overview',
  icon: 'overview',
  children: [
    {
      id: 'project-overview',
      title: 'Project Overview',
      icon: 'description',
      content: createProjectOverviewContent(sowData.scope_summary)
    },
    {
      id: 'primary-objective',
      title: 'Primary Objective',
      icon: 'target',
      content: (
        <div className="doc-details-content-section">
          <p className="doc-details-content-text">
            {sowData.scope_summary?.primary_objective || 'Primary objective information not available.'}
          </p>
        </div>
      )
    },
    {
      id: 'business-units',
      title: 'Business Units & Stakeholders',
      icon: 'groups',
      content: createBusinessUnitsContent(sowData.business_units)
    },
    {
      id: 'assumptions',
      title: 'Assumptions',
      icon: 'info',
      content: createAssumptionsContent(sowData.assumptions)
    }
  ]
});

// const createStructureSection = (sowData) => ({
//   id: 'structure',
//   title: 'Structure',
//   icon: 'account_tree',
//   children: [
//     {
//       id: 'personas',
//       title: 'Personas',
//       icon: 'person',
//       children: generatePersonaSections(sowData.business_units)
//     },
//     {
//       id: 'data-models',
//       title: 'Data models',
//       icon: 'storage',
//       children: generateDataModelSections(sowData)
//     }
//   ]
// });

const createModulesSection = (sowData) => ({
  id: 'modules',
  title: 'Modules & Processes',
  icon: 'widgets',
  content: createModulesContent(sowData.modules)
});

const createLicensesSection = (sowData) => ({
  id: 'licenses',
  title: 'Salesforce Licenses',
  icon: 'verified_user',
  content: createLicensesContent(sowData.salesforce_licenses)
});

const createValidationSection = (sowData) => ({
  id: 'validation',
  title: 'Validation Summary',
  icon: 'verified',
  content: createValidationContent(sowData.validation_summary)
});

export const generateDocumentationSections = (sowData) => {
  if (!sowData) return [];

  return [
    createOverviewSection(sowData),
    createModulesSection(sowData),
    createLicensesSection(sowData),
    createValidationSection(sowData)
  ];
};

