import React from 'react';
import Card from '../../components/common/Card';
import './RecruiterOffers.css';

const RecruiterOffers = () => {
  const [offers] = React.useState([
    { id: 1, name: 'Neha Verma', position: 'PM', salary: '18 LPA', status: 'accepted' },
    { id: 2, name: 'Raj Kumar', position: 'SWE', salary: '20 LPA', status: 'pending' },
  ]);

  return (
    <div className="recruiter-offers">
      <div className="header"><h1>Offer Management 🎁</h1></div>
      <Card title="Offers">
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Position</th><th>Salary</th><th>Status</th></tr>
          </thead>
          <tbody>
            {offers.map((offer) => (
              <tr key={offer.id}>
                <td>{offer.name}</td><td>{offer.position}</td><td>{offer.salary}</td>
                <td><span className="badge">{offer.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default RecruiterOffers;
