import React, { useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperModalProps {
  imageFile: File;
  onClose: () => void;
  onCropComplete: (croppedBlob: Blob) => void;
  aspect?: number; // Optional aspect ratio (e.g. 16/9)
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

const ImageCropperModal: React.FC<ImageCropperModalProps> = ({ imageFile, onClose, onCropComplete, aspect }) => {
  const [imgSrc, setImgSrc] = useState<string>('');
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isProcessing, setIsProcessing] = useState(false);

  React.useEffect(() => {
    const reader = new FileReader();
    reader.addEventListener('load', () => setImgSrc(reader.result?.toString() || ''));
    reader.readAsDataURL(imageFile);
  }, [imageFile]);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    const currentAspect = aspect || (width / height);
    
    const initialCrop = centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        currentAspect,
        width,
        height,
      ),
      width,
      height,
    );
    
    setCrop(initialCrop);
    
    // Pre-calculate pixel crop so the user can immediately hit "Apply" without dragging
    const pixelWidth = (initialCrop.width / 100) * width;
    const pixelHeight = (initialCrop.height / 100) * height;
    const pixelX = (initialCrop.x / 100) * width;
    const pixelY = (initialCrop.y / 100) * height;
    
    setCompletedCrop({
      unit: 'px',
      width: pixelWidth,
      height: pixelHeight,
      x: pixelX,
      y: pixelY
    });
  }

  const handleComplete = async () => {
    if (!completedCrop || !imgRef.current) return;
    setIsProcessing(true);

    try {
      const image = imgRef.current;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('No 2d context');
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      const pixelRatio = window.devicePixelRatio || 1;

      canvas.width = Math.floor(completedCrop.width * scaleX * pixelRatio);
      canvas.height = Math.floor(completedCrop.height * scaleY * pixelRatio);

      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingQuality = 'high';

      const cropX = completedCrop.x * scaleX;
      const cropY = completedCrop.y * scaleY;

      const cropWidth = completedCrop.width * scaleX;
      const cropHeight = completedCrop.height * scaleY;

      ctx.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
        0,
        0,
        cropWidth,
        cropHeight,
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            console.error('Canvas is empty');
            setIsProcessing(false);
            return;
          }
          onCropComplete(blob);
          setIsProcessing(false);
        },
        imageFile.type || 'image/jpeg',
        0.95
      );
    } catch (e) {
      console.error(e);
      setIsProcessing(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <h3 style={{ margin: 0 }}>Crop Image</h3>
          <button style={styles.closeBtn} onClick={onClose}>&times;</button>
        </div>
        
        <div style={styles.cropContainer}>
          {!!imgSrc && (
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imgSrc}
                onLoad={onImageLoad}
                style={{ maxHeight: '60vh', maxWidth: '100%', objectFit: 'contain' }}
              />
            </ReactCrop>
          )}
        </div>

        <div style={styles.footer}>
          <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={styles.saveBtn} onClick={handleComplete} disabled={isProcessing || !completedCrop?.width}>
            {isProcessing ? 'Processing...' : 'Apply Crop'}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px'
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '600px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column' as const,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  header: {
    padding: '16px 24px',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '28px',
    lineHeight: '1',
    cursor: 'pointer',
    color: '#64748b'
  },
  cropContainer: {
    padding: '20px',
    display: 'flex',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    minHeight: '300px'
  },
  footer: {
    padding: '16px 24px',
    borderTop: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    backgroundColor: '#f8fafc'
  },
  cancelBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    backgroundColor: '#fff',
    color: '#475569',
    fontWeight: 600,
    cursor: 'pointer'
  },
  saveBtn: {
    padding: '10px 24px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#10b981',
    color: '#fff',
    fontWeight: 600,
    cursor: 'pointer'
  }
};

export default ImageCropperModal;
