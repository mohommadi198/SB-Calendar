import React from 'react';
import CalendarGrid from '../CalendarGrid';
import { CalendarImage } from '../../services/firebaseService';

interface ExploreViewProps {
  loading: boolean;
  months: CalendarImage[];
  onOpen: (month: CalendarImage) => void;
}

const ExploreView: React.FC<ExploreViewProps> = ({ loading, months, onOpen }) => {
  return (
    <div className="section fade-up">
      <h2 className="section-title">All Calendars</h2>
      {loading ? (
        <div className="months-slider">
          {[1,2,3,4].map(i => (
            <div key={i} className="card-premium skeleton" style={{ aspectRatio: '1' }}></div>
          ))}
        </div>
      ) : (
        <CalendarGrid months={months} onOpen={onOpen} />
      )}
    </div>
  );
};

export default ExploreView;
