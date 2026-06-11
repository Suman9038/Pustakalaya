import { useEffect, useRef } from 'react';

// Amber radial gradient that follows the cursor — flashlight in a dark library
export default function CursorSpotlight() {
  const spotRef = useRef(null);

  useEffect(() => {
    const el = spotRef.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const handleMove = (e) => {
      el.style.left = `${e.clientX}px`;
      el.style.top = `${e.clientY}px`;
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMove);
  }, []);

  return (
    <div
      ref={spotRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        pointerEvents: 'none',
        zIndex: 1,
        width: '480px',
        height: '480px',
        transform: 'translate(-50%, -50%)',
        background:
          'radial-gradient(circle, rgba(212,160,83,0.09) 0%, transparent 70%)',
        transition: 'left 0.08s linear, top 0.08s linear',
        left: '-999px',
        top: '-999px',
      }}
    />
  );
}
