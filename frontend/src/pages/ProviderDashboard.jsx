import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import PackageCard from '../components/PackageCard';
import { Modal, Button, Form, Table, Badge } from 'react-bootstrap';

/* ─── Chat Panel (Provider Side) ───────────────────────────── */
const ChatPanel = ({ booking, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const res = await api.get('messages/', { params: { booking: booking.id } });
      setMessages(res.data);
    } catch (e) {
      console.error('Error fetching messages:', e);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;
    setSending(true);
    try {
      const res = await api.post('messages/', { booking: booking.id, content: newMsg.trim() });
      setMessages(prev => [...prev, res.data]);
      setNewMsg('');
    } catch (e) {
      console.error('Error sending message:', e);
    } finally {
      setSending(false);
    }
  };

  const customer = booking.customer_info;

  return (
    <Modal show onHide={onClose} centered size="md">
      <Modal.Header closeButton closeVariant="white" className="border-secondary">
        <Modal.Title className="font-monospace text-uppercase" style={{ fontSize: '0.95rem' }}>
          <i className="bi bi-chat-dots-fill text-crimson me-2"></i>
          Chat with {customer?.username || booking.customer_username}
        </Modal.Title>
      </Modal.Header>

      {/* Customer contact strip */}
      <div className="px-3 py-2 border-bottom border-secondary"
           style={{ background: 'rgba(255,255,255,0.03)', fontSize: '0.8rem' }}>
        <div className="d-flex flex-wrap gap-3">
          <div>
            <i className="bi bi-person-fill text-crimson me-1"></i>
            <span className="text-white fw-semibold">{customer?.username}</span>
          </div>
          {customer?.email && (
            <div>
              <i className="bi bi-envelope-fill text-crimson me-1"></i>
              <a href={`mailto:${customer.email}`} className="text-info">{customer.email}</a>
            </div>
          )}
          {customer?.phone && (
            <div>
              <i className="bi bi-telephone-fill text-crimson me-1"></i>
              <span className="text-white">{customer.phone}</span>
            </div>
          )}
          {customer?.address && (
            <div>
              <i className="bi bi-geo-alt-fill text-crimson me-1"></i>
              <span className="text-muted">{customer.address}</span>
            </div>
          )}
        </div>
        {customer?.bio && (
          <div className="mt-1 text-muted" style={{ fontSize: '0.75rem' }}>
            <i className="bi bi-info-circle me-1"></i>{customer.bio}
          </div>
        )}
      </div>

      <Modal.Body style={{ height: '320px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {messages.length === 0 && (
          <div className="text-center text-muted py-4" style={{ fontSize: '0.85rem' }}>
            <i className="bi bi-chat-square-text fs-2 d-block mb-2 text-crimson"></i>
            No messages yet.
          </div>
        )}
        {messages.map(msg => {
          const isMine = msg.sender_username === user?.username;
          return (
            <div key={msg.id} className={`d-flex ${isMine ? 'justify-content-end' : 'justify-content-start'}`}>
              <div style={{
                maxWidth: '75%',
                padding: '8px 12px',
                borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: isMine
                  ? 'linear-gradient(135deg, #8b0000, #c0392b)'
                  : 'rgba(255,255,255,0.08)',
                fontSize: '0.85rem',
              }}>
                {!isMine && (
                  <div style={{ fontSize: '0.7rem', color: '#aaa', marginBottom: '2px' }}>
                    {msg.sender_username}
                  </div>
                )}
                <div className="text-white">{msg.content}</div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.5)', textAlign: isMine ? 'right' : 'left', marginTop: '2px' }}>
                  {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </Modal.Body>

      <Modal.Footer className="border-secondary p-2">
        <Form onSubmit={handleSend} className="d-flex w-100 gap-2">
          <Form.Control
            type="text"
            placeholder="Reply to customer..."
            value={newMsg}
            onChange={e => setNewMsg(e.target.value)}
            style={{ fontSize: '0.88rem' }}
            autoFocus
          />
          <Button type="submit" variant="primary" disabled={sending || !newMsg.trim()}>
            <i className="bi bi-send-fill"></i>
          </Button>
        </Form>
      </Modal.Footer>
    </Modal>
  );
};

/* ─── Customer Detail Modal ─────────────────────────────────── */
const CustomerDetailModal = ({ booking, onClose, onChat }) => {
  const customer = booking.customer_info;
  if (!customer) return null;

  return (
    <Modal show onHide={onClose} centered size="sm">
      <Modal.Header closeButton closeVariant="white" className="border-secondary">
        <Modal.Title className="font-monospace text-uppercase" style={{ fontSize: '0.9rem' }}>
          <i className="bi bi-person-circle text-crimson me-2"></i>Customer Profile
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex flex-column gap-3">
          {/* Avatar placeholder */}
          <div className="text-center">
            <div style={{
              width: 64, height: 64, borderRadius: '50%', margin: '0 auto',
              background: 'linear-gradient(135deg, #8b0000, #c0392b)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.5rem', color: '#fff', fontWeight: 700
            }}>
              {customer.username?.[0]?.toUpperCase()}
            </div>
            <h5 className="text-white mt-2 mb-0">{customer.username}</h5>
            <small className="text-muted">Customer</small>
          </div>

          <hr className="border-secondary my-1" />

          <div className="d-flex flex-column gap-2" style={{ fontSize: '0.85rem' }}>
            {customer.email && (
              <div>
                <i className="bi bi-envelope-fill text-crimson me-2"></i>
                <a href={`mailto:${customer.email}`} className="text-info">{customer.email}</a>
              </div>
            )}
            {customer.phone && (
              <div>
                <i className="bi bi-telephone-fill text-crimson me-2"></i>
                <span className="text-white">{customer.phone}</span>
              </div>
            )}
            {customer.address && (
              <div>
                <i className="bi bi-geo-alt-fill text-crimson me-2"></i>
                <span className="text-muted">{customer.address}</span>
              </div>
            )}
            {customer.bio && (
              <div className="mt-1">
                <i className="bi bi-card-text text-crimson me-2"></i>
                <span className="text-muted">{customer.bio}</span>
              </div>
            )}
          </div>

          <hr className="border-secondary my-1" />

          {/* Booking summary */}
          <div style={{ fontSize: '0.8rem' }} className="d-flex flex-column gap-1">
            <div>
              <span className="text-muted me-2">Package:</span>
              <span className="text-white">{booking.package_details?.title}</span>
            </div>
            <div>
              <span className="text-muted me-2">Travel Date:</span>
              <span className="text-white">{booking.travel_date}</span>
            </div>
            <div>
              <span className="text-muted me-2">Slots:</span>
              <span className="text-white">{booking.slots}</span>
            </div>
            <div>
              <span className="text-muted me-2">Total:</span>
              <span className="text-crimson fw-bold font-monospace">
                ₹{parseFloat(booking.total_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-secondary">
        <Button variant="outline-info" size="sm" onClick={() => { onClose(); onChat(booking); }}>
          <i className="bi bi-chat-dots-fill me-1"></i>Open Chat
        </Button>
        <Button variant="outline-secondary" size="sm" onClick={onClose}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

/* ─── Main Provider Dashboard ───────────────────────────────── */
const ProviderDashboard = () => {
  const { user } = useAuth();

  const [packages, setPackages] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showPkgModal, setShowPkgModal] = useState(false);
  const [editingPkg, setEditingPkg] = useState(null);
  const [pkgFormData, setPkgFormData] = useState({
    title: '', description: '', destination: '', price: '',
    duration_days: '', accommodation: '', transportation: '',
    activities: '', safety_measures: '', image_url: ''
  });
  const [pkgError, setPkgError] = useState('');
  const [isSubmittingPkg, setIsSubmittingPkg] = useState(false);

  const [imageSource, setImageSource] = useState('url');
  const [imageFile, setImageFile] = useState(null);

  // Chat & Customer Detail modals
  const [chatBooking, setChatBooking] = useState(null);
  const [detailBooking, setDetailBooking] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const packagesResponse = await api.get('packages/', { params: { provider_only: 'true' } });
      setPackages(packagesResponse.data);
      const bookingsResponse = await api.get('bookings/');
      setBookings(bookingsResponse.data);
    } catch (error) {
      console.error('Error fetching provider data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  // Metrics
  const totalPackages = packages.length;
  const totalBookings = bookings.length;
  const activeBookings = bookings.filter(b => b.status === 'confirmed').length;
  const totalRevenue = bookings
    .filter(b => b.status === 'confirmed')
    .reduce((sum, b) => sum + parseFloat(b.total_price), 0);
  const totalUnread = bookings.reduce((sum, b) => sum + (b.unread_messages || 0), 0);

  const handleFormChange = (e) => {
    setPkgFormData({ ...pkgFormData, [e.target.name]: e.target.value });
    setPkgError('');
  };

  const handleOpenCreate = () => {
    setEditingPkg(null);
    setPkgFormData({ title: '', description: '', destination: '', price: '', duration_days: '', accommodation: '', transportation: '', activities: '', safety_measures: '', image_url: '' });
    setPkgError(''); setImageSource('url'); setImageFile(null);
    setShowPkgModal(true);
  };

  const handleOpenEdit = (pkg) => {
    setEditingPkg(pkg);
    setPkgFormData({
      title: pkg.title, description: pkg.description, destination: pkg.destination,
      price: pkg.price, duration_days: pkg.duration_days,
      accommodation: pkg.accommodation || '', transportation: pkg.transportation || '',
      activities: pkg.activities, safety_measures: pkg.safety_measures || '',
      image_url: pkg.image_url || ''
    });
    setPkgError('');
    setImageSource(pkg.image ? 'file' : 'url');
    setImageFile(null);
    setShowPkgModal(true);
  };

  const handlePkgSubmit = async (e) => {
    e.preventDefault();
    if (!pkgFormData.title || !pkgFormData.destination || !pkgFormData.price || !pkgFormData.duration_days || !pkgFormData.activities) {
      setPkgError('Please fill out all required fields.');
      return;
    }
    setIsSubmittingPkg(true); setPkgError('');
    const data = new FormData();
    Object.entries(pkgFormData).forEach(([k, v]) => {
      if (k !== 'image_url' || imageSource === 'url') data.append(k, v);
    });
    if (imageSource === 'file') {
      if (imageFile) data.append('image', imageFile);
      data.append('image_url', '');
    }
    const config = { headers: { 'Content-Type': 'multipart/form-data' } };
    try {
      if (editingPkg) {
        const res = await api.put(`packages/${editingPkg.id}/`, data, config);
        setPackages(packages.map(p => p.id === editingPkg.id ? res.data : p));
      } else {
        const res = await api.post('packages/', data, config);
        setPackages([res.data, ...packages]);
      }
      setShowPkgModal(false);
    } catch (error) {
      console.error('Error saving package:', error);
      setPkgError(error.response?.data?.detail || 'Failed to save package. Please verify fields.');
    } finally {
      setIsSubmittingPkg(false);
    }
  };

  const handleDeletePkg = async (id) => {
    if (window.confirm('Are you sure you want to delete this package? This cannot be undone.')) {
      try {
        await api.delete(`packages/${id}/`);
        setPackages(packages.filter(p => p.id !== id));
      } catch (error) {
        console.error('Error deleting package:', error);
        alert('Failed to delete package. It might have active bookings associated with it.');
      }
    }
  };

  const handleUpdateBookingStatus = async (id, newStatus) => {
    try {
      const res = await api.patch(`bookings/${id}/`, { status: newStatus });
      setBookings(bookings.map(b => b.id === id ? res.data : b));
    } catch (error) {
      console.error('Error updating booking status:', error);
      alert('Failed to update booking status.');
    }
  };

  return (
    <div className="container py-5 text-start">
      <h2 className="mb-4 text-white font-monospace text-uppercase" style={{ letterSpacing: '0.05em' }}>
        Provider Command Center
      </h2>

      {/* Metrics Cards */}
      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <div className="card glass-panel p-4 h-100 border-0" style={{ borderLeft: '4px solid var(--crimson-glow) !important' }}>
            <span className="text-muted font-monospace text-uppercase" style={{ fontSize: '0.75rem' }}>Active Packages</span>
            <h2 className="text-white mt-2 mb-0 font-monospace">{totalPackages}</h2>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card glass-panel p-4 h-100 border-0" style={{ borderLeft: '4px solid #ffffff !important' }}>
            <span className="text-muted font-monospace text-uppercase" style={{ fontSize: '0.75rem' }}>Total Bookings</span>
            <h2 className="text-white mt-2 mb-0 font-monospace">{totalBookings}</h2>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card glass-panel p-4 h-100 border-0" style={{ borderLeft: '4px solid #28a745 !important' }}>
            <span className="text-muted font-monospace text-uppercase" style={{ fontSize: '0.75rem' }}>Confirmed Trips</span>
            <h2 className="text-success mt-2 mb-0 font-monospace">{activeBookings}</h2>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card glass-panel p-4 h-100 border-0" style={{ borderLeft: '4px solid var(--crimson-glow) !important', boxShadow: '0 0 15px rgba(255,46,46,0.1)' }}>
            <span className="text-muted font-monospace text-uppercase" style={{ fontSize: '0.75rem' }}>Revenue (Gross)</span>
            <h2 className="text-crimson mt-2 mb-0 font-monospace">
              ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h2>
          </div>
        </div>
      </div>

      {/* Unread messages alert */}
      {totalUnread > 0 && (
        <div className="alert border-0 mb-4 d-flex align-items-center gap-3"
             style={{ background: 'rgba(139,0,0,0.25)', color: '#fff', borderLeft: '4px solid var(--crimson-glow) !important', borderRadius: '8px' }}>
          <i className="bi bi-chat-dots-fill fs-4 text-crimson"></i>
          <div>
            <strong>You have {totalUnread} unread message{totalUnread > 1 ? 's' : ''}</strong> from customers.
            Check the bookings table below and click <strong>Chat</strong> to reply.
          </div>
        </div>
      )}

      <div className="row g-4">
        {/* Bookings Manager */}
        <div className="col-lg-12 mb-4">
          <div className="card glass-panel p-4">
            <h4 className="text-white mb-4 text-uppercase font-monospace" style={{ fontSize: '1rem' }}>
              <i className="bi bi-calendar-check me-2 text-crimson"></i>Customer Bookings Registry
            </h4>
            {loading ? (
              <p className="text-muted text-center py-3">Loading registry...</p>
            ) : bookings.length === 0 ? (
              <p className="text-muted text-center py-3">No bookings placed yet.</p>
            ) : (
              <div className="table-responsive">
                <Table className="table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Customer</th>
                      <th>Contact</th>
                      <th>Package</th>
                      <th>Travel Date</th>
                      <th>Slots</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => {
                      const cust = b.customer_info || {};
                      return (
                        <tr key={b.id}>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <div style={{
                                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                                background: 'linear-gradient(135deg, #8b0000, #c0392b)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.85rem', color: '#fff', fontWeight: 700
                              }}>
                                {(cust.username || b.customer_username)?.[0]?.toUpperCase()}
                              </div>
                              <div>
                                <div className="fw-semibold text-white" style={{ fontSize: '0.88rem' }}>
                                  {cust.username || b.customer_username}
                                </div>
                                {cust.address && (
                                  <small className="text-muted" style={{ fontSize: '0.72rem' }}>
                                    <i className="bi bi-geo-alt-fill text-crimson me-1"></i>{cust.address}
                                  </small>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex flex-column gap-1" style={{ fontSize: '0.78rem' }}>
                              {cust.email ? (
                                <a href={`mailto:${cust.email}`} className="text-info">
                                  <i className="bi bi-envelope-fill text-crimson me-1"></i>{cust.email}
                                </a>
                              ) : <span className="text-muted">—</span>}
                              {cust.phone && (
                                <span className="text-white">
                                  <i className="bi bi-telephone-fill text-crimson me-1"></i>{cust.phone}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="text-muted" style={{ fontSize: '0.85rem' }}>{b.package_details?.title || 'Tour Package'}</td>
                          <td className="text-white">{b.travel_date}</td>
                          <td className="text-white">{b.slots}</td>
                          <td className="text-crimson font-monospace fw-bold" style={{ fontSize: '0.85rem' }}>
                            ₹{parseFloat(b.total_price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td>
                            <span className={`badge text-uppercase p-2 ${
                              b.status === 'confirmed' ? 'bg-success' :
                              b.status === 'cancelled' ? 'bg-danger' : 'bg-warning text-dark'
                            }`} style={{ fontSize: '0.7rem' }}>
                              {b.status}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex flex-wrap gap-1">
                              {/* View Customer Details */}
                              <button
                                className="btn btn-outline-light btn-sm p-1 px-2"
                                style={{ fontSize: '0.75rem' }}
                                onClick={() => setDetailBooking(b)}
                                title="View customer details"
                              >
                                <i className="bi bi-person-lines-fill me-1"></i>Details
                              </button>

                              {/* Chat */}
                              <button
                                className="btn btn-outline-info btn-sm p-1 px-2 position-relative"
                                style={{ fontSize: '0.75rem' }}
                                onClick={() => setChatBooking(b)}
                                title="Chat with customer"
                              >
                                <i className="bi bi-chat-dots-fill me-1"></i>Chat
                                {b.unread_messages > 0 && (
                                  <Badge bg="danger" pill
                                    className="position-absolute top-0 start-100 translate-middle"
                                    style={{ fontSize: '0.6rem' }}>
                                    {b.unread_messages}
                                  </Badge>
                                )}
                              </button>

                              {/* Approve / Reject */}
                              {b.status === 'pending' && (
                                <>
                                  <button
                                    className="btn btn-success btn-sm p-1 px-2"
                                    style={{ fontSize: '0.75rem' }}
                                    onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')}
                                    title="Confirm booking"
                                  >
                                    <i className="bi bi-check-lg"></i>
                                  </button>
                                  <button
                                    className="btn btn-danger btn-sm p-1 px-2"
                                    style={{ fontSize: '0.75rem' }}
                                    onClick={() => handleUpdateBookingStatus(b.id, 'cancelled')}
                                    title="Reject booking"
                                  >
                                    <i className="bi bi-x-lg"></i>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            )}
          </div>
        </div>

        {/* Packages Manager */}
        <div className="col-lg-12">
          <div className="card glass-panel p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="text-white mb-0 text-uppercase font-monospace" style={{ fontSize: '1rem' }}>
                <i className="bi bi-compass me-2 text-crimson"></i>My Hosted Packages
              </h4>
              <button className="btn btn-primary btn-sm" onClick={handleOpenCreate}>
                <i className="bi bi-plus-lg me-1"></i>Host New Package
              </button>
            </div>

            {loading ? (
              <p className="text-muted text-center py-3">Loading packages...</p>
            ) : packages.length === 0 ? (
              <p className="text-muted text-center py-3">No packages hosted yet. Click "Host New Package" to get started.</p>
            ) : (
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {packages.map(pkg => (
                  <div className="col" key={pkg.id}>
                    <PackageCard
                      packageData={pkg}
                      isProviderView={true}
                      onEdit={handleOpenEdit}
                      onDelete={handleDeletePkg}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Package Creation/Edition Modal */}
      <Modal show={showPkgModal} onHide={() => setShowPkgModal(false)} size="lg" centered>
        <Modal.Header closeButton closeVariant="white">
          <Modal.Title>{editingPkg ? 'Modify hosted package' : 'Host new package'}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-start">
          {pkgError && (
            <div className="alert alert-danger py-2 px-3 border-0 bg-danger text-white rounded mb-3" style={{ fontSize: '0.85rem' }}>
              {pkgError}
            </div>
          )}
          <Form onSubmit={handlePkgSubmit}>
            <div className="row g-3">
              <div className="col-md-8">
                <Form.Group className="mb-2">
                  <Form.Label>Package Title *</Form.Label>
                  <Form.Control type="text" name="title" value={pkgFormData.title} onChange={handleFormChange}
                    placeholder="e.g. Kerala Backwaters Retreat" required />
                </Form.Group>
              </div>
              <div className="col-md-4">
                <Form.Group className="mb-2">
                  <Form.Label>Price (₹) *</Form.Label>
                  <Form.Control type="number" name="price" step="0.01" value={pkgFormData.price}
                    onChange={handleFormChange} placeholder="15000" required />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-2">
                  <Form.Label>Destination *</Form.Label>
                  <Form.Control type="text" name="destination" value={pkgFormData.destination}
                    onChange={handleFormChange} placeholder="e.g. Manali, Himachal Pradesh" required />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-2">
                  <Form.Label>Duration (Days) *</Form.Label>
                  <Form.Control type="number" name="duration_days" value={pkgFormData.duration_days}
                    onChange={handleFormChange} placeholder="5" required />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group className="mb-2">
                  <Form.Label>Brief Description *</Form.Label>
                  <Form.Control as="textarea" name="description" rows="3" value={pkgFormData.description}
                    onChange={handleFormChange} placeholder="Describe the experience, highlights, and target travellers..." required />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-2">
                  <Form.Label>Accommodation</Form.Label>
                  <Form.Control type="text" name="accommodation" value={pkgFormData.accommodation}
                    onChange={handleFormChange} placeholder="e.g. Luxury Houseboat, Tent Stay" />
                </Form.Group>
              </div>
              <div className="col-md-6">
                <Form.Group className="mb-2">
                  <Form.Label>Transportation</Form.Label>
                  <Form.Control type="text" name="transportation" value={pkgFormData.transportation}
                    onChange={handleFormChange} placeholder="e.g. AC Bus, Flight included" />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group className="mb-2">
                  <Form.Label>Activities (Comma Separated) *</Form.Label>
                  <Form.Control type="text" name="activities" value={pkgFormData.activities}
                    onChange={handleFormChange} placeholder="e.g. Trekking, River Rafting, Paragliding" required />
                  <Form.Text className="text-muted" style={{ fontSize: '0.75rem' }}>Separate multiple activities with commas.</Form.Text>
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group className="mb-2">
                  <Form.Label>Safety Measures</Form.Label>
                  <Form.Control as="textarea" name="safety_measures" rows="2" value={pkgFormData.safety_measures}
                    onChange={handleFormChange} placeholder="e.g. Certified guides, first aid kit, insurance included..." />
                </Form.Group>
              </div>
              <div className="col-12">
                <Form.Group className="mb-2">
                  <Form.Label className="d-block">Image Source</Form.Label>
                  <div className="btn-group w-100 mb-3" role="group">
                    <button type="button" className={`btn btn-sm ${imageSource === 'url' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setImageSource('url')}>Provide Image URL</button>
                    <button type="button" className={`btn btn-sm ${imageSource === 'file' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setImageSource('file')}>Upload Local File</button>
                  </div>
                  {imageSource === 'url' ? (
                    <Form.Control type="url" name="image_url" value={pkgFormData.image_url}
                      onChange={handleFormChange} placeholder="https://example.com/destination.jpg" />
                  ) : (
                    <div>
                      <Form.Control type="file" name="image" onChange={handleFileChange} accept="image/*" />
                      {editingPkg && editingPkg.image && !imageFile && (
                        <small className="text-muted mt-1 d-block">
                          Currently using: <a href={editingPkg.image} target="_blank" rel="noreferrer" className="text-crimson font-monospace">View Image</a>
                        </small>
                      )}
                    </div>
                  )}
                </Form.Group>
              </div>
            </div>
            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top border-secondary">
              <Button variant="outline-secondary" onClick={() => setShowPkgModal(false)}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={isSubmittingPkg}>
                {isSubmittingPkg ? 'Saving...' : 'Save Package'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Customer Detail Modal */}
      {detailBooking && (
        <CustomerDetailModal
          booking={detailBooking}
          onClose={() => setDetailBooking(null)}
          onChat={b => setChatBooking(b)}
        />
      )}

      {/* Chat Modal */}
      {chatBooking && (
        <ChatPanel booking={chatBooking} onClose={() => setChatBooking(null)} />
      )}
    </div>
  );
};

export default ProviderDashboard;
