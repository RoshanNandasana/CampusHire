import React, { useState } from 'react';
import Card from '../../components/common/Card';
import './TPOEligibility.css';

const TPOEligibility = () => {
  const [rules, setRules] = useState({
    minCGPA: 6.0,
    allowedBranches: ['CSE', 'ECE', 'ME'],
    MaxOffersPerStudent: 2,
  });

  const [formData, setFormData] = useState(rules);

  const handleSave = () => {
    setRules(formData);
    alert('Eligibility rules updated successfully!');
  };

  return (
    <div className="tpo-eligibility">
      <div className="header">
        <h1>Eligibility Rules</h1>
        <p>Configure eligibility criteria for placements</p>
      </div>

      <Card title="Edit Eligibility Rules">
        <div className="form-grid">
          <div className="form-group">
            <label>Minimum CGPA Required</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              value={formData.minCGPA}
              onChange={(e) => setFormData({ ...formData, minCGPA: parseFloat(e.target.value) })}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Maximum Offers per Student</label>
            <input
              type="number"
              min="1"
              value={formData.MaxOffersPerStudent}
              onChange={(e) => setFormData({ ...formData, MaxOffersPerStudent: parseInt(e.target.value) })}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label>Allowed Branches</label>
            <div className="checkbox-group">
              {['CSE', 'ECE', 'ME', 'CIVIL'].map((branch) => (
                <label key={branch} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={formData.allowedBranches.includes(branch)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          allowedBranches: [...formData.allowedBranches, branch],
                        });
                      } else {
                        setFormData({
                          ...formData,
                          allowedBranches: formData.allowedBranches.filter((b) => b !== branch),
                        });
                      }
                    }}
                  />
                  {branch}
                </label>
              ))}
            </div>
          </div>
        </div>

        <button className="btn btn-primary mt-2" onClick={handleSave}>
          Save Rules
        </button>
      </Card>

      <Card title="Current Configuration" className="mt-3">
        <div className="config-display">
          <div className="config-item">
            <span className="config-label">Minimum CGPA</span>
            <span className="config-value">{rules.minCGPA}</span>
          </div>
          <div className="config-item">
            <span className="config-label">Max Offers/Student</span>
            <span className="config-value">{rules.MaxOffersPerStudent}</span>
          </div>
          <div className="config-item">
            <span className="config-label">Allowed Branches</span>
            <span className="config-value">{rules.allowedBranches.join(', ')}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TPOEligibility;
