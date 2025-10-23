import React from 'react';

const createProjectOverviewContent = (scopeSummary) => (
  <div className="doc-details-content-section">
    <h3 className="doc-details-content-title">Company Background</h3>
    <p className="doc-details-content-text">
      {scopeSummary?.company_background || 'Company background information not available.'}
    </p>
    
    <h3 className="doc-details-content-title">Project Purpose & Business Need</h3>
    <p className="doc-details-content-text">
      {scopeSummary?.project_purpose || 'Project purpose information not available.'}
    </p>
    
    <h3 className="doc-details-content-title">Scope of Implementation</h3>
    <p className="doc-details-content-text">
      {scopeSummary?.scope_of_implementation || 'Scope of implementation details not available.'}
    </p>
    
    <h3 className="doc-details-content-title">Expected Outcomes & Benefits</h3>
    <p className="doc-details-content-text">
      {scopeSummary?.expected_outcomes || 'Expected outcomes information not available.'}
    </p>
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
            <h3 className="doc-details-content-title">{module.name}</h3>
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
      id: 'out-of-scope',
      title: 'Out of scope',
      icon: 'block',
      content: (
        <div className="doc-details-content-section">
          <p className="doc-details-content-text">
            {sowData.scope_summary?.out_of_scope || 'Out of scope items not defined.'}
          </p>
        </div>
      )
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

// const createValidationSection = (sowData) => ({
//   id: 'validation',
//   title: 'Validation Summary',
//   icon: 'verified',
//   content: createValidationContent(sowData.validation_summary)
// });

export const generateDocumentationSections = (sowData) => {
  if (!sowData) return [];

  return [
    createOverviewSection(sowData),
    // createStructureSection(sowData),
    createModulesSection(sowData),
    createLicensesSection(sowData),
    // createValidationSection(sowData)
  ];
};

const generatePersonaSections = (businessUnits) => {
  if (!businessUnits || businessUnits.length === 0) {
    return [{
      id: 'no-personas',
      title: 'No personas defined',
      icon: 'person_off',
      content: (
        <div className="doc-details-content-section">
          <p className="doc-details-content-text">No business units or personas defined.</p>
        </div>
      )
    }];
  }

  return businessUnits.map((unit, index) => ({
    id: `persona-${index + 1}`,
    title: `P${index + 1} - ${unit.name}`,
    icon: 'person',
    content: (
      <div className="doc-details-content-section">
        <h3 className="doc-details-content-title">{unit.name}</h3>
        <p className="doc-details-content-text">{unit.description || 'No description available.'}</p>
        {unit.responsibilities && unit.responsibilities.length > 0 && (
          <div>
            <h4 className="doc-details-content-title">Responsibilities:</h4>
            <ul className="doc-details-list">
              {unit.responsibilities.map((responsibility, rIndex) => (
                <li key={rIndex} className="doc-details-list-item">
                  {responsibility}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }));
};

const generateDataModelSections = (sowData) => {
  // This would typically come from the SoW data structure
  // For now, we'll create some placeholder sections
  return [
    {
      id: 'data-model-1',
      title: 'D1 - Account',
      icon: 'business',
      content: (
        <div className="doc-details-content-section">
          <p className="doc-details-content-text">Account data model information would be displayed here.</p>
        </div>
      )
    },
    {
      id: 'data-model-2',
      title: 'D2 - Contact',
      icon: 'contact_page',
      content: (
        <div className="doc-details-content-section">
          <p className="doc-details-content-text">Contact data model information would be displayed here.</p>
        </div>
      )
    }
  ];
};
