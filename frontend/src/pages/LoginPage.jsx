import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
    phone: '',
    address: '',
    bio: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      const from = (typeof location.state?.from === 'object' ? location.state?.from?.pathname : location.state?.from) || (user.role === 'provider' ? '/provider-dashboard' : '/');
      navigate(from, { replace: true });
    }
  }, [user, navigate, location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleRoleChange = (roleVal) => {
    setFormData({
      ...formData,
      role: roleVal
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    const { username, email, password, confirmPassword, role, phone, address, bio } = formData;

    if (!username || !password) {
      setError("Username and Password are required.");
      setIsSubmitting(false);
      return;
    }

    if (isRegister) {
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setIsSubmitting(false);
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        setIsSubmitting(false);
        return;
      }

      // Registration
      const regResponse = await register({
        username,
        email,
        password,
        role,
        phone,
        address,
        bio
      });

      if (regResponse.success) {
        setSuccess("Registration successful! You can now log in.");
        setIsRegister(false);
        setFormData({
          ...formData,
          password: '',
          confirmPassword: '',
        });
      } else {
        setError(regResponse.error);
      }
    } else {
      // Login
      const loginResponse = await login(username, password);
      if (loginResponse.success) {
        const from = loginResponse.user.role === 'provider' ? '/provider-dashboard' : '/';
        navigate(from, { replace: true });
      } else {
        setError(loginResponse.error);
      }
    }
    setIsSubmitting(false);
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="card glass-panel p-5 text-start" style={{ width: '100%', maxWidth: '500px' }}>
        <h2 className="text-center mb-4 text-white font-monospace text-uppercase" style={{ letterSpacing: '0.05em' }}>
          {isRegister ? "Join CampVibe" : "Enter CampVibe"}
        </h2>
        
        {error && (
          <div className="alert alert-danger py-2 px-3 border-0 bg-danger text-white rounded mb-4" style={{ fontSize: '0.85rem', backgroundColor: 'rgba(220, 53, 69, 0.25) !important', borderLeft: '3px solid #dc3545 !important' }}>
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        {success && (
          <div className="alert alert-success py-2 px-3 border-0 bg-success text-white rounded mb-4" style={{ fontSize: '0.85rem', backgroundColor: 'rgba(40, 167, 69, 0.25) !important', borderLeft: '3px solid #28a745 !important' }}>
            <i className="bi bi-check-circle-fill me-2"></i>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="mb-3 text-center">
              <label className="form-label d-block text-center mb-2">I am registering as a:</label>
              <div className="btn-group w-100" role="group">
                <button
                  type="button"
                  className={`btn btn-sm ${formData.role === 'customer' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleRoleChange('customer')}
                >
                  Customer (Explorer)
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${formData.role === 'provider' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleRoleChange('provider')}
                >
                  Package Provider
                </button>
              </div>
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">Username</label>
            <input
              type="text"
              name="username"
              className="form-control"
              value={formData.username}
              onChange={handleChange}
              placeholder="Pick a unique username"
              required
            />
          </div>

          {isRegister && (
            <div className="mb-3">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                className="form-control"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. explorer@domain.com"
              />
            </div>
          )}

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter password"
              required
            />
          </div>

          {isRegister && (
            <>
              <div className="mb-3">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +1 555-0100"
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Address</label>
                <input
                  type="text"
                  name="address"
                  className="form-control"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="City, Country"
                />
              </div>

              {formData.role === 'provider' && (
                <div className="mb-3">
                  <label className="form-label">About You (Bio)</label>
                  <textarea
                    name="bio"
                    className="form-control"
                    rows="3"
                    value={formData.bio}
                    onChange={handleChange}
                    placeholder="Briefly describe your tours/facilities..."
                  ></textarea>
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            className="btn btn-primary w-100 mt-4 d-flex justify-content-center align-items-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : null}
            {isRegister ? "Create Account" : "Access Platform"}
          </button>
        </form>

        <div className="text-center mt-4">
          <span className="text-muted" style={{ fontSize: '0.85rem' }}>
            {isRegister ? "Already have an account? " : "New to CampVibe? "}
          </span>
          <button
            type="button"
            className="btn btn-link p-0 text-crimson font-monospace text-decoration-none text-uppercase"
            style={{ fontSize: '0.85rem', fontWeight: 'bold' }}
            onClick={() => {
              setIsRegister(!isRegister);
              setError('');
              setSuccess('');
            }}
          >
            {isRegister ? "Login here" : "Sign up here"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
