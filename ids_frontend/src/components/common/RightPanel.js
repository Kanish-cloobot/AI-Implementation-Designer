import React from 'react';
import Spinner from './Spinner';
import Button from './Button';
import './RightPanel.css';

const RightPanel = ({ 
  isOpen, 
  onClose, 
  title, 
  data, 
  loading, 
  error, 
  columns, 
  icon,
  emptyMessage = "No data available"
}) => {
  if (!isOpen) return null;

  console.log('RightPanel received data:', data);
  console.log('RightPanel columns:', columns);

  const renderTableRow = (item, index) => {
    console.log(`Rendering row ${index}:`, item);
    return (
      <div key={index} className="right-panel-row">
        {columns.map((column, colIndex) => {
          const value = column.accessor ? column.accessor(item) : (item[column.key] || 'N/A');
          console.log(`Column ${colIndex} (${column.key}):`, value);
          return (
            <div key={colIndex} className={`right-panel-cell ${column.className || ''}`}>
              {value}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="right-panel-overlay" onClick={onClose}>
      <div className="right-panel" onClick={(e) => e.stopPropagation()}>
        <div className="right-panel-header">
          <div className="right-panel-title">
            <span className="material-symbols-outlined right-panel-icon">{icon}</span>
            <h3>{title}</h3>
          </div>
          <Button 
            onClick={onClose} 
            variant="secondary" 
            className="right-panel-close"
          >
            <span className="material-symbols-outlined">close</span>
          </Button>
        </div>
        
        <div className="right-panel-content">
          {loading ? (
            <div className="right-panel-loading">
              <Spinner />
              <p>Loading {title.toLowerCase()}...</p>
            </div>
          ) : error ? (
            <div className="right-panel-error">
              <p>{error}</p>
            </div>
          ) : !data || data.length === 0 ? (
            <div className="right-panel-empty">
              <span className="material-symbols-outlined empty-icon">{icon}</span>
              <p>{emptyMessage}</p>
            </div>
          ) : (
            <div className="right-panel-table">
              <div className="right-panel-header-row">
                {columns.map((column, index) => (
                  <div key={index} className={`right-panel-header-cell ${column.className || ''}`}>
                    {column.header}
                  </div>
                ))}
              </div>
              <div className="right-panel-body">
                {data.map(renderTableRow)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RightPanel;
