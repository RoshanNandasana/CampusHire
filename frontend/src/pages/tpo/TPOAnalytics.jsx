import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { tpoAPI } from '../../services/api';
import './TPOAnalytics.css';

const COMPANY_HIRING_DATA = [];

const BRANCH_STUDENT_COUNT = 120;

const TPOAnalytics = () => {
  const { user } = useAuth();

  const assignedBranch = useMemo(() => {
    if (!user?.email) return 'CSE';
    const email = user.email.toLowerCase();
    if (email.includes('ece')) return 'ECE';
    if (email.includes('me')) return 'ME';
    if (email.includes('civil')) return 'Civil';
    if (email.includes('it')) return 'IT';
    return 'CSE';
  }, [user]);

  const [filters, setFilters] = useState({
    searchCompany: '',
    minOffers: 0,
    minHired: 0,
    sortBy: 'hired',
  });

  const [analyticsData, setAnalyticsData] = useState(COMPANY_HIRING_DATA);
  const [branchStudentCount, setBranchStudentCount] = useState(BRANCH_STUDENT_COUNT);

  useEffect(() => {
    let isMounted = true;

    const loadAnalytics = async () => {
      try {
        const response = await tpoAPI.getAnalytics();
        const data = response?.data || {};
        if (!isMounted) return;

        const companyBreakdown = Array.isArray(data.company_breakdown)
          ? data.company_breakdown
          : [];
        setAnalyticsData(
          companyBreakdown.map((item) => ({
            company: item.company_name || 'Company',
            offers: Number(item.offers_made || 0),
            hired: Number(item.offers_accepted || 0),
            avgCtc: 0,
            driveDate: new Date().toISOString().slice(0, 10),
          }))
        );

        setBranchStudentCount(Number(data.placement_stats?.total_students || BRANCH_STUDENT_COUNT));
      } catch (error) {
        if (!isMounted) return;
      }
    };

    loadAnalytics();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredRows = useMemo(() => {
    const base = analyticsData.filter((item) => {
      const search = filters.searchCompany.toLowerCase();
      const matchSearch = !search || item.company.toLowerCase().includes(search);
      const matchOffers = item.offers >= Number(filters.minOffers);
      const matchHired = item.hired >= Number(filters.minHired);
      return matchSearch && matchOffers && matchHired;
    });

    return base.sort((a, b) => {
      if (filters.sortBy === 'offers') return b.offers - a.offers;
      if (filters.sortBy === 'conversion') return b.hired / b.offers - a.hired / a.offers;
      if (filters.sortBy === 'ctc') return b.avgCtc - a.avgCtc;
      return b.hired - a.hired;
    });
  }, [analyticsData, filters]);

  const summary = useMemo(() => {
    const totalOffers = filteredRows.reduce((sum, row) => sum + row.offers, 0);
    const totalHired = filteredRows.reduce((sum, row) => sum + row.hired, 0);
    const avgCtc = filteredRows.length
      ? (filteredRows.reduce((sum, row) => sum + row.avgCtc, 0) / filteredRows.length).toFixed(1)
      : '0.0';

    const conversionRate = totalOffers ? ((totalHired / totalOffers) * 100).toFixed(1) : '0.0';
    const placementRate = branchStudentCount ? ((totalHired / branchStudentCount) * 100).toFixed(1) : '0.0';

    return {
      totalOffers,
      totalHired,
      avgCtc,
      conversionRate,
      placementRate,
      companies: filteredRows.length,
    };
  }, [branchStudentCount, filteredRows]);

  return (
    <div className="tpo-analytics-simple">
      <section className="analytics-header-simple">
        <div>
          <p className="analytics-kicker">Branch Analytics</p>
          <h1>Simple Hiring Analytics</h1>
          <p>
            Branch: <strong>{assignedBranch}</strong> | Focus on total offers, company-wise hired count, and quick placement summary.
          </p>
        </div>
      </section>

      <div className="analytics-summary-grid">
        <Card className="summary-card green">
          <span>Total Offers</span>
          <strong>{summary.totalOffers}</strong>
        </Card>

        <Card className="summary-card blue">
          <span>Total Hired</span>
          <strong>{summary.totalHired}</strong>
        </Card>

        <Card className="summary-card amber">
          <span>Offer to Hire</span>
          <strong>{summary.conversionRate}%</strong>
        </Card>

        <Card className="summary-card violet">
          <span>Placement Rate</span>
          <strong>{summary.placementRate}%</strong>
        </Card>

        <Card className="summary-card sky">
          <span>Companies</span>
          <strong>{summary.companies}</strong>
        </Card>

        <Card className="summary-card orange">
          <span>Average CTC</span>
          <strong>{summary.avgCtc} LPA</strong>
        </Card>
      </div>

      <Card title="Filters" className="analytics-filter-card">
        <div className="analytics-filter-grid">
          <div className="filter-group">
            <label>Search Company</label>
            <input
              className="form-input"
              value={filters.searchCompany}
              onChange={(event) => setFilters({ ...filters, searchCompany: event.target.value })}
              placeholder="Google, Infosys..."
            />
          </div>

          <div className="filter-group">
            <label>Minimum Offers</label>
            <input
              type="number"
              className="form-input"
              min="0"
              value={filters.minOffers}
              onChange={(event) => setFilters({ ...filters, minOffers: Number(event.target.value) || 0 })}
            />
          </div>

          <div className="filter-group">
            <label>Minimum Hired</label>
            <input
              type="number"
              className="form-input"
              min="0"
              value={filters.minHired}
              onChange={(event) => setFilters({ ...filters, minHired: Number(event.target.value) || 0 })}
            />
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select
              className="form-input"
              value={filters.sortBy}
              onChange={(event) => setFilters({ ...filters, sortBy: event.target.value })}
            >
              <option value="hired">Most Hired</option>
              <option value="offers">Most Offers</option>
              <option value="conversion">Best Conversion</option>
              <option value="ctc">Highest CTC</option>
            </select>
          </div>
        </div>
      </Card>

      <Card title="Company Wise Hiring" className="analytics-table-card">
        <div className="table-wrap">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Offers</th>
                <th>Hired</th>
                <th>Conversion</th>
                <th>Average CTC</th>
                <th>Drive Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="no-results">No records match these filters.</td>
                </tr>
              ) : (
                filteredRows.map((row) => {
                  const conversion = row.offers ? ((row.hired / row.offers) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={row.company}>
                      <td>
                        <strong>{row.company}</strong>
                      </td>
                      <td>{row.offers}</td>
                      <td>{row.hired}</td>
                      <td>
                        <span className={`conversion-pill ${Number(conversion) >= 70 ? 'good' : 'avg'}`}>
                          {conversion}%
                        </span>
                      </td>
                      <td>{row.avgCtc} LPA</td>
                      <td>{new Date(row.driveDate).toLocaleDateString()}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default TPOAnalytics;
