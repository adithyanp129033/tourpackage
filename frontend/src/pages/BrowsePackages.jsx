import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import PackageCard from '../components/PackageCard';
import CompareDock from '../components/CompareDock';
import { Modal, Button, Form } from 'react-bootstrap';

const BrowsePackages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comparedPackages, setComparedPackages] = useState([]);
  
  // Search & Filter state
  const [filters, setFilters] = useState({
    search: '',
    destination: '',
    min_price: '',
    max_price: '',
    duration: '',
    activities: ''
  });

  // Booking Modal State
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [bookingData, setBookingData] = useState({
    travel_date: '',
    slots: 1
  });
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);

  // Fetch Packages
  const fetchPackages = async (currentFilters = filters) => {
    setLoading(true);
    try {
      // Build query string
      const params = {};
      Object.keys(currentFilters).forEach(key => {
        if (currentFilters[key]) {
          params[key] = currentFilters[key];
        }
      });

      const response = await api.get('packages/', { params });
      setPackages(response.data);
    } catch (error) {
      console.error("Error fetching packages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchPackages();
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      search: '',
      destination: '',
      min_price: '',
      max_price: '',
      duration: '',
      activities: ''
    };
    setFilters(defaultFilters);
    fetchPackages(defaultFilters);
  };

  // Comparison Handlers
  const handleCompare = (pkg) => {
    if (comparedPackages.find(p => p.id === pkg.id)) {
      setComparedPackages(comparedPackages.filter(p => p.id !== pkg.id));
    } else {
      if (comparedPackages.length >= 3) {
        alert("You can compare up to 3 packages at a time.");
        return;
      }
      setComparedPackages([...comparedPackages, pkg]);
    }
  };

  const handleRemoveCompare = (id) => {
    setComparedPackages(comparedPackages.filter(p => p.id !== id));
  };

  const handleClearCompare = () => {
    setComparedPackages([]);
  };

  // Booking Modal Handlers
  const handleOpenBooking = (pkg) => {
    setSelectedPkg(pkg);
    setBookingData({
      travel_date: '',
      slots: 1
    });
    setBookingError('');
    setBookingSuccess('');
  };

  const handleCloseBooking = () => {
    setSelectedPkg(null);
  };

  const handleBookingChange = (e) => {
    setBookingData({
      ...bookingData,
      [e.target.name]: e.target.value
    });
    setBookingError('');
  };

  const handleSlotsChange = (delta) => {
    const currentSlots = parseInt(bookingData.slots) || 1;
    const newSlots = Math.max(1, currentSlots + delta);
    setBookingData({
      ...bookingData,
      slots: newSlots
    });
  };

  const handleConfirmBooking = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'customer') {
      setBookingError("Only customers can book tour packages.");
      return;
    }
    if (!bookingData.travel_date) {
      setBookingError("Please pick a valid travel date.");
      return;
    }

    setBookingError('');
    setBookingSuccess('');
    setIsSubmittingBooking(true);

    try {
      await api.post('bookings/', {
        package: selectedPkg.id,
        slots: bookingData.slots,
        travel_date: bookingData.travel_date
      });
      setBookingSuccess("Your booking request has been submitted successfully! Check status in dashboard.");
      setTimeout(() => {
        handleCloseBooking();
        navigate('/dashboard');
      }, 2500);
    } catch (error) {
      console.error("Booking error:", error);
      setBookingError(error.response?.data?.error || "Failed to make booking. Please check details.");
    } finally {
      setIsSubmittingBooking(false);
    }
  };

  return (
    <div className="container py-5">
      {/* Hero Section */}
      <div className="py-5 text-center mb-5 position-relative">
        <h1 className="hero-title text-white">
          Escape The<br />
          <span className="text-crimson font-monospace">Ordinary</span>
        </h1>
        <p className="lead text-muted mx-auto mb-4" style={{ maxWidth: '600px', fontSize: '1.1rem' }}>
          Explore premium adventure camps, compare facilities, and book your wilderness escape with verified providers.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="card glass-panel p-4 mb-5 text-start">
        <form onSubmit={handleFilterSubmit}>
          <h5 className="text-white mb-3 text-uppercase font-monospace" style={{ fontSize: '0.9rem' }}>
            <i className="bi bi-filter-right me-2 text-crimson"></i>Filter Expeditions
          </h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Keyword Search</label>
              <input 
                type="text" 
                name="search" 
                className="form-control" 
                value={filters.search} 
                onChange={handleFilterChange} 
                placeholder="Title, description..."
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Destination</label>
              <input 
                type="text" 
                name="destination" 
                className="form-control" 
                value={filters.destination} 
                onChange={handleFilterChange} 
                placeholder="e.g. Arizona, Switzerland"
              />
            </div>
            <div className="col-md-4">
              <label className="form-label">Activities</label>
              <input 
                type="text" 
                name="activities" 
                className="form-control" 
                value={filters.activities} 
                onChange={handleFilterChange} 
                placeholder="e.g. Hiking, Surfing"
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Min Price ($)</label>
              <input 
                type="number" 
                name="min_price" 
                className="form-control" 
                value={filters.min_price} 
                onChange={handleFilterChange} 
                placeholder="0"
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Max Price ($)</label>
              <input 
                type="number" 
                name="max_price" 
                className="form-control" 
                value={filters.max_price} 
                onChange={handleFilterChange} 
                placeholder="1000"
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Duration (Days)</label>
              <input 
                type="number" 
                name="duration" 
                className="form-control" 
                value={filters.duration} 
                onChange={handleFilterChange} 
                placeholder="Days"
              />
            </div>
            <div className="col-md-3 d-flex align-items-end gap-2">
              <button type="submit" className="btn btn-primary w-100">
                Filter
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={handleResetFilters}>
                Reset
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Package Grid */}
      {loading ? (
        <div className="py-5 text-center">
          <div className="spinner-border text-danger" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : packages.length === 0 ? (
        <div className="py-5 text-center text-muted">
          <i className="bi bi-compass fs-1 mb-3 d-block text-crimson"></i>
          <h4>No packages found</h4>
          <p>Try resetting or adjusting your search filters.</p>
        </div>
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {packages.map(pkg => (
            <div className="col" key={pkg.id}>
              <PackageCard 
                packageData={pkg} 
                onBook={handleOpenBooking}
                onCompare={handleCompare}
                isCompared={!!comparedPackages.find(p => p.id === pkg.id)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Comparison Bottom Dock */}
      <CompareDock 
        comparedPackages={comparedPackages} 
        onRemove={handleRemoveCompare} 
        onClear={handleClearCompare}
        onBook={handleOpenBooking}
      />

      {/* Detailed Explorer & Booking Modal */}
      {selectedPkg && (
        <Modal show={!!selectedPkg} onHide={handleCloseBooking} size="lg" centered>
          <Modal.Header closeButton closeVariant="white">
            <Modal.Title>{selectedPkg.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-start">
            <div className="row">
              <div className="col-md-6 mb-4 mb-md-0">
                <img 
                  src={selectedPkg.image || selectedPkg.image_url || "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80"} 
                  className="w-100 rounded object-fit-cover" 
                  alt={selectedPkg.title} 
                  style={{ maxHeight: '300px' }}
                />
                <div className="mt-4 p-3 bg-dark rounded border border-secondary">
                  <h6 className="text-crimson font-monospace text-uppercase mb-2">Package Details</h6>
                  <ul className="list-unstyled mb-0 text-white" style={{ fontSize: '0.9rem' }}>
                    <li className="mb-2"><strong><i className="bi bi-geo-alt-fill text-crimson me-1"></i> Destination:</strong> {selectedPkg.destination}</li>
                    <li className="mb-2"><strong><i className="bi bi-currency-dollar text-crimson me-1"></i> Price:</strong> ${parseFloat(selectedPkg.price).toFixed(2)} / Person</li>
                    <li className="mb-2"><strong><i className="bi bi-clock-fill text-crimson me-1"></i> Duration:</strong> {selectedPkg.duration_days} Days</li>
                    <li className="mb-2"><strong><i className="bi bi-house-door-fill text-crimson me-1"></i> Accommodations:</strong> {selectedPkg.accommodation || 'Luxury camping shelter'}</li>
                    <li className="mb-2"><strong><i className="bi bi-truck text-crimson me-1"></i> Transportation:</strong> {selectedPkg.transportation || 'Self transfer'}</li>
                    <li className="mb-0"><strong><i className="bi bi-shield-fill-check text-crimson me-1"></i> Organized By:</strong> {selectedPkg.provider_username}</li>
                  </ul>
                </div>
              </div>

              <div className="col-md-6">
                <h5 className="text-white mb-2 font-monospace text-uppercase" style={{ fontSize: '0.95rem' }}>Description</h5>
                <p className="text-muted mb-3" style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>{selectedPkg.description}</p>
                
                <h5 className="text-white mb-2 font-monospace text-uppercase" style={{ fontSize: '0.95rem' }}>Adventure Activities</h5>
                <div className="d-flex flex-wrap gap-1 mb-4">
                  {selectedPkg.activities.split(',').map((act, idx) => (
                    <span key={idx} className="badge-activity">{act.trim()}</span>
                  ))}
                </div>

                <h5 className="text-white mb-2 font-monospace text-uppercase" style={{ fontSize: '0.95rem' }}>Safety Measures</h5>
                <p className="text-muted mb-4" style={{ fontSize: '0.85rem' }}>{selectedPkg.safety_measures || 'Standard wilderness guidelines and certified camp leaders included.'}</p>

                {/* Booking section */}
                <div className="p-4 bg-black rounded border border-danger">
                  <h6 className="text-white mb-3 text-uppercase font-monospace"><i className="bi bi-calendar-event me-2 text-danger"></i>Reserve Slots</h6>
                  
                  {bookingError && (
                    <div className="alert alert-danger py-1 px-3 border-0 bg-danger text-white rounded mb-3" style={{ fontSize: '0.8rem' }}>
                      {bookingError}
                    </div>
                  )}

                  {bookingSuccess && (
                    <div className="alert alert-success py-1 px-3 border-0 bg-success text-white rounded mb-3" style={{ fontSize: '0.8rem' }}>
                      {bookingSuccess}
                    </div>
                  )}

                  {!user ? (
                    <div className="text-center">
                      <p className="text-muted mb-2" style={{ fontSize: '0.85rem' }}>Sign in to book this adventure package.</p>
                      <button className="btn btn-primary btn-sm w-100" onClick={() => navigate('/login', { state: { from: location.pathname } })}>
                        Login / Sign Up
                      </button>
                    </div>
                  ) : user.role === 'provider' ? (
                    <div className="text-center text-muted" style={{ fontSize: '0.85rem' }}>
                      Logged in as <strong>{user.username} (Provider)</strong>.<br />
                      Providers cannot book packages.
                    </div>
                  ) : (
                    <form onSubmit={handleConfirmBooking}>
                      <div className="mb-3">
                        <label className="form-label text-muted" style={{ fontSize: '0.8rem' }}>Travel Date</label>
                        <input 
                          type="date" 
                          name="travel_date" 
                          className="form-control form-control-sm" 
                          value={bookingData.travel_date}
                          onChange={handleBookingChange}
                          min={new Date().toISOString().split('T')[0]}
                          required
                        />
                      </div>
                      
                      <div className="mb-3">
                        <label className="form-label text-muted d-block" style={{ fontSize: '0.8rem' }}>Travelers (Slots)</label>
                        <div className="d-flex align-items-center gap-2">
                          <button type="button" className="btn btn-outline-primary btn-sm px-3" onClick={() => handleSlotsChange(-1)}>-</button>
                          <input 
                            type="number" 
                            name="slots" 
                            className="form-control form-control-sm text-center" 
                            style={{ width: '80px' }} 
                            value={bookingData.slots} 
                            readOnly
                          />
                          <button type="button" className="btn btn-outline-primary btn-sm px-3" onClick={() => handleSlotsChange(1)}>+</button>
                        </div>
                      </div>

                      <div className="d-flex justify-content-between align-items-center mb-4 pt-2 border-top border-secondary">
                        <span className="text-muted" style={{ fontSize: '0.85rem' }}>Total Cost</span>
                        <h4 className="text-crimson mb-0 font-monospace" style={{ fontSize: '1.4rem' }}>
                          ${(parseFloat(selectedPkg.price) * (parseInt(bookingData.slots) || 1)).toFixed(2)}
                        </h4>
                      </div>

                      <button 
                        type="submit" 
                        className="btn btn-primary w-100 d-flex justify-content-center align-items-center gap-2"
                        disabled={isSubmittingBooking}
                      >
                        {isSubmittingBooking ? (
                          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        ) : null}
                        Confirm Booking
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={handleCloseBooking}>Close</Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default BrowsePackages;
