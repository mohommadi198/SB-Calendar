import { CalendarImage } from '../services/firebaseService';
import SafeImage from './SafeImage';

interface CalendarGridProps {
  months: CalendarImage[];
  onOpen: (month: CalendarImage) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ months, onOpen }) => {
  return (
    <div className="months-slider fade-up">
      {months.map((item) => (
        <div
          key={item.id}
          className="card-premium"
          onClick={() => onOpen(item)}
          style={{ padding: '8px' }}
        >
          <SafeImage 
            src={item.image} 
            alt={item.month} 
            className="img-resp" 
            style={{ borderRadius: '12px' }} 
          />
          <h3 className="month-name" style={{ margin: '8px 0 4px 0', fontSize: '0.9rem' }}>{item.month}</h3>
        </div>
      ))}
    </div>
  );
};

export default CalendarGrid;
