import { CheckCircle2, BrainCircuit, AlertTriangle, X } from 'lucide-react';

export default function UploadProgress({
  isOpen,
  bookTitle = '',
  percent = 10,
  message = 'Generating embeddings...',
  completed = false,
  error = null,
  onClose,
}) {
  if (!isOpen) return null;

  const isError = !!error;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(4, 4, 6, 0.82)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '440px',
          background: 'var(--color-raised)',
          border: isError ? '1px solid rgba(248, 113, 113, 0.3)' : '1px solid var(--border-hover)',
          borderRadius: '24px',
          padding: '36px 32px',
          boxShadow: 'var(--shadow-modal), 0 0 50px rgba(212, 160, 83, 0.08)',
          textAlign: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Amber glow accent in background */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '-50px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '220px',
            height: '140px',
            background: isError
              ? 'radial-gradient(circle, rgba(248, 113, 113, 0.25) 0%, transparent 70%)'
              : 'radial-gradient(circle, var(--color-amber-flare) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Close Button on Error */}
        {isError && onClose && (
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="cursor-pointer"
            style={{
              position: 'absolute',
              top: '18px',
              right: '18px',
              color: 'var(--color-text-3)',
              background: 'none',
              border: 'none',
              transition: 'color var(--t-fast)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-text-1)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-3)')}
          >
            <X size={20} />
          </button>
        )}

        {/* Central Icon */}
        <div
          style={{
            width: '68px',
            height: '68px',
            margin: '0 auto 20px auto',
            borderRadius: '22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: isError
              ? 'rgba(248, 113, 113, 0.15)'
              : (completed ? 'var(--color-amber-glow)' : 'var(--color-amber-ghost)'),
            border: `1px solid ${isError ? 'rgba(248, 113, 113, 0.35)' : 'var(--border-hover)'}`,
            color: isError ? 'var(--color-error)' : 'var(--color-amber)',
            boxShadow: isError ? 'none' : '0 8px 30px rgba(212, 160, 83, 0.18)',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {isError ? (
            <AlertTriangle size={32} />
          ) : completed ? (
            <CheckCircle2 size={36} style={{ color: 'var(--color-amber-bright)' }} />
          ) : (
            <div className="relative flex items-center justify-center">
              <BrainCircuit size={32} />
              <span
                style={{
                  position: 'absolute',
                  top: '-3px',
                  right: '-3px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'var(--color-amber)',
                }}
                className="animate-ping"
              />
            </div>
          )}
        </div>

        {/* Title & Subtitle */}
        <h2
          className="font-display text-2xl font-semibold mb-1"
          style={{ color: 'var(--color-text-1)', letterSpacing: '-0.01em' }}
        >
          {isError ? 'Embedding Error' : completed ? 'Embedding Complete!' : 'Generating Embeddings...'}
        </h2>

        {bookTitle && (
          <p className="font-sans text-xs mb-6 truncate" style={{ color: 'var(--color-text-3)' }}>
            "{bookTitle}"
          </p>
        )}

        {/* Progress Bar Container */}
        <div style={{ marginTop: bookTitle ? '0px' : '16px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span className="font-sans text-xs" style={{ color: 'var(--color-text-3)' }}>
              Live Vector Progress
            </span>
            <span className="font-mono text-sm font-bold" style={{ color: 'var(--color-amber-bright)' }}>
              {isError ? '0%' : `${percent}%`}
            </span>
          </div>

          <div
            style={{
              width: '100%',
              height: '8px',
              borderRadius: '999px',
              background: 'var(--color-base)',
              overflow: 'hidden',
              position: 'relative',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                height: '100%',
                width: isError ? '0%' : `${percent}%`,
                background: isError
                  ? 'var(--color-error)'
                  : 'linear-gradient(90deg, var(--color-amber-dim), var(--color-amber-bright))',
                borderRadius: '999px',
                boxShadow: isError ? 'none' : '0 0 14px rgba(212, 160, 83, 0.45)',
                transition: 'width 350ms cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
          </div>
        </div>

        {/* Dynamic Live Status Message */}
        <p
          className="font-sans text-xs font-medium"
          style={{
            color: isError ? 'var(--color-error)' : 'var(--color-text-2)',
            minHeight: '20px',
          }}
        >
          {message}
        </p>

        {/* Error Close Button */}
        {isError && onClose && (
          <div style={{ marginTop: '20px' }}>
            <button
              onClick={onClose}
              className="font-sans text-sm font-medium px-5 py-2.5 rounded-xl cursor-pointer"
              style={{
                background: 'rgba(248, 113, 113, 0.15)',
                border: '1px solid rgba(248, 113, 113, 0.3)',
                color: '#f87171',
                transition: 'all var(--t-fast)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(248, 113, 113, 0.25)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(248, 113, 113, 0.15)')}
            >
              Close & Retry
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
