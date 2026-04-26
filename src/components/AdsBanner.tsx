import React, { useState, useEffect } from 'react';
import { fetchAdsImages, AdImage } from '../services/firebaseService';
import SafeImage from './SafeImage';

const AdsBanner: React.FC = () => {
  const [ads, setAds] = useState<AdImage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAds = async () => {
      try {
        const fetchedAds = await fetchAdsImages();
        const visibleAds = fetchedAds.filter(ad => ad.visible !== false);
        setAds(visibleAds);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadAds();
  }, []);

  useEffect(() => {
    if (ads.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [ads]);

  if (loading || ads.length === 0) return null;

  return (
    <div className="ads-banner-container">
      <div className="ad-badge">Ad</div>
      <a 
        href={ads[currentIndex].link || "#"} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="ad-slide"
        style={{ 
          textDecoration: 'none', 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          position: 'relative',
          backgroundColor: ads[currentIndex].url ? 'transparent' : '#f8fafc',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        {ads[currentIndex].url && <SafeImage src={ads[currentIndex].url} alt="Ad" className="ad-image" />}
        {ads[currentIndex].text && (
          <div style={{ 
            position: ads[currentIndex].url ? 'absolute' : 'relative', 
            bottom: ads[currentIndex].url ? 0 : 'auto', 
            width: '100%', 
            padding: '8px', 
            background: ads[currentIndex].url ? 'rgba(0,0,0,0.6)' : 'transparent', 
            color: ads[currentIndex].url ? 'white' : '#0f172a', 
            textAlign: 'center', 
            fontSize: '15px', 
            fontWeight: 700 
          }}>
            {ads[currentIndex].text}
          </div>
        )}
      </a>
    </div>
  );
};

export default AdsBanner;
