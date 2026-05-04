import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import { useAuth } from '../../context/AuthContext';
import { tpoAPI } from '../../services/api';
import { extractArray, getApiErrorMessage, unwrapApiData } from './tpoUtils';
import './TPOAnalytics.css';

const TPOAnalytics = () => {
  const { user } = useAuth();

  const [filters, setFilters] = useState({
    searchCompany: '',
    minOffers: 0,
    minHired: 0,
    sortBy: 'hired',
  });

  const [analyticsData, setAnalyticsData] = useState([]);
  const [branchStudentCount, setBranchStudentCount] = useState(0);
  const [averageCtcLpa, setAverageCtcLpa] = useState(0);
  const [assignedBranch, setAssignedBranch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const toLpa = (value) => {
    const numeric = Number(value || 0);
    if (!numeric) return 0;
    return numeric > 1000 ? numeric / 100000 : numeric;
  };

  useEffect(() => {
    let isMounted = true;

    const loadAnalytics = async () => {
      try {
        setIsLoading(true);
        setError('');
        const [analyticsResponse, jobsResponse] = await Promise.all([
          tpoAPI.getAnalytics(),
          tpoAPI.getJobs(),
        ]);

        const data = unwrapApiData(analyticsResponse);
        const jobs = extractArray(jobsResponse, ['jobs']);
        if (!isMounted) return;

        const jobStatsByCompany = jobs.reduce((acc, job) => {
          const companyId = String(job?.company?.id || '');
          if (!companyId) return acc;

          const current = acc[companyId] || {
            salaryTotal: 0,
            salaryCount: 0,
            latestDriveDate: null,
          };

          const salary = Number(job?.salary || 0);
          if (salary > 0) {
            current.salaryTotal += salary;
            current.salaryCount += 1;
          }

          const driveDate = job?.application_deadline || null;
          if (driveDate && (!current.latestDriveDate || new Date(driveDate) > new Date(current.latestDriveDate))) {
            current.latestDriveDate = driveDate;
          }

          acc[companyId] = current;
          return acc;
        }, {});

        const companyBreakdown = Array.isArray(data.company_breakdown)
          ? data.company_breakdown
          : [];
        setAnalyticsData(
          companyBreakdown.map((item) => ({
            companyId: String(item.company_id || ''),
            company: item.company_name || 'Company',
            offers: Number(item.offers_made || 0),
            hired: Number(item.offers_accepted || 0),
            avgCtc:
              jobStatsByCompany[String(item.company_id || '')]?.salaryCount > 0
                ? jobStatsByCompany[String(item.company_id || '')].salaryTotal /
                  jobStatsByCompany[String(item.company_id || '')].salaryCount
                : null,
            driveDate: jobStatsByCompany[String(item.company_id || '')]?.latestDriveDate || null,
          }))
        );

        setAssignedBranch(data.department_name || user?.department || 'N/A');
        setBranchStudentCount(Number(data.placement_stats?.total_students || 0));
        setAverageCtcLpa(toLpa(data.placement_stats?.avg_ctc));
      } catch (error) {
        if (!isMounted) return;
        setError(getApiErrorMessage(error, 'Unable to load analytics data.'));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadAnalytics();
    return () => {
      isMounted = false;
    };
  }, [user?.department]);

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
      if (filters.sortBy === 'conversion') {
        const conversionA = a.offers ? a.hired / a.offers : 0;
        const conversionB = b.offers ? b.hired / b.offers : 0;
        return conversionB - conversionA;
      }
      if (filters.sortBy === 'ctc') return (b.avgCtc || 0) - (a.avgCtc || 0);
      return b.hired - a.hired;
    });
  }, [analyticsData, filters]);

  const summary = useMemo(() => {
    const totalOffers = filteredRows.reduce((sum, row) => sum + row.offers, 0);
    const totalHired = filteredRows.reduce((sum, row) => sum + row.hired, 0);
    const rowsWithCtc = filteredRows.filter((row) => Number(row.avgCtc) > 0);
    const avgCtcFromRows = rowsWithCtc.length
      ? (rowsWithCtc.reduce((sum, row) => sum + Number(row.avgCtc || 0), 0) / rowsWithCtc.length).toFixed(1)
      : null;

    const conversionRate = totalOffers ? ((totalHired / totalOffers) * 100).toFixed(1) : '0.0';
    const placementRate = branchStudentCount ? ((totalHired / branchStudentCount) * 100).toFixed(1) : '0.0';

    return {
      totalOffers,
      totalHired,
      avgCtc: avgCtcFromRows || averageCtcLpa.toFixed(1),
      conversionRate,
      placementRate,
      companies: filteredRows.length,
    };
  }, [averageCtcLpa, branchStudentCount, filteredRows]);

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

      {error && <div className="alert alert-error">{error}</div>}

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
                  const rowCtc = Number(row.avgCtc) > 0 ? toLpa(row.avgCtc).toFixed(1) : 'N/A';
                  const driveDate = row.driveDate ? new Date(row.driveDate).toLocaleDateString() : 'N/A';
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
                      <td>{rowCtc === 'N/A' ? rowCtc : `${rowCtc} LPA`}</td>
                      <td>{driveDate}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {isLoading && <p className="loading-state">Loading analytics...</p>}
      </Card>
    </div>
  );
};

export default TPOAnalytics;
