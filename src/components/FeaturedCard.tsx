import React from 'react';
import { CalendarImage } from '../services/firebaseService';

interface FeaturedCardProps {
  month: CalendarImage;
  onOpen: (month: CalendarImage) => void;
}

const FeaturedCard: React.FC<FeaturedCardProps> = ({ month, onOpen }) => {
  return (
    <div className="featured-card" onClick={() => onOpen(month)}>
      <div className="featured-img-container">
        <img src={month.image} alt={month.month} />
        <div className="featured-overlay">
          <div className="featured-info">
            <span className="featured-label">Viewing Calendar for</span>
            <h3 className="featured-month-name">{month.month}</h3>
          </div>
          <div className="view-btn">View Full Size</div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedCard;
