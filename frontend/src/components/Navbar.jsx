import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [theme, setTheme] = React.useState(localStorage.getItem('theme') || 'dark');

  React.useEffect(() => {
    if (theme === 'light') {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark custom-navbar sticky-top">
      <div className="container">
        <Link className="navbar-brand" to="/">
          CAMP<span>VIBE</span>
        </Link>
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link 
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`} 
                to="/"
              >
                Browse Packages
              </Link>
            </li>
            {user && user.role === 'customer' && (
              <li className="nav-item">
                <Link 
                  className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`} 
                  to="/dashboard"
                >
                  My Bookings
                </Link>
              </li>
            )}
            {user && user.role === 'provider' && (
              <li className="nav-item">
                <Link 
                  className={`nav-link ${location.pathname === '/provider-dashboard' ? 'active' : ''}`} 
                  to="/provider-dashboard"
                >
                  Provider Panel
                </Link>
              </li>
            )}
          </ul>
          <div className="d-flex align-items-center">
            {/* Theme Toggle Button */}
            <button 
              className="btn btn-outline-primary btn-sm me-3 d-flex align-items-center justify-content-center" 
              onClick={toggleTheme}
              title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
              style={{ width: '36px', height: '36px', borderRadius: '50%', padding: 0 }}
            >
              <i className={`bi ${theme === 'dark' ? 'bi-sun-fill' : 'bi-moon-fill'}`}></i>
            </button>

            {user ? (
              <div className="dropdown">
                <button 
                  className="btn btn-outline-primary dropdown-toggle btn-sm d-flex align-items-center gap-2" 
                  type="button" 
                  id="userDropdown" 
                  data-bs-toggle="dropdown" 
                  aria-expanded="false"
                >
                  <i className="bi bi-person-circle"></i>
                  {user.username} 
                  <span className="badge bg-secondary ms-1 text-uppercase" style={{ fontSize: '0.65rem' }}>
                    {user.role === 'provider' ? 'Provider' : 'User'}
                  </span>
                </button>
                <ul className="dropdown-menu dropdown-menu-end dropdown-menu-dark" aria-labelledby="userDropdown" style={{ border: '1px solid var(--glass-border)' }}>
                  <li>
                    <Link className="dropdown-item" to={user.role === 'provider' ? "/provider-dashboard" : "/dashboard"}>
                      <i className="bi bi-speedometer2 me-2"></i>Dashboard
                    </Link>
                  </li>
                  <li><hr className="dropdown-divider" style={{ backgroundColor: 'var(--glass-border)' }} /></li>
                  <li>
                    <button className="dropdown-item text-danger" onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right me-2"></i>Logout
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <Link className="btn btn-primary btn-sm" to="/login">
                Get Started
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
