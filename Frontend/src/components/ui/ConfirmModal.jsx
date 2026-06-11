import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { gsap } from '../../lib/gsap';

export default function ConfirmModal({
  isOpen,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  danger = true,
}) {
  const overlayRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReduced) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 24, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'power3.out' }
      );
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9000,
        background: 'rgba(4,4,6,0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
      onClick={(e) => e.target === overlayRef.current && onCancel()}
    >
      <div
        ref={cardRef}
        style={{
          background: 'var(--color-raised)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '16px',
          padding: '32px',
          maxWidth: '420px',
          width: '100%',
          boxShadow: 'var(--shadow-modal)',
          position: 'relative',
        }}
      >
        <button
          onClick={onCancel}
          aria-label="Close dialog"
          className="cursor-pointer"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            color: 'var(--color-text-3)',
            background: 'none',
            border: 'none',
            transition: 'color var(--t-fast)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-2)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-3)')}
        >
          <X size={18} />
        </button>

        <h2
          id="modal-title"
          className="font-display text-xl mb-3"
          style={{ color: 'var(--color-text-1)' }}
        >
          {title}
        </h2>
        <p className="font-sans text-sm mb-8" style={{ color: 'var(--color-text-2)' }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            className="cursor-pointer font-sans text-sm px-4 py-2 rounded-lg transition-all"
            style={{
              background: 'transparent',
              border: '1px solid var(--border-subtle)',
              color: 'var(--color-text-2)',
              minHeight: '44px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-hover)';
              e.currentTarget.style.color = 'var(--color-text-1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.color = 'var(--color-text-2)';
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="cursor-pointer font-sans text-sm px-4 py-2 rounded-lg transition-all font-medium"
            style={{
              background: danger ? 'rgba(248,113,113,0.15)' : 'var(--color-amber-ghost)',
              border: `1px solid ${danger ? 'rgba(248,113,113,0.3)' : 'var(--border-hover)'}`,
              color: danger ? '#f87171' : 'var(--color-amber)',
              minHeight: '44px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = danger
                ? 'rgba(248,113,113,0.25)'
                : 'var(--color-amber-glow)';
              e.currentTarget.style.boxShadow = danger
                ? '0 0 20px rgba(248,113,113,0.2)'
                : 'var(--shadow-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = danger
                ? 'rgba(248,113,113,0.15)'
                : 'var(--color-amber-ghost)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
