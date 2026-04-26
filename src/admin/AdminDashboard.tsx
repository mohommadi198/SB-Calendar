import React, { useEffect, useState } from 'react';
import { 
  uploadCalendarImage, 
  fetchCalendarImages,
  deleteCalendarImage,
  CalendarImage,
  AdImage,
  fetchAdsImages,
  uploadAdImage,
  deleteAdImage,
  updateAdVisibility,
} from '../services/firebaseService';
import { auth, db } from '../config/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import SafeImage from '../components/SafeImage';
import ImageCropperModal from './ImageCropperModal';

const AdminDashboard: React.FC = () => {
  const [calendarImages, setCalendarImages] = useState<CalendarImage[]>([]);
  const [adsImages, setAdsImages] = useState<AdImage[]>([]);
  const [loading, setLoading] = useState(true);

  // Calendar States
  const [calendarFile, setCalendarFile] = useState<File | null>(null);
  const currentMonth = new Date().toLocaleString('en-US', { month: 'long' });
  const [calendarMonth, setCalendarMonth] = useState(currentMonth);
  const [isUploadingCalendar, setIsUploadingCalendar] = useState(false);

  // Ads States
  const [adFile, setAdFile] = useState<File | null>(null);
  const [adLink, setAdLink] = useState('');
  const [adText, setAdText] = useState('');
  const [isUploadingAd, setIsUploadingAd] = useState(false);

  // Cropper States
  const [cropModalFile, setCropModalFile] = useState<File | null>(null);
  const [cropTarget, setCropTarget] = useState<'calendar' | 'ad' | null>(null);
  const [originalCalendarFile, setOriginalCalendarFile] = useState<File | null>(null);
  const [originalAdFile, setOriginalAdFile] = useState<File | null>(null);


  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const calendars = await fetchCalendarImages();
      setCalendarImages(calendars);
      const ads = await fetchAdsImages();
      setAdsImages(ads);
    } catch (error) {
      console.error("Error loading data:", error);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/admin/login');
  };

  // --- Calendar Handlers ---
  const handleUploadCalendar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!calendarFile || !calendarMonth) return;
    setIsUploadingCalendar(true);
    try {
      await uploadCalendarImage(calendarMonth, calendarFile);
      setCalendarFile(null);
      setOriginalCalendarFile(null);
      setCalendarMonth(new Date().toLocaleString('en-US', { month: 'long' }));
      loadData();
    } catch (error) {
      console.error(error);
      alert("Failed to upload calendar image.");
    }
    setIsUploadingCalendar(false);
  };

  const handleDeleteCalendar = async (img: CalendarImage) => {
    if (window.confirm(`Are you sure you want to delete the image for ${img.month}?`)) {
      await deleteCalendarImage(img.id, img.storagePath);
      loadData();
    }
  };

  // --- Ads Handlers ---
  const handleUploadAd = async (e: React.FormEvent) => {
    e.preventDefault();
    // Allow uploading text-only ads or image-only ads
    if (!adFile && !adText) {
      alert("Please provide either an image or some text for the ad.");
      return;
    }
    
    setIsUploadingAd(true);
    try {
      await uploadAdImage(adFile, adLink, adText, true);
      setAdFile(null);
      setOriginalAdFile(null);
      setAdLink('');
      setAdText('');
      loadData();
    } catch (error) {
      console.error(error);
      alert("Failed to upload ad image.");
    }
    setIsUploadingAd(false);
  };

  const handleToggleAdVisibility = async (ad: AdImage) => {
    const newVisibility = ad.visible === false ? true : false;
    await updateAdVisibility(ad.id, newVisibility);
    loadData();
  };

  const handleDeleteAd = async (ad: AdImage) => {
    if (window.confirm("Are you sure you want to delete this ad banner?")) {
      await deleteAdImage(ad.id, ad.storagePath);
      loadData();
    }
  };


  return (
    <div style={styles.container}>
      {/* Global styles */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        .image-card {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          background-color: #f1f5f9;
          aspect-ratio: 1;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .image-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04);
        }
        .image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(15,23,42,0.8) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.3s ease;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding: 16px;
        }
        .image-card:hover .image-overlay {
          opacity: 1;
        }
        .btn-delete {
          background-color: #ef4444;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.2s;
          width: 80%;
          box-shadow: 0 4px 6px -1px rgba(239,68,68,0.4);
        }
        .btn-delete:hover {
          background-color: #dc2626;
          transform: scale(1.05);
        }
        .btn-primary {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 14px;
          font-weight: 600;
          font-family: inherit;
          font-size: 15px;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .btn-primary:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.4);
        }
        .btn-primary:disabled {
          background: #94a3b8;
          cursor: not-allowed;
          opacity: 0.7;
        }
        .btn-logout {
          background-color: transparent;
          color: #64748b;
          border: 1px solid #cbd5e1;
          padding: 10px 24px;
          border-radius: 12px;
          font-weight: 600;
          font-family: inherit;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .btn-logout:hover {
          background-color: #f1f5f9;
          color: #0f172a;
          border-color: #94a3b8;
        }
        .custom-file-upload {
          border: 2px dashed #cbd5e1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s;
          background-color: #f8fafc;
          text-align: center;
          color: #64748b;
          min-height: 50px;
        }
        .custom-file-upload:hover {
          border-color: #10b981;
          background-color: #ecfdf5;
          color: #059669;
        }
        input[type="file"] {
          display: none;
        }
        .form-input {
          width: 100%;
          padding: 14px 20px;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
          font-size: 15px;
          font-family: inherit;
          transition: all 0.2s;
          outline: none;
          background-color: #f8fafc;
        }
        .form-input:focus {
          border-color: #10b981;
          background-color: #fff;
          box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
        }
        .notification-card {
          background: #fff;
          border: 1px solid #f1f5f9;
          border-radius: 16px;
          padding: 16px;
          display: flex;
          gap: 16px;
          align-items: center;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
        }
        .notif-img {
          width: 60px;
          height: 60px;
          border-radius: 10px;
          object-fit: cover;
          background-color: #f1f5f9;
        }
        .fade-in {
          animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          opacity: 0;
          transform: translateY(15px);
        }
        @keyframes fadeIn {
          to { opacity: 1; transform: translateY(0); }
        }

        /* Responsive Adjustments */
        @media (max-width: 768px) {
          .admin-main {
            padding: 24px 16px !important;
          }
          .admin-section {
            padding: 24px 16px !important;
            border-radius: 16px !important;
          }
          .admin-section-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 16px !important;
          }
          .admin-form {
            flex-direction: column !important;
          }
          .admin-header-content {
            padding: 16px !important;
          }
          .btn-primary {
            width: 100% !important;
          }
          .form-input, .admin-select {
            width: 100% !important;
            min-width: 0 !important;
          }
        }
      `}</style>

      {/* Modern Header */}
      <header style={styles.header}>
        <div className="admin-header-content" style={styles.headerContent}>
          <div style={styles.logoContainer}>
            <div style={styles.logoIcon}>🌙</div>
            <h1 style={styles.title}>Admin Portal</h1>
          </div>
          <button className="btn-logout" onClick={handleLogout}>Sign Out</button>
        </div>
      </header>

      <main className="admin-main" style={styles.main}>
        {/* Calendar Management */}
        <section className="fade-in admin-section" style={{...styles.section, animationDelay: '0.1s'}}>
          <div className="admin-section-header" style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Calendar Months</h2>
              <p style={styles.sectionSubtitle}>Manage the monthly calendar images.</p>
            </div>
          </div>
          
          <form onSubmit={handleUploadCalendar} className="admin-form" style={styles.formContainer}>
            <select 
              value={calendarMonth}
              onChange={e => setCalendarMonth(e.target.value)}
              className="admin-select"
              style={styles.selectInput}
              required
            >
              {[
                'January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December'
              ].map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <label className="custom-file-upload" style={{flex: 1}}>
              <input 
                type="file" 
                accept="image/*"
                onChange={e => {
                  if (e.target.files?.[0]) {
                    const file = e.target.files[0];
                    setOriginalCalendarFile(file);
                    setCropModalFile(file);
                    setCropTarget('calendar');
                  }
                  e.target.value = ''; // Reset input so same file can be selected again if needed
                }}
              />
              {calendarFile ? (
                <div style={{fontWeight: 600, color: '#10b981', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>
                  <div>Selected: {calendarFile.name}</div>
                  {originalCalendarFile && (
                    <button 
                      type="button"
                      className="btn-logout" 
                      style={{ padding: '4px 12px', fontSize: '12px' }}
                      onClick={(e) => {
                        e.preventDefault();
                        setCropTarget('calendar');
                        setCropModalFile(originalCalendarFile);
                      }}
                    >
                      Crop Again
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <span style={{fontSize: '24px', display: 'block', marginBottom: '8px'}}>📅</span>
                  Upload image for {calendarMonth}
                </div>
              )}
            </label>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={!calendarFile || !calendarMonth || isUploadingCalendar}
            >
              {isUploadingCalendar ? "Uploading..." : "Upload Month"}
            </button>
          </form>

          <div style={styles.grid}>
            {loading ? (
              <div style={styles.loadingText}>Loading calendar images...</div>
            ) : calendarImages.length === 0 ? (
              <div style={styles.emptyState}>No calendar images found.</div>
            ) : (
              calendarImages.map(img => (
                <div key={img.id} className="image-card">
                  <div style={styles.monthBadge}>{img.month}</div>
                  <SafeImage src={img.image} alt={img.month} style={styles.gridImage} />
                  <div className="image-overlay">
                    <button className="btn-delete" onClick={() => handleDeleteCalendar(img)}>
                      Delete Month
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Ads Management */}
        <section className="fade-in admin-section" style={{...styles.section, animationDelay: '0.2s'}}>
          <div className="admin-section-header" style={styles.sectionHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Bottom Bar Ads</h2>
              <p style={styles.sectionSubtitle}>Manage the rotating advertisements at the bottom.</p>
            </div>
          </div>
          
          <form onSubmit={handleUploadAd} className="admin-form" style={styles.formContainer}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, minWidth: '200px' }}>
              <input 
                className="form-input"
                placeholder="Ad Link (e.g. https://your-site.com)"
                value={adLink}
                onChange={e => setAdLink(e.target.value)}
              />
              <input 
                className="form-input"
                placeholder="Ad Copy / Text (Optional)"
                value={adText}
                onChange={e => setAdText(e.target.value)}
              />
            </div>
            <label className="custom-file-upload" style={{flex: 1}}>
              <input 
                type="file" 
                accept="image/*"
                onChange={e => {
                  if (e.target.files?.[0]) {
                    const file = e.target.files[0];
                    setOriginalAdFile(file);
                    setCropModalFile(file);
                    setCropTarget('ad');
                  }
                  e.target.value = '';
                }}
              />
              {adFile ? (
                <div style={{fontWeight: 600, color: '#10b981', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px'}}>
                  <div>Selected: {adFile.name}</div>
                  {originalAdFile && (
                    <button 
                      type="button"
                      className="btn-logout" 
                      style={{ padding: '4px 12px', fontSize: '12px' }}
                      onClick={(e) => {
                        e.preventDefault();
                        setCropTarget('ad');
                        setCropModalFile(originalAdFile);
                      }}
                    >
                      Crop Again
                    </button>
                  )}
                </div>
              ) : (
                <div>
                  <span style={{fontSize: '24px', display: 'block', marginBottom: '8px'}}>📢</span>
                  Upload small banner ad
                </div>
              )}
            </label>
            <button 
              type="submit" 
              className="btn-primary"
              disabled={(!adFile && !adText) || isUploadingAd}
            >
              {isUploadingAd ? "Uploading..." : "Upload Ad"}
            </button>
          </form>

          <div style={styles.grid}>
            {loading ? (
              <div style={styles.loadingText}>Loading ads...</div>
            ) : adsImages.length === 0 ? (
              <div style={styles.emptyState}>No ads found.</div>
            ) : (
              adsImages.map(ad => (
                <div key={ad.id} className="image-card" style={{ height: 'auto', minHeight: '100px', aspectRatio: 'unset', opacity: ad.visible === false ? 0.5 : 1 }}>
                  {ad.url && <SafeImage src={ad.url} alt="Ad Banner" style={{...styles.gridImage, height: '100px', objectFit: 'cover'}} />}
                  {ad.text && (
                    <div style={{ padding: '12px', textAlign: 'center', fontWeight: 'bold', background: '#fff', color: '#0f172a' }}>
                      {ad.text}
                    </div>
                  )}
                  <div className="image-overlay" style={{ flexDirection: 'column', gap: '8px' }}>
                    <button 
                      className="btn-primary" 
                      style={{ padding: '6px 12px', fontSize: '12px', width: '80%' }}
                      onClick={() => handleToggleAdVisibility(ad)}
                    >
                      {ad.visible === false ? '👁️ Show' : '🙈 Hide'}
                    </button>
                    <button className="btn-delete" style={{ padding: '6px 12px', fontSize: '12px', width: '80%' }} onClick={() => handleDeleteAd(ad)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {cropModalFile && (
        <ImageCropperModal
          imageFile={cropModalFile}
          aspect={cropTarget === 'ad' ? 440 / 60 : undefined}
          onClose={() => {
            setCropModalFile(null);
            setCropTarget(null);
          }}
          onCropComplete={(blob) => {
            const file = new File([blob], cropModalFile.name, { type: cropModalFile.type || 'image/jpeg' });
            if (cropTarget === 'ad') {
              setAdFile(file);
            } else if (cropTarget === 'calendar') {
              setCalendarFile(file);
            }
            setCropModalFile(null);
            setCropTarget(null);
          }}
        />
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    color: '#0f172a'
  },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderBottom: '1px solid #f1f5f9',
    position: 'sticky' as const,
    top: 0,
    zIndex: 10
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  logoIcon: {
    fontSize: '28px',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  title: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 800,
    letterSpacing: '-0.5px',
    background: 'linear-gradient(90deg, #0f172a 0%, #334155 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  main: {
    padding: '48px 24px',
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '48px'
  },
  section: {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '24px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)',
    border: '1px solid #f8fafc'
  },
  sectionHeader: {
    marginBottom: '32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  sectionTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 700,
    color: '#0f172a',
    letterSpacing: '-0.5px'
  },
  sectionSubtitle: {
    margin: '8px 0 0 0',
    fontSize: '15px',
    color: '#64748b',
    fontWeight: 400
  },
  formContainer: {
    display: 'flex',
    gap: '20px',
    marginBottom: '40px',
    alignItems: 'stretch',
    flexWrap: 'wrap' as const,
  },
  selectInput: {
    padding: '0 24px',
    borderRadius: '16px',
    border: '2px solid #e2e8f0',
    fontSize: '16px',
    fontWeight: 500,
    fontFamily: 'inherit',
    color: '#0f172a',
    backgroundColor: '#f8fafc',
    minWidth: '220px',
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none' as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 20px center',
    backgroundSize: '20px',
    transition: 'all 0.2s'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '28px'
  },
  gridImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    display: 'block'
  },
  monthBadge: {
    position: 'absolute' as const,
    top: '16px',
    left: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    color: '#0f172a',
    padding: '8px 16px',
    borderRadius: '24px',
    fontSize: '13px',
    fontWeight: 700,
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
    zIndex: 2,
    backdropFilter: 'blur(8px)',
    letterSpacing: '0.2px'
  },
  loadingText: {
    color: '#64748b',
    fontSize: '16px',
    fontWeight: 500,
    gridColumn: '1 / -1',
    textAlign: 'center' as const,
    padding: '60px 0'
  },
  emptyState: {
    color: '#94a3b8',
    fontSize: '15px',
    fontWeight: 500,
    gridColumn: '1 / -1',
    textAlign: 'center' as const,
    padding: '60px 0',
    backgroundColor: '#f8fafc',
    borderRadius: '20px',
    border: '2px dashed #e2e8f0'
  }
};

export default AdminDashboard;
