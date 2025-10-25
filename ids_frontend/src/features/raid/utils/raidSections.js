import GenericBRDTable from '../../brd/components/GenericBRDTable';
import { renderSourceReferences } from '../../../utils/sourceReferenceUtils';
import '../../../utils/sourceReferenceUtils.css';

export const generateRAIDSections = (raidData, riskIssueStatuses = {}, handleRiskIssueAction = () => {}, onSourceClick = () => {}) => {
  if (!raidData) return [];

  const sections = [];

  // Risks & Issues Section
  if (raidData.risks_issues && raidData.risks_issues.length > 0) {
    const risksColumns = [
      {
        key: 'type',
        header: 'Type',
        accessor: (item) => item.type,
        className: 'primary-column'
      },
      {
        key: 'description_md',
        header: 'Description',
        accessor: (item) => item.description_md,
        className: 'description-column'
      },
      {
        key: 'impact_md',
        header: 'Impact',
        accessor: (item) => item.impact_md,
        className: 'impact-column'
      },
      {
        key: 'mitigation_md',
        header: 'Mitigation',
        accessor: (item) => item.mitigation_md,
        className: 'mitigation-column'
      },
      {
        key: 'owner_md',
        header: 'Owner',
        accessor: (item) => item.owner_md,
        className: 'owner-column'
      },
      {
        key: 'due_date',
        header: 'Due Date',
        accessor: (item) => item.due_date,
        className: 'date-column'
      }
    ];

    sections.push({
      id: 'risks-issues',
      title: 'Risks & Issues',
      icon: 'warning',
      content: (
        <GenericBRDTable
          data={raidData.risks_issues}
          columns={risksColumns}
          title="Risks & Issues"
          icon="warning"
          showTitle={false}
          onSourceClick={onSourceClick}
        />
      )
    });
  }

  // Action Items Section
  if (raidData.action_items && raidData.action_items.length > 0) {
    const actionItemsColumns = [
      {
        key: 'item_status',
        header: 'Status',
        accessor: (item) => item.item_status,
        className: 'status-column'
      },
      {
        key: 'task_md',
        header: 'Task',
        accessor: (item) => item.task_md,
        className: 'primary-column'
      },
      {
        key: 'owner_md',
        header: 'Owner',
        accessor: (item) => item.owner_md,
        className: 'owner-column'
      },
      {
        key: 'due_date',
        header: 'Due Date',
        accessor: (item) => item.due_date,
        className: 'date-column'
      }
    ];

    sections.push({
      id: 'action-items',
      title: 'Action Items',
      icon: 'task_alt',
      content: (
        <GenericBRDTable
          data={raidData.action_items}
          columns={actionItemsColumns}
          title="Action Items"
          icon="task_alt"
          showTitle={false}
          onSourceClick={onSourceClick}
        />
      )
    });
  }

  // Decisions Section
  if (raidData.decisions && raidData.decisions.length > 0) {
    const decisionsColumns = [
      {
        key: 'decision_md',
        header: 'Decision',
        accessor: (item) => item.decision_md,
        className: 'primary-column'
      },
      {
        key: 'rationale_md',
        header: 'Rationale',
        accessor: (item) => item.rationale_md,
        className: 'rationale-column'
      },
      {
        key: 'approver_md',
        header: 'Approver',
        accessor: (item) => item.approver_md,
        className: 'approver-column'
      },
      {
        key: 'decided_on',
        header: 'Decided On',
        accessor: (item) => item.decided_on,
        className: 'date-column'
      }
    ];

    sections.push({
      id: 'decisions',
      title: 'Decisions',
      icon: 'gavel',
      content: (
        <GenericBRDTable
          data={raidData.decisions}
          columns={decisionsColumns}
          title="Decisions"
          icon="gavel"
          showTitle={false}
          onSourceClick={onSourceClick}
        />
      )
    });
  }

  // Dependencies Section
  if (raidData.dependencies && raidData.dependencies.length > 0) {
    const dependenciesColumns = [
      {
        key: 'type',
        header: 'Type',
        accessor: (item) => item.type,
        className: 'primary-column'
      },
      {
        key: 'description_md',
        header: 'Description',
        accessor: (item) => item.description_md,
        className: 'description-column'
      },
      {
        key: 'depends_on_md',
        header: 'Depends On',
        accessor: (item) => item.depends_on_md,
        className: 'depends-on-column'
      },
      {
        key: 'owner_md',
        header: 'Owner',
        accessor: (item) => item.owner_md,
        className: 'owner-column'
      }
    ];

    sections.push({
      id: 'dependencies',
      title: 'Dependencies',
      icon: 'link',
      content: (
        <GenericBRDTable
          data={raidData.dependencies}
          columns={dependenciesColumns}
          title="Dependencies"
          icon="link"
          showTitle={false}
          onSourceClick={onSourceClick}
        />
      )
    });
  }

  // Pain Points Section
  if (raidData.pain_points && raidData.pain_points.length > 0) {
    const painPointsColumns = [
      {
        key: 'pain_point_md',
        header: 'Pain Point',
        accessor: (item) => item.pain_point_md,
        className: 'primary-column'
      },
      {
        key: 'affected_bu_md',
        header: 'Affected BU',
        accessor: (item) => item.affected_bu_md,
        className: 'affected-bu-column'
      },
      {
        key: 'impact_md',
        header: 'Impact',
        accessor: (item) => item.impact_md,
        className: 'impact-column'
      }
    ];

    sections.push({
      id: 'pain-points',
      title: 'Pain Points',
      icon: 'error',
      content: (
        <GenericBRDTable
          data={raidData.pain_points}
          columns={painPointsColumns}
          title="Pain Points"
          icon="error"
          showTitle={false}
          onSourceClick={onSourceClick}
        />
      )
    });
  }

  return sections;
};
