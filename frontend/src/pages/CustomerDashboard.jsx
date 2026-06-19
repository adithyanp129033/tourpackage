import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { Form, Button, Table, Modal, Badge } from 'react-bootstrap';

/* ─── Chat Panel Component ─────────────────────────────────── */
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
    const interval = setInterval(fetchMessages, 5000); // poll every 5s
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

  const provider = booking.package_details;

  return (
    <Modal show onHide={onClose} centered size="md">
      <Modal.Header closeButton closeVariant="white" className="border-secondary">
        <Modal.Title className="font-monospace text-uppercase" style={{ fontSize: '0.95rem' }}>
          <i className="bi bi-chat-dots-fill text-crimson me-2"></i>
          Chat — {provider?.title || 'Package'}
        </Modal.Title>
      </Modal.Header>

      {/* Provider contact strip */}
      <div className="px-3 py-2 d-flex gap-3 align-items-start border-bottom border-secondary"
           style={{ background: 'rgba(255,255,255,0.03)', fontSize: '0.8rem' }}>
        <div>
          <span className="text-muted me-1"><i className="bi bi-person-badge-fill text-crimson me-1"></i>Provider:</span>
          <span className="text-white fw-semibold">{provider?.provider_username}</span>
        </div>
        {provider?.provider_email && (
          <div>
            <i className="bi bi-envelope-fill text-crimson me-1"></i>
            <a href={`mailto:${provider.provider_email}`} className="text-info" style={{ fontSize: '0.78rem' }}>
              {provider.provider_email}
            </a>
          </div>
        )}
        {provider?.provider_phone && (
          <div>
            <i className="bi bi-telephone-fill text-crimson me-1"></i>
            <span className="text-white">{provider.provider_phone}</span>
          </div>
        )}
      </div>

      <Modal.Body style={{ height: '340px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {messages.length === 0 && (
          <div className="text-center text-muted py-4" style={{ fontSize: '0.85rem' }}>
            <i className="bi bi-chat-square-text fs-2 d-block mb-2 text-crimson"></i>
            No messages yet. Start the conversation!
          </div>
        )}
        {messages.map(msg => {
          const isMine = msg.sender === user?.id || msg.sender_username === user?.username;
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
                    {msg.sender_username} · {msg.sender_role}
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
            placeholder="Type a message..."
            value={newMsg}
            onChange={e => setNewMsg(e.target.value)}
            style={{ fontSize: '0.88rem' }}
            autoFocus
          />
          <Button type="submit" variant="primary" disabled={sending || !newMsg.trim()} style={{ whiteSpace: 'nowrap' }}>
            <i className="bi bi-send-fill"></i>
          </Button>
        </Form>
      </Modal.Footer>
    </Modal>
  );
};

/* ─── Main Customer Dashboard ───────────────────────────────── */
const CustomerDashboard = () => {
  const { user, updateProfile } = useAuth();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chatBooking, setChatBooking] = useState(null);

  // Profile Form State
  const [profileData, setProfileData] = useState({ email: '', phone: '', address: '', bio: '' });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('bookings/');
      setBookings(res.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleProfileChange = (e) => {
    setProfileData({ ...profileData, [e.target.name]: e.target.value });
    setProfileError(''); setProfileSuccess('');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setProfileError(''); setProfileSuccess('');
    const res = await updateProfile(profileData);
    if (res.success) setProfileSuccess('Profile updated successfully!');
    else setProfileError(res.error);
    setIsUpdating(false);
  };

  const handleCancelBooking = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        const res = await api.patch(`bookings/${id}/`, { status: 'cancelled' });
        setBookings(bookings.map(b => b.id === id ? res.data : b));
      } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Failed to cancel booking. Please try again.');
      }
    }
  };

  return (
    <div className="container py-5 text-start">
      <h2 className="mb-5 text-white font-monospace text-uppercase" style={{ letterSpacing: '0.05em' }}>
        My Explorer Profile
      </h2>

      <div className="row g-5">
        {/* Profile Editor */}
        <div className="col-lg-4">
          <div className="card glass-panel p-4">
            <h4 className="text-white mb-4 text-uppercase font-monospace" style={{ fontSize: '1rem' }}>
              <i className="bi bi-person-lines-fill me-2 text-crimson"></i>Profile Info
            </h4>

            {profileError && (
              <div className="alert alert-danger py-1 px-3 border-0 bg-danger text-white rounded mb-3" style={{ fontSize: '0.8rem' }}>
                {profileError}
              </div>
            )}
            {profileSuccess && (
              <div className="alert alert-success py-1 px-3 border-0 bg-success text-white rounded mb-3" style={{ fontSize: '0.8rem' }}>
                {profileSuccess}
              </div>
            )}

            <Form onSubmit={handleProfileSubmit}>
              <div className="mb-3">
                <label className="form-label text-muted">Username</label>
                <input type="text" className="form-control form-control-sm bg-dark text-muted border-secondary"
                  value={user?.username || ''} disabled readOnly />
              </div>
              <div className="mb-3">
                <Form.Group>
                  <Form.Label>Email Address</Form.Label>
                  <Form.Control type="email" name="email" value={profileData.email}
                    onChange={handleProfileChange} placeholder="explorer@domain.com" />
                </Form.Group>
              </div>
              <div className="mb-3">
                <Form.Group>
                  <Form.Label>Phone Number</Form.Label>
                  <Form.Control type="text" name="phone" value={profileData.phone}
                    onChange={handleProfileChange} placeholder="+91 98765 43210" />
                </Form.Group>
              </div>
              <div className="mb-3">
                <Form.Group>
                  <Form.Label>Address / Location</Form.Label>
                  <Form.Control type="text" name="address" value={profileData.address}
                    onChange={handleProfileChange} placeholder="Mumbai, Maharashtra" />
                </Form.Group>
              </div>
              <div className="mb-4">
                <Form.Group>
                  <Form.Label>Biography</Form.Label>
                  <Form.Control as="textarea" name="bio" rows="3" value={profileData.bio}
                    onChange={handleProfileChange} placeholder="Write a brief bio..." />
                </Form.Group>
              </div>
              <Button type="submit" variant="primary" className="btn-sm w-100" disabled={isUpdating}>
                {isUpdating ? 'Updating...' : 'Update Settings'}
              </Button>
            </Form>
          </div>
        </div>

        {/* Bookings History */}
        <div className="col-lg-8">
          <div className="card glass-panel p-4 h-100">
            <h4 className="text-white mb-4 text-uppercase font-monospace" style={{ fontSize: '1rem' }}>
              <i className="bi bi-clock-history me-2 text-crimson"></i>Bookings History
            </h4>

            {loading ? (
              <p className="text-muted text-center py-4">Loading history...</p>
            ) : bookings.length === 0 ? (
              <div className="text-center text-muted py-5">
                <i className="bi bi-calendar2-x fs-1 mb-3 d-block text-crimson"></i>
                <h5>No bookings made yet</h5>
                <p style={{ fontSize: '0.85rem' }}>Your upcoming tour experiences will show up here.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <Table className="table align-middle">
                  <thead>
                    <tr>
                      <th>Tour Package</th>
                      <th>Travel Date</th>
                      <th>Slots</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id}>
                        <td>
                          <div className="fw-semibold text-white">
                            {b.package_details?.title || 'Tour Package'}
                          </div>
                          <small className="text-muted font-monospace" style={{ fontSize: '0.75rem' }}>
                            <i className="bi bi-geo-alt-fill text-crimson me-1"></i>
                            {b.package_details?.destination || 'India'}
                          </small>
                          <div style={{ fontSize: '0.72rem', color: '#aaa', marginTop: '2px' }}>
                            <i className="bi bi-person-badge text-crimson me-1"></i>
                            Provider: {b.package_details?.provider_username}
                          </div>
                        </td>
                        <td className="text-white">{b.travel_date}</td>
                        <td className="text-white">{b.slots}</td>
                        <td className="text-crimson font-monospace fw-bold">
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
                          <div className="d-flex flex-column gap-1">
                            {/* Chat with Provider */}
                            <button
                              className="btn btn-outline-info btn-sm p-1 px-2 position-relative"
                              style={{ fontSize: '0.78rem' }}
                              onClick={() => setChatBooking(b)}
                              title="Chat with provider"
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
                            {/* Cancel booking */}
                            {b.status === 'pending' && (
                              <button
                                className="btn btn-outline-danger btn-sm p-1 px-2"
                                style={{ fontSize: '0.78rem' }}
                                onClick={() => handleCancelBooking(b.id)}
                              >
                                <i className="bi bi-x-circle me-1"></i>Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat Modal */}
      {chatBooking && (
        <ChatPanel booking={chatBooking} onClose={() => setChatBooking(null)} />
      )}
    </div>
  );
};

export default CustomerDashboard;
