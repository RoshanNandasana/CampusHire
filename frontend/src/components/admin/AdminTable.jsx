import React, { useState } from 'react';
import { MdEdit, MdDelete, MdMoreVert } from 'react-icons/md';
import './AdminTable.css';

const AdminTable = ({ 
  columns, 
  data, 
  onEdit, 
  onDelete, 
  loading = false, 
  emptyMessage = 'No data available' 
}) => {
  const [expandedRow, setExpandedRow] = useState(null);

  const renderCell = (item, column) => {
    if (column.render) {
      return column.render(item[column.key], item);
    }
    const value = item[column.key];
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value).substring(0, 50);
  };

  if (loading) {
    return <div className="admin-table-loading">Loading...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="admin-table-empty">{emptyMessage}</div>;
  }

  return (
    <div className="admin-table-wrapper">
      <table className="admin-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ width: col.width || 'auto' }}>
                {col.label}
              </th>
            ))}
            <th style={{ width: '100px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.id || index} className={expandedRow === index ? 'expanded' : ''}>
              {columns.map((col) => (
                <td key={col.key}>
                  <span className="cell-content">{renderCell(item, col)}</span>
                </td>
              ))}
              <td>
                <div className="action-buttons">
                  {onEdit && (
                    <button 
                      className="btn-icon btn-edit" 
                      onClick={() => onEdit(item)}
                      title="Edit"
                    >
                      <MdEdit />
                    </button>
                  )}
                  {onDelete && (
                    <button 
                      className="btn-icon btn-delete" 
                      onClick={() => onDelete(item)}
                      title="Delete"
                    >
                      <MdDelete />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTable;
