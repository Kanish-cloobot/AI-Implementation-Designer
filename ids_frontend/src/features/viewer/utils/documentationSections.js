import React from 'react';
import GenericBRDTable from '../../brd/components/GenericBRDTable';

const createProjectOverviewContent = (scopeSummary) => {
  // Create a combined table for scope items
  const scopeData = [];
  
  // Add in-scope items
  if (scopeSummary?.in_scope && scopeSummary.in_scope.length > 0) {
    scopeSummary.in_scope.forEach((item, index) => {
      scopeData.push({
        item: item,
        scope_type: 'In Scope'
      });
    });
  }
  
  // Add out-of-scope items
  if (scopeSummary?.out_of_scope && scopeSummary.out_of_scope.length > 0) {
    scopeSummary.out_of_scope.forEach((item, index) => {
      scopeData.push({
        item: item,
        scope_type: 'Out of Scope'
      });
    });
  }

  if (scopeData.length === 0) {
    return (
      <div className="doc-details-content-section">
        <h3 className="doc-details-content-title">Project Overview</h3>
        <p className="doc-details-content-text">
          This project involves implementing Salesforce CRM to manage all client relationships and 
          service workflows for Horizon Travel Group (HTG). The implementation will support customer 
          lifecycle management, automate manual processes, and provide data-driven insights to improve 
          client service quality and operational visibility.
        </p>
        <p className="doc-details-content-text">No scope items defined.</p>
      </div>
    );
  }

  const scopeColumns = [
    {
      key: 'item',
      header: 'Scope Item',
      accessor: (item) => item.item,
      className: 'primary-column'
    },
    {
      key: 'scope_type',
      header: 'Scope Type',
      accessor: (item) => item.scope_type,
      className: 'scope-type-column'
    }
  ];

  return (
    <div className="doc-details-content-section">
      <h3 className="doc-details-content-title">Project Overview</h3>
      <p className="doc-details-content-text">
        This project involves implementing Salesforce CRM to manage all client relationships and 
        service workflows for Horizon Travel Group (HTG). The implementation will support customer 
        lifecycle management, automate manual processes, and provide data-driven insights to improve 
        client service quality and operational visibility.
      </p>
      <GenericBRDTable
        data={scopeData}
        columns={scopeColumns}
        title="Project Scope"
        icon="description"
        showCreatedAt={false}
      />
    </div>
  );
};

const createPrimaryObjectiveContent = (scopeSummary) => {
  const primaryObjective = scopeSummary?.primary_objective;
  
  if (!primaryObjective) {
    return (
      <div className="doc-details-content-section">
        <p className="doc-details-content-text">Primary objective information not available.</p>
      </div>
    );
  }

  // Create a simple table for the primary objective
  const objectiveData = [{
    objective: primaryObjective
  }];

  const objectiveColumns = [
    {
      key: 'objective',
      header: 'Primary Objective',
      accessor: (item) => item.objective,
      className: 'primary-column'
    }
  ];

  return (
    <GenericBRDTable
      data={objectiveData}
      columns={objectiveColumns}
      title="Primary Objective"
      icon="target"
      showCreatedAt={false}
    />
  );
};

const createAssumptionsContent = (assumptions) => {
  if (!assumptions || assumptions.length === 0) {
    return (
      <div className="doc-details-content-section">
        <p className="doc-details-content-text">No assumptions defined.</p>
      </div>
    );
  }

  // Normalize assumptions data for table display - only use actual data
  const tableData = assumptions.map((assumption, index) => {
    if (typeof assumption === 'string') {
      return {
        assumption_text: assumption
      };
    } else if (typeof assumption === 'object' && assumption !== null) {
      return {
        assumption_text: assumption.text || assumption.description || JSON.stringify(assumption)
      };
    } else {
      return {
        assumption_text: String(assumption)
      };
    }
  });

  const assumptionsColumns = [
    {
      key: 'assumption_text',
      header: 'Assumption',
      accessor: (item) => item.assumption_text,
      className: 'primary-column'
    }
  ];

  return (
    <GenericBRDTable
      data={tableData}
      columns={assumptionsColumns}
      title="Assumptions"
      icon="info"
      showCreatedAt={false}
    />
  );
};

const createModulesContent = (modules) => {
  if (!modules || modules.length === 0) {
    return (
      <div className="doc-details-content-section">
        <p className="doc-details-content-text">No modules defined.</p>
      </div>
    );
  }

  const modulesColumns = [
    {
      key: 'module_name',
      header: 'Module Name',
      accessor: (item) => item.module_name,
      className: 'primary-column'
    },
    {
      key: 'description',
      header: 'Description',
      accessor: (item) => item.description,
      className: 'description-column'
    },
    {
      key: 'processes',
      header: 'Processes',
      accessor: (item) => item.processes,
      className: 'processes-column'
    }
  ];

  return (
    <GenericBRDTable
      data={modules}
      columns={modulesColumns}
      title="Modules & Processes"
      icon="widgets"
      showCreatedAt={false}
    />
  );
};

const createLicensesContent = (licenses) => {
  if (!licenses || licenses.length === 0) {
    return (
      <div className="doc-details-content-section">
        <p className="doc-details-content-text">No licenses defined.</p>
      </div>
    );
  }

  // Normalize license data for table display
  const tableData = licenses.map((license, index) => {
    if (typeof license === 'string') {
      return {
        license_type: license,
        count: 1,
        description: '-'
      };
    } else if (typeof license === 'object' && license !== null) {
      return {
        license_type: license.license_type || 'License',
        count: license.count || 1,
        description: license.description || '-'
      };
    } else {
      return {
        license_type: String(license),
        count: 1,
        description: '-'
      };
    }
  });

  const licensesColumns = [
    {
      key: 'license_type',
      header: 'License Type',
      accessor: (item) => item.license_type,
      className: 'primary-column'
    },
    {
      key: 'count',
      header: 'Count',
      accessor: (item) => item.count,
      className: 'count-column'
    },
    {
      key: 'description',
      header: 'Description',
      accessor: (item) => item.description,
      className: 'description-column'
    }
  ];

  return (
    <GenericBRDTable
      data={tableData}
      columns={licensesColumns}
      title="Licenses"
      icon="verified_user"
      showCreatedAt={false}
    />
  );
};

const createBusinessUnitsContent = (businessUnits) => {
  if (!businessUnits || businessUnits.length === 0) {
    return (
      <div className="doc-details-content-section">
        <p className="doc-details-content-text">No business units defined.</p>
      </div>
    );
  }

  // Flatten business units with their stakeholders for table display
  const tableData = [];
  businessUnits.forEach((unit) => {
    if (unit.stakeholders && unit.stakeholders.length > 0) {
      unit.stakeholders.forEach((stakeholder) => {
        tableData.push({
          business_unit: unit.business_unit_name,
          stakeholder_name: stakeholder.name,
          designation: stakeholder.designation,
          email: stakeholder.email || '-'
        });
      });
    } else {
      tableData.push({
        business_unit: unit.business_unit_name,
        stakeholder_name: '-',
        designation: '-',
        email: '-'
      });
    }
  });

  const businessUnitsColumns = [
    {
      key: 'business_unit',
      header: 'Business Unit',
      accessor: (item) => item.business_unit,
      className: 'primary-column'
    },
    {
      key: 'stakeholder_name',
      header: 'Stakeholder Name',
      accessor: (item) => item.stakeholder_name,
      className: 'stakeholder-column'
    },
    {
      key: 'designation',
      header: 'Designation',
      accessor: (item) => item.designation,
      className: 'designation-column'
    },
    {
      key: 'email',
      header: 'Email',
      accessor: (item) => item.email,
      className: 'email-column'
    }
  ];

  return (
    <GenericBRDTable
      data={tableData}
      columns={businessUnitsColumns}
      title="Business Units & Stakeholders"
      icon="groups"
      showCreatedAt={false}
    />
  );
};

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
      content: createPrimaryObjectiveContent(sowData.scope_summary)
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
  title: 'Licenses',
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
    // createValidationSection(sowData)
  ];
};

