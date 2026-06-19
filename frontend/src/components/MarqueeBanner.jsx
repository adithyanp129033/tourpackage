import React from 'react';

const MarqueeBanner = () => {
  const items = [
    "Adventure Camping", "Explore Wilderness", "Secure Bookings", 
    "Verified Providers", "Premium Accommodations", "Safety Certified", 
    "Extreme Activities", "Memorable Expeditions"
  ];

  // Repeat items to fill space and ensure smooth infinite scrolling
  const repeatedItems = [...items, ...items, ...items];

  return (
    <div className="marquee-container d-none d-md-block">
      <div className="marquee-content">
        {repeatedItems.map((item, index) => (
          <span key={index} className={index % 2 === 0 ? "highlight" : ""}>
            ✦ {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export default MarqueeBanner;
