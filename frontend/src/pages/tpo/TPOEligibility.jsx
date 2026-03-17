import React, { useState } from 'react';
import Card from '../../components/common/Card';
import './TPOEligibility.css';

const TPOEligibility = () => {
  const branchOptions = ['CSE', 'ECE', 'ME', 'CIVIL'];
  const [rules, setRules] = useState({
    minCGPA: 6.0,
    allowedBranches: ['CSE', 'ECE', 'ME'],
    MaxOffersPerStudent: 2,
  });

  const [formData, setFormData] = useState(rules);
  const [statusMessage, setStatusMessage] = useState('');

  const [companyRuleDraft, setCompanyRuleDraft] = useState({
    companyName: '',
    minCGPA: 6.0,
    maxOffersPerStudent: 1,
    allowedBranches: ['CSE'],
    effectiveFrom: '',
    policyNotes: '',
  });

  const [companyRules, setCompanyRules] = useState([
    {
      id: 1,
      companyName: 'Google',
      minCGPA: 7.5,
      maxOffersPerStudent: 1,
      allowedBranches: ['CSE', 'ECE'],
      effectiveFrom: '2026-03-01',
      policyNotes: 'No active backlogs allowed. Must clear OA before interview rounds.',
    },
    {
      id: 2,
      companyName: 'TCS',
      minCGPA: 6.0,
      maxOffersPerStudent: 2,
      allowedBranches: ['CSE', 'ECE', 'ME', 'CIVIL'],
      effectiveFrom: '2026-02-15',
      policyNotes: 'Service agreement may apply as per offer. Department verification mandatory.',
    },
  ]);

  const policyCount = companyRules.length;
  const strictestCgpa = Math.max(
    rules.minCGPA,
    ...companyRules.map((rule) => Number(rule.minCGPA) || 0)
  );
  const coveredBranches = new Set([
    ...rules.allowedBranches,
    ...companyRules.flatMap((rule) => rule.allowedBranches),
  ]).size;

  const handleSave = () => {
    const safeMin = Number.isNaN(Number(formData.minCGPA)) ? 0 : Number(formData.minCGPA);
    const safeOffers = Number.isNaN(Number(formData.MaxOffersPerStudent))
      ? 1
      : Number(formData.MaxOffersPerStudent);

    setRules({
      ...formData,
      minCGPA: safeMin,
      MaxOffersPerStudent: safeOffers,
    });
    setStatusMessage('Global eligibility rules saved successfully.');
  };

  const handleDraftBranchToggle = (branch, isChecked) => {
    if (isChecked) {
      setCompanyRuleDraft((prev) => ({
        ...prev,
        allowedBranches: [...prev.allowedBranches, branch],
      }));
      return;
    }

    setCompanyRuleDraft((prev) => ({
      ...prev,
      allowedBranches: prev.allowedBranches.filter((item) => item !== branch),
    }));
  };

  const handleAddOrUpdateCompanyRule = () => {
    const normalizedCompany = companyRuleDraft.companyName.trim();

    if (!normalizedCompany) {
      setStatusMessage('Company name is required for company-wise policy.');
      return;
    }

    if (!companyRuleDraft.allowedBranches.length) {
      setStatusMessage('Select at least one branch for company policy.');
      return;
    }

    const normalizedMinCgpa = Number.isNaN(Number(companyRuleDraft.minCGPA))
      ? 0
      : Number(companyRuleDraft.minCGPA);
    const normalizedMaxOffers = Number.isNaN(Number(companyRuleDraft.maxOffersPerStudent))
      ? 1
      : Number(companyRuleDraft.maxOffersPerStudent);

    const normalizedDraft = {
      companyName: normalizedCompany,
      minCGPA: normalizedMinCgpa,
      maxOffersPerStudent: normalizedMaxOffers,
      allowedBranches: companyRuleDraft.allowedBranches,
      effectiveFrom: companyRuleDraft.effectiveFrom,
      policyNotes: companyRuleDraft.policyNotes.trim(),
    };

    const existingIndex = companyRules.findIndex(
      (rule) => rule.companyName.toLowerCase() === normalizedCompany.toLowerCase()
    );

    if (existingIndex >= 0) {
      const updated = [...companyRules];
      updated[existingIndex] = {
        ...updated[existingIndex],
        ...normalizedDraft,
      };
      setCompanyRules(updated);
      setStatusMessage(`Updated policy for ${normalizedCompany}.`);
    } else {
      setCompanyRules((prev) => [
        ...prev,
        {
          id: Date.now(),
          ...normalizedDraft,
        },
      ]);
      setStatusMessage(`Added policy for ${normalizedCompany}.`);
    }

    setCompanyRuleDraft({
      companyName: '',
      minCGPA: 6.0,
      maxOffersPerStudent: 1,
      allowedBranches: ['CSE'],
      effectiveFrom: '',
      policyNotes: '',
    });
  };

  const handleRemoveCompanyRule = (ruleId) => {
    setCompanyRules((prev) => prev.filter((rule) => rule.id !== ruleId));
    setStatusMessage('Company policy removed.');
  };

  return (
    <div className="tpo-eligibility">
      <div className="header">
        <h1>Eligibility Rules</h1>
        <p>Configure global and company-wise eligibility criteria shared by recruiters.</p>
      </div>

      {statusMessage && <div className="status-message">{statusMessage}</div>}

      <div className="eligibility-kpi-grid">
        <div className="eligibility-kpi eligibility-kpi--indigo">
          <span className="kpi-label">Global Min CGPA</span>
          <strong className="kpi-value">{rules.minCGPA}</strong>
          <span className="kpi-sub">Baseline for all companies</span>
        </div>
        <div className="eligibility-kpi eligibility-kpi--teal">
          <span className="kpi-label">Company Policies</span>
          <strong className="kpi-value">{policyCount}</strong>
          <span className="kpi-sub">Active recruiter-specific rules</span>
        </div>
        <div className="eligibility-kpi eligibility-kpi--amber">
          <span className="kpi-label">Strictest Min CGPA</span>
          <strong className="kpi-value">{strictestCgpa}</strong>
          <span className="kpi-sub">Highest among all policies</span>
        </div>
        <div className="eligibility-kpi eligibility-kpi--violet">
          <span className="kpi-label">Branches Covered</span>
          <strong className="kpi-value">{coveredBranches}</strong>
          <span className="kpi-sub">Unique allowed branches</span>
        </div>
      </div>

      <Card title="Global Eligibility Configuration" className="eligibility-section-card eligibility-section-card--global">
        <p className="section-note">
          These rules apply platform-wide unless a company-specific policy overrides them.
        </p>
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
              {branchOptions.map((branch) => (
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

      <Card title="Current Global Snapshot" className="mt-3 eligibility-section-card eligibility-section-card--snapshot">
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

      <Card title="Company-Wise Policy Rules" className="mt-3 eligibility-section-card eligibility-section-card--company">
        <p className="section-note">
          Add rules as shared by each company. Students will see and follow these company-specific policies.
        </p>

        <div className="company-form-grid">
          <div className="form-group">
            <label>Company Name</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Infosys"
              value={companyRuleDraft.companyName}
              onChange={(e) =>
                setCompanyRuleDraft({ ...companyRuleDraft, companyName: e.target.value })
              }
            />
          </div>

          <div className="form-group">
            <label>Minimum CGPA</label>
            <input
              type="number"
              step="0.1"
              min="0"
              max="10"
              className="form-input"
              value={companyRuleDraft.minCGPA}
              onChange={(e) =>
                setCompanyRuleDraft({ ...companyRuleDraft, minCGPA: parseFloat(e.target.value) })
              }
            />
          </div>

          <div className="form-group">
            <label>Max Offers per Student</label>
            <input
              type="number"
              min="1"
              className="form-input"
              value={companyRuleDraft.maxOffersPerStudent}
              onChange={(e) =>
                setCompanyRuleDraft({
                  ...companyRuleDraft,
                  maxOffersPerStudent: parseInt(e.target.value, 10),
                })
              }
            />
          </div>

          <div className="form-group">
            <label>Effective From</label>
            <input
              type="date"
              className="form-input"
              value={companyRuleDraft.effectiveFrom}
              onChange={(e) =>
                setCompanyRuleDraft({ ...companyRuleDraft, effectiveFrom: e.target.value })
              }
            />
          </div>

          <div className="form-group company-branches-field">
            <label>Allowed Branches</label>
            <div className="checkbox-group">
              {branchOptions.map((branch) => (
                <label key={branch} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={companyRuleDraft.allowedBranches.includes(branch)}
                    onChange={(e) => handleDraftBranchToggle(branch, e.target.checked)}
                  />
                  {branch}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group company-notes-field">
            <label>Policy Notes (from company)</label>
            <textarea
              className="form-input"
              rows="3"
              placeholder="e.g. No active backlog, mandatory assessment score, service agreement notes"
              value={companyRuleDraft.policyNotes}
              onChange={(e) =>
                setCompanyRuleDraft({ ...companyRuleDraft, policyNotes: e.target.value })
              }
            />
          </div>
        </div>

        <button className="btn btn-primary mt-2" onClick={handleAddOrUpdateCompanyRule}>
          Add / Update Company Policy
        </button>
      </Card>

      <Card title="Configured Company Policies" className="mt-3 eligibility-section-card eligibility-section-card--list">
        <div className="company-rules-list">
          {companyRules.map((rule) => (
            <div key={rule.id} className="company-rule-item">
              <div className="company-rule-head">
                <div className="company-rule-title-wrap">
                  <h4>{rule.companyName}</h4>
                  <span className="rule-chip">Company Policy</span>
                </div>
                <button
                  className="btn btn-danger btn-small"
                  onClick={() => handleRemoveCompanyRule(rule.id)}
                >
                  Remove
                </button>
              </div>

              <div className="company-rule-meta">
                <span>
                  <strong>Min CGPA:</strong> {rule.minCGPA}
                </span>
                <span>
                  <strong>Max Offers/Student:</strong> {rule.maxOffersPerStudent}
                </span>
                <span>
                  <strong>Effective:</strong> {rule.effectiveFrom || 'Not specified'}
                </span>
              </div>

              <div className="company-rule-branches">
                <strong>Allowed Branches:</strong> {rule.allowedBranches.join(', ')}
              </div>

              {rule.policyNotes && <p className="company-rule-notes">{rule.policyNotes}</p>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default TPOEligibility;
