import { CalendarImage } from '../../services/firebaseService';
import SafeImage from '../SafeImage';

interface TodayViewProps {
  loading: boolean;
  featuredMonth: CalendarImage | undefined;
  currentMonthName: string;
  onOpen: (month: CalendarImage) => void;
}

const TodayView: React.FC<TodayViewProps> = ({ loading, featuredMonth, currentMonthName, onOpen }) => {
  return (
    <div className="section fade-up">
      <div className="section-header-inline">
        <h2 className="section-title">Today's Calendar</h2>
        <span className="notif-badge">
          {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
        </span>
      </div>
      
      {loading ? (
         <div className="card-premium skeleton" style={{ height: '300px' }}></div>
      ) : featuredMonth ? (
        <div className="card-premium" onClick={() => onOpen(featuredMonth)}>
          <SafeImage src={featuredMonth.image} alt={featuredMonth.month} className="img-resp" />
          <div style={{ padding: '10px 5px' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{featuredMonth.month}</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>Click to view full calendar</p>
          </div>
        </div>
      ) : (
        <div className="card-premium" style={{ textAlign: 'center', padding: '40px' }}>
          <span style={{ fontSize: '3rem' }}>📅</span>
          <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>No calendar for {currentMonthName} yet.</p>
        </div>
      )}
      <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '20px' }}>
        Swipe or check Explore for other months.
      </p>
    </div>
  );
};
export default TodayView;
