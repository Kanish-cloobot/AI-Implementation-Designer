import React from 'react';
import './GenericBRDTable.css';

const GenericBRDTable = ({ 
  data, 
  columns, 
  title, 
  icon, 
  className = '',
  showCreatedAt = true,
  customRowRenderer = null 
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="brd-content-section">
        <h2 className="brd-section-title">
          <span className="material-symbols-outlined">{icon}</span>
          {title}
        </h2>
        <div className="brd-empty-section">
          <p>No {title.toLowerCase()} data available</p>
        </div>
      </div>
    );
  }

  const formatValue = (value, column) => {
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    
    if (Array.isArray(value)) {
      return (
        <ul className="brd-table-list">
          {value.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      );
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    
    return value;
  };

  const renderCell = (item, column, index) => {
    if (customRowRenderer) {
      return customRowRenderer(item, column, index);
    }
    
    const value = column.accessor ? column.accessor(item, index) : item[column.key];
    
    // Check if the value is a React element
    if (React.isValidElement(value)) {
      return value;
    }
    
    return formatValue(value, column);
  };

  return (
    <div className={`brd-content-section ${className}`}>
      <h2 className="brd-section-title">
        <span className="material-symbols-outlined">{icon}</span>
        {title}
      </h2>
      <div className="brd-table-container">
        <table className="brd-generic-table">
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th key={index} className={`brd-table-header ${column.className || ''}`}>
                  {column.header}
                </th>
              ))}
              {showCreatedAt && (
                <th className="brd-table-header brd-table-header-date">Created</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((item, rowIndex) => (
              <tr key={rowIndex} className="brd-table-row">
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className={`brd-table-cell ${column.cellClassName || ''}`}>
                    {renderCell(item, column, rowIndex)}
                  </td>
                ))}
                {showCreatedAt && (
                  <td className="brd-table-cell brd-table-cell-date">
                    {formatDateTime(item.created_at)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return 'Not set';
  const date = new Date(dateTimeStr);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default GenericBRDTable;
