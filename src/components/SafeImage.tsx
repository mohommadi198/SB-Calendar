import React, { useState } from 'react';
import { getSecureUrl } from '../services/firebaseService';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

/**
 * Senior-level Image component with:
 * - HTTPS enforcement
 * - Fallback handling
 * - Loading states
 * - Mobile responsiveness
 */
const SafeImage: React.FC<SafeImageProps> = ({ 
  src, 
  alt, 
  className, 
  fallback = "/logo192.png", 
  style,
  ...props 
}) => {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const secureSrc = getSecureUrl(src);

  const handleLoad = () => {
    setLoading(false);
    console.log(`[SafeImage] Loaded: ${secureSrc}`);
  };

  const handleError = () => {
    setError(true);
    setLoading(false);
    console.error(`[SafeImage] Failed to load: ${secureSrc}. Falling back.`);
  };

  return (
    <div style={{ 
      position: 'relative', 
      overflow: 'hidden', 
      width: '100%', 
      height: '100%',
      backgroundColor: '#f1f5f9', // Placeholder color
      ...style 
    }}>
      {loading && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
          zIndex: 1
        }}>
          <div className="spinner-mini"></div>
        </div>
      )}
      
      <img
        src={error ? fallback : secureSrc}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          transition: 'opacity 0.3s ease',
          opacity: loading ? 0 : 1,
        }}
        {...props}
      />
    </div>
  );
};

export default SafeImage;
