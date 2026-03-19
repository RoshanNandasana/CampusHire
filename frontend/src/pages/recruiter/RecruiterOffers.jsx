import React, { useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import Modal from '../../components/common/Modal';
import {
  formatDate,
  formatDateTime,
  getRecruiterApplications,
  saveRecruiterApplications,
} from './recruiterData';
import './RecruiterOffers.css';

const RecruiterOffers = () => {
  const [applications, setApplications] = useState(() => getRecruiterApplications());
  const [search, setSearch] = useState('');
  const [offerStatus, setOfferStatus] = useState('all');
  const [selectedOffer, setSelectedOffer] = useState(null);

  const offers = useMemo(() => {
    return applications
      .filter((app) => app.status === 'offer')
      .map((app) => {
        const acceptance = app.offerAcceptance || 'pending';
        return {
          id: app.id,
          studentName: app.student.fullName,
          company: app.company,
          position: app.position,
          salary: app.offerSalary || 'As per CTC band',
          offerDate: app.offerDate || app.appliedAt,
          joiningDate: app.joiningDate || '',
          acceptance,
          studentEmail: app.student.email,
          studentPhone: app.student.phone,
        };
      })
      .filter((offer) => {
        const query = search.trim().toLowerCase();
        const matchesSearch =
          !query ||
          offer.studentName.toLowerCase().includes(query) ||
          offer.company.toLowerCase().includes(query) ||
          offer.position.toLowerCase().includes(query);
        const matchesStatus = offerStatus === 'all' || offer.acceptance === offerStatus;
        return matchesSearch && matchesStatus;
      });
  }, [applications, offerStatus, search]);

  const updateAcceptance = (offerId, nextStatus) => {
    setApplications((prev) => {
      const updated = prev.map((app) =>
        app.id === offerId
          ? {
              ...app,
              offerAcceptance: nextStatus,
            }
          : app
      );
      saveRecruiterApplications(updated);
      return updated;
    });
  };

  return (
    <div className="recruiter-offers">
      <div className="header">
        <h1>Offer Management</h1>
        <p>Manage released offers, acceptance status, and direct candidate contact.</p>
      </div>

      <Card title="Filters" className="filter-card">
        <div className="filter-grid">
          <div className="form-group">
            <label>Search</label>
            <input
              type="text"
              className="form-input"
              placeholder="Student, company, role"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Offer Status</label>
            <select
              className="form-input"
              value={offerStatus}
              onChange={(event) => setOfferStatus(event.target.value)}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="declined">Declined</option>
            </select>
          </div>
        </div>
      </Card>

      <Card title="Offers">
        <table className="table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Company</th>
              <th>Position</th>
              <th>Salary</th>
              <th>Offer Date</th>
              <th>Joining Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => (
              <tr key={offer.id}>
                <td>{offer.studentName}</td>
                <td>{offer.company}</td>
                <td>{offer.position}</td>
                <td>{offer.salary}</td>
                <td>{formatDate(offer.offerDate)}</td>
                <td>{offer.joiningDate ? formatDate(offer.joiningDate) : 'TBD'}</td>
                <td>
                  <span className={`badge badge-${offer.acceptance}`}>
                    {offer.acceptance}
                  </span>
                </td>
                <td>
                  <div className="row-actions">
                    <button className="btn btn-small btn-outlined" onClick={() => setSelectedOffer(offer)}>
                      View
                    </button>
                    <select
                      className="status-select"
                      value={offer.acceptance}
                      onChange={(event) => updateAcceptance(offer.id, event.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="accepted">Accepted</option>
                      <option value="declined">Declined</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
            {!offers.length && (
              <tr>
                <td colSpan="8" className="empty-row">No offers available for selected filters.</td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <Modal
        isOpen={!!selectedOffer}
        onClose={() => setSelectedOffer(null)}
        closeText="Close"
        title={selectedOffer ? `Offer Detail - ${selectedOffer.studentName}` : ''}
      >
        {selectedOffer && (
          <div className="offer-detail">
            <div className="detail-grid">
              <div><strong>Student:</strong> {selectedOffer.studentName}</div>
              <div><strong>Company:</strong> {selectedOffer.company}</div>
              <div><strong>Position:</strong> {selectedOffer.position}</div>
              <div><strong>Salary:</strong> {selectedOffer.salary}</div>
              <div><strong>Offer Date:</strong> {formatDate(selectedOffer.offerDate)}</div>
              <div><strong>Joining Date:</strong> {selectedOffer.joiningDate ? formatDate(selectedOffer.joiningDate) : 'TBD'}</div>
              <div><strong>Acceptance Status:</strong> {selectedOffer.acceptance}</div>
              <div><strong>Last Updated:</strong> {formatDateTime(new Date().toISOString())}</div>
            </div>
            <div className="detail-actions">
              <a className="btn" href={`mailto:${selectedOffer.studentEmail}`}>
                Contact on Email
              </a>
              <a className="btn btn-outlined" href={`tel:${selectedOffer.studentPhone}`}>
                Call Student
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RecruiterOffers;
