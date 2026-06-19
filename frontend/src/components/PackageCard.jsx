import React from 'react';

const PackageCard = ({ packageData, onBook, onCompare, isCompared, isProviderView, onEdit, onDelete }) => {
  const { title, description, destination, price, duration_days, activities, rating, image_url, image } = packageData;

  const activityList = activities ? activities.split(',').map(act => act.trim()) : [];

  const defaultImage = "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=800&q=80";
  const displayImage = image || image_url || defaultImage;

  return (
    <div className="card glass-card h-100 text-start border-0" style={{ borderRadius: '14px' }}>

      {/* ── Image Section ─────────────────────────────── */}
      <div className="position-relative" style={{ height: '210px', overflow: 'hidden', flexShrink: 0 }}>
        <img
          src={displayImage}
          className="w-100 h-100"
          alt={title}
          style={{
            objectFit: 'cover',
            transition: 'transform 0.5s ease',
            display: 'block',
          }}
          onMouseOver={e => e.currentTarget.style.transform = 'scale(1.08)'}
          onMouseOut={e => e.currentTarget.style.transform = 'scale(1.0)'}
        />

        {/* Gradient fade at bottom of image → blends into card body */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px',
          background: 'linear-gradient(to bottom, transparent, var(--card-body-bg))',
          pointerEvents: 'none',
        }} />

        {/* Rating Badge */}
        <div className="position-absolute top-0 end-0 m-2 d-flex align-items-center gap-1"
          style={{
            background: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(6px)',
            borderRadius: '8px',
            padding: '4px 8px',
            fontSize: '0.78rem',
            color: '#fff',
            fontWeight: 600,
          }}>
          <i className="bi bi-star-fill" style={{ color: '#fbbf24' }}></i>
          {rating}
        </div>

        {/* Price Badge */}
        <div className="position-absolute bottom-0 start-0 m-2"
          style={{
            background: 'linear-gradient(135deg, #8b0000, #dc2626)',
            borderRadius: '8px',
            padding: '4px 10px',
            fontSize: '0.88rem',
            color: '#fff',
            fontWeight: 700,
            letterSpacing: '0.02em',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}>
          ₹{parseFloat(price).toLocaleString('en-IN')}
        </div>
      </div>

      {/* ── Card Body ──────────────────────────────────── */}
      <div className="card-body d-flex flex-column justify-content-between p-3 pt-2">
        <div>

          {/* Destination + Duration row */}
          <div className="d-flex align-items-center justify-content-between mb-1">
            <span className="d-flex align-items-center gap-1 text-uppercase font-monospace"
              style={{ fontSize: '0.72rem', letterSpacing: '0.06em', color: 'var(--card-dest-color)', fontWeight: 700 }}>
              <i className="bi bi-geo-alt-fill"></i>
              {destination}
            </span>
            <span className="d-flex align-items-center gap-1"
              style={{ fontSize: '0.75rem', color: 'var(--card-meta-color)' }}>
              <i className="bi bi-clock"></i>
              {duration_days} Days
            </span>
          </div>

          {/* Title */}
          <h5 className="mb-2 text-truncate"
            style={{
              fontSize: '1.08rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              color: 'var(--card-title-color)',
              fontFamily: 'var(--font-display)',
            }}>
            {title}
          </h5>

          {/* Description */}
          <p className="mb-3"
            style={{
              fontSize: '0.82rem',
              lineHeight: 1.55,
              color: 'var(--card-desc-color)',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              margin: 0,
            }}>
            {description}
          </p>

          {/* Activity Tags */}
          <div className="mb-3 d-flex flex-wrap gap-1">
            {activityList.slice(0, 3).map((act, idx) => (
              <span key={idx} className="badge-activity d-inline-block">{act}</span>
            ))}
            {activityList.length > 3 && (
              <span style={{ fontSize: '0.7rem', color: 'var(--card-meta-color)', alignSelf: 'center' }}>
                +{activityList.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* ── Action Buttons ────────────────────────────── */}
        <div>
          {isProviderView ? (
            <div className="d-flex gap-2">
              <button className="btn btn-outline-primary btn-sm flex-fill" onClick={() => onEdit(packageData)}>
                <i className="bi bi-pencil me-1"></i>Edit
              </button>
              <button
                className="btn btn-sm flex-fill"
                onClick={() => onDelete(packageData.id)}
                style={{ background: '#dc2626', color: '#fff', border: 'none' }}
              >
                <i className="bi bi-trash me-1"></i>Delete
              </button>
            </div>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <button className="btn btn-primary btn-sm flex-fill" onClick={() => onBook(packageData)}>
                <i className="bi bi-lightning-fill me-1"></i>Explore &amp; Book
              </button>
              {onCompare && (
                <button
                  className={`btn btn-sm ${isCompared ? 'btn-danger' : 'btn-outline-primary'}`}
                  onClick={() => onCompare(packageData)}
                  title={isCompared ? 'Remove from comparison' : 'Add to comparison'}
                  style={{ whiteSpace: 'nowrap' }}
                >
                  <i className={`bi ${isCompared ? 'bi-x-circle' : 'bi-plus-circle'}`}></i>
                  <span className="d-none d-lg-inline ms-1">{isCompared ? 'Remove' : 'Compare'}</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PackageCard;
