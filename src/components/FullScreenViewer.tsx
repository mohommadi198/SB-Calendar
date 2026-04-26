import React, { useEffect, useState, useRef } from 'react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from 'react-zoom-pan-pinch';
import { CalendarImage, getSecureUrl } from '../services/firebaseService';
import AdsBanner from './AdsBanner';

interface Props {
  selectedMonth: CalendarImage | null;
  allMonths: CalendarImage[];
  onMonthChange: (month: CalendarImage) => void;
  onClose: () => void;
}

const FullScreenViewer: React.FC<Props> = ({
  selectedMonth,
  allMonths,
  onMonthChange,
  onClose,
}) => {
  const transformWrapperRef = useRef<ReactZoomPanPinchRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const currentIndex = allMonths.findIndex(m => selectedMonth && m.id === selectedMonth.id);

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % allMonths.length;
    onMonthChange(allMonths[nextIndex]);
  };

  const handlePrev = () => {
    const prevIndex = (currentIndex - 1 + allMonths.length) % allMonths.length;
    onMonthChange(allMonths[prevIndex]);
  };

  // ── Swipe/Drag Detection (Native) ──────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onStart = (clientX: number, clientY: number) => {
      dragStart.current = { x: clientX, y: clientY };
    };

    const onEnd = (clientX: number, clientY: number) => {
      if (!dragStart.current || !transformWrapperRef.current) return;

      const scale = transformWrapperRef.current.state.scale;
      // Only navigate if zoomed out
      if (scale > 1.05) {
        dragStart.current = null;
        return;
      }

      const xDiff = dragStart.current.x - clientX;
      const yDiff = dragStart.current.y - clientY;
      const threshold = 55; // sensitivity

      if (Math.abs(xDiff) > threshold && Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0) handleNext();
        else handlePrev();
      }
      dragStart.current = null;
    };

    const handleTouchStart = (e: TouchEvent) => onStart(e.touches[0].clientX, e.touches[0].clientY);
    const handleTouchEnd = (e: TouchEvent) => onEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    
    const handleMouseDown = (e: MouseEvent) => onStart(e.clientX, e.clientY);
    const handleMouseUp = (e: MouseEvent) => onEnd(e.clientX, e.clientY);

    // Using passive: true where possible, but capturing for priority
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mouseup', handleMouseUp);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mouseup', handleMouseUp);
    };
  }, [currentIndex, allMonths]); // Re-attach when data changes to have fresh indexes in closures

  // Keyboard navigation
  useEffect(() => {
    if (!selectedMonth) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMonth, currentIndex]);

  if (!selectedMonth) return null;

  return (
    <div ref={containerRef} style={{ ...S.overlay, display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes fsFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .fs-btn:hover { background: rgba(255,255,255,0.28) !important; }
        .fs-cal-img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          user-select: none;
          display: block;
        }
        @media (max-width: 600px) {
          .fs-cal-img { width: 100vw; height: auto; }
        }
      `}</style>

      {/* ── 1. FLOATING HEADER ────────────────────────────────────────── */}
      <div style={S.header}>
        <button className="fs-btn" style={S.iconBtn} onClick={onClose} aria-label="Back">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>

        <div style={S.headerCenter}>
          <h2 style={S.title}>{selectedMonth.month}</h2>
          {allMonths.length > 1 && (
            <span style={S.counter}>{currentIndex + 1} / {allMonths.length}</span>
          )}
        </div>

        {/* Navigation fallback for non-touch */}
        {allMonths.length > 1 && (
          <div style={S.navGroup}>
            <button className="fs-btn" style={S.iconBtn} onClick={handlePrev} aria-label="Previous">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
            <button className="fs-btn" style={S.iconBtn} onClick={handleNext} aria-label="Next">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          </div>
        )}
        {allMonths.length <= 1 && <div style={{ width: 40 }} />}
      </div>

      {/* ── 2. CALENDAR IMAGE AREA ────────────────────────────────────── */}
      <div style={S.calArea}>
        <TransformWrapper
          ref={transformWrapperRef}
          key={selectedMonth.id}
          initialScale={1}
          minScale={0.9}
          maxScale={8}
          centerOnInit
          wheel={{ step: 0.1 }}
          doubleClick={{ step: 0.7 }}
          pinch={{ step: 5 }}
        >
          {({ resetTransform }) => (
            <>
              <TransformComponent
                wrapperStyle={{ width: '100vw', height: '100vh' }}
                contentStyle={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <img
                  src={getSecureUrl(selectedMonth.image)}
                  alt={selectedMonth.month}
                  className="fs-cal-img"
                  draggable="false"
                />
              </TransformComponent>

              {/* Reset Control (Moved up to avoid Ad) */}
              <div style={{ position: 'absolute', bottom: 120, left: '50%', transform: 'translateX(-50%)' }}>
                <button className="install-btn" onClick={() => resetTransform()}>
                  Reset
                </button>
              </div>
            </>
          )}
        </TransformWrapper>
      </div>

      <AdsBanner />
    </div>
  );
};

const S: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: '#000',
    zIndex: 20000,
    animation: 'fsFadeIn 0.3s ease-out forwards',
    overflow: 'hidden',
    touchAction: 'none',
    display: 'flex',
    flexDirection: 'column',
  },

  // ── Header (Floating) ────────────────────────────────────────────────
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '75px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 16px',
    background: 'linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 70%, transparent 100%)',
    zIndex: 500,
    gap: '12px',
    pointerEvents: 'none',
  },
  headerCenter: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    pointerEvents: 'auto',
  },
  title: {
    margin: 0,
    fontSize: '18px',
    fontWeight: '700',
    color: '#fff',
    letterSpacing: '-0.3px',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
  },
  counter: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  navGroup: {
    display: 'flex',
    gap: '8px',
    pointerEvents: 'auto',
  },
  iconBtn: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(255,255,255,0.12)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'all 0.2s',
    backdropFilter: 'blur(10px)',
    pointerEvents: 'auto',
  },

  // ── Calendar image area ──────────────────────────────────────────────
  calArea: {
    width: '100%',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    position: 'relative',
  },

  // ── Zoom pill ────────────────────────────────────────────────────────
  zoomPill: {
    position: 'absolute',
    bottom: '32px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'rgba(0,0,0,0.6)',
    backdropFilter: 'blur(12px)',
    borderRadius: '24px',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.15)',
    zIndex: 10,
  },
  zoomBtn: {
    padding: '10px 20px',
    border: 'none',
    background: 'transparent',
    color: '#fff',
    fontSize: '13px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
};

export default FullScreenViewer;
