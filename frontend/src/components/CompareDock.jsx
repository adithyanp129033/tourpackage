import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

const CompareDock = ({ comparedPackages, onRemove, onClear, onBook }) => {
  const [showModal, setShowModal] = useState(false);

  if (!comparedPackages || comparedPackages.length === 0) return null;

  return (
    <>
      <div 
        className="fixed-bottom p-3 glass-panel d-flex justify-content-between align-items-center"
        style={{ 
          zIndex: 1050, 
          margin: '20px', 
          borderRadius: '16px',
          border: '1px solid var(--crimson-dim)',
          boxShadow: '0 0 25px rgba(255, 46, 46, 0.2)'
        }}
      >
        <div className="d-flex align-items-center gap-3 overflow-x-auto py-1">
          <div className="text-start">
            <h6 className="mb-0 text-white font-monospace text-uppercase" style={{ fontSize: '0.8rem' }}>Compare Packages</h6>
            <small className="text-muted">{comparedPackages.length} selected (max 3)</small>
          </div>
          <div className="d-flex gap-2">
            {comparedPackages.map(pkg => (
              <div 
                key={pkg.id} 
                className="d-flex align-items-center gap-2 bg-dark p-2 rounded border border-secondary"
                style={{ minWidth: '150px', maxWidth: '200px' }}
              >
                <span className="text-truncate text-white" style={{ fontSize: '0.8rem', fontWeight: '600' }}>
                  {pkg.title}
                </span>
                <button 
                  className="btn btn-link text-danger p-0 ms-auto d-flex align-items-center" 
                  onClick={() => onRemove(pkg.id)}
                >
                  <i className="bi bi-x-circle-fill"></i>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-outline-secondary btn-sm" onClick={onClear}>
            Clear
          </button>
          <button 
            className="btn btn-primary btn-sm" 
            disabled={comparedPackages.length < 2}
            onClick={() => setShowModal(true)}
          >
            Compare Now
          </button>
        </div>
      </div>

      {/* Comparison Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton closeVariant="white">
          <Modal.Title>Package Comparison</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className="table-responsive">
            <table className="table table-bordered mb-0 align-middle text-center" style={{ minWidth: '600px' }}>
              <thead>
                <tr className="bg-dark text-white">
                  <th style={{ width: '25%', textAlign: 'left', paddingLeft: '20px' }}>Feature</th>
                  {comparedPackages.map(pkg => (
                    <th key={pkg.id} style={{ width: `${75 / comparedPackages.length}%` }}>
                      {pkg.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-start fw-bold text-muted ps-4">Destination</td>
                  {comparedPackages.map(pkg => (
                    <td key={pkg.id} className="text-white fw-semibold">
                      <i className="bi bi-geo-alt-fill text-crimson me-1"></i>
                      {pkg.destination}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="text-start fw-bold text-muted ps-4">Price</td>
                  {comparedPackages.map(pkg => (
                    <td key={pkg.id} className="text-crimson fw-bold" style={{ fontSize: '1.2rem' }}>
                      ${parseFloat(pkg.price).toFixed(2)}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="text-start fw-bold text-muted ps-4">Duration</td>
                  {comparedPackages.map(pkg => (
                    <td key={pkg.id} className="text-white">
                      {pkg.duration_days} Days / {pkg.duration_days - 1} Nights
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="text-start fw-bold text-muted ps-4">Accommodation</td>
                  {comparedPackages.map(pkg => (
                    <td key={pkg.id} className="text-white">
                      {pkg.accommodation || 'Not specified'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="text-start fw-bold text-muted ps-4">Transportation</td>
                  {comparedPackages.map(pkg => (
                    <td key={pkg.id} className="text-white">
                      {pkg.transportation || 'Not specified'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="text-start fw-bold text-muted ps-4">Activities</td>
                  {comparedPackages.map(pkg => (
                    <td key={pkg.id} className="text-white">
                      <div className="d-flex flex-wrap gap-1 justify-content-center">
                        {pkg.activities.split(',').map((act, i) => (
                          <span key={i} className="badge-activity">{act.trim()}</span>
                        ))}
                      </div>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="text-start fw-bold text-muted ps-4">Safety Measures</td>
                  {comparedPackages.map(pkg => (
                    <td key={pkg.id} className="text-muted" style={{ fontSize: '0.8rem' }}>
                      {pkg.safety_measures || 'Standard Guidelines'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="text-start fw-bold text-muted ps-4">Rating</td>
                  {comparedPackages.map(pkg => (
                    <td key={pkg.id} className="text-warning fw-bold">
                      <i className="bi bi-star-fill me-1"></i>
                      {pkg.rating}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td></td>
                  {comparedPackages.map(pkg => (
                    <td key={pkg.id}>
                      <button 
                        className="btn btn-primary btn-sm" 
                        onClick={() => {
                          setShowModal(false);
                          onBook(pkg);
                        }}
                      >
                        Book Now
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowModal(false)}>Close</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default CompareDock;
