import ShadowWaveBackground from '../ui/ShadowWaveBackground';
import { BookOpen, MessageSquare, Star } from 'lucide-react';

// Split-panel layout for Login / Signup pages
export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        background: 'var(--color-void)',
      }}
      className="auth-layout"
    >
      {/* Left decorative panel */}
      <div
        className="hidden lg:flex"
        style={{
          position: 'relative',
          background: 'var(--color-base)',
          overflow: 'hidden',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px',
          borderRight: '1px solid var(--border-subtle)',
        }}
      >
        <ShadowWaveBackground />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '380px' }}>
          <h1
            className="font-display text-5xl mb-6"
            style={{
              color: 'var(--color-amber)',
              textShadow: '0 0 40px rgba(212,160,83,0.3)',
              lineHeight: 1.15,
            }}
          >
            Pustakalaya
          </h1>
          <p className="font-sans text-base mb-10" style={{ color: 'var(--color-text-2)', lineHeight: 1.7 }}>
            Your AI-powered digital library. Upload any book, ask it anything.
          </p>
          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
            {[
              { icon: <BookOpen size={18} style={{ color: 'var(--color-amber)' }} />, text: 'Upload PDF, DOCX, EPUB books' },
              { icon: <MessageSquare size={18} style={{ color: 'var(--color-amber)' }} />, text: 'Chat with any book using AI' },
              { icon: <Star size={18} style={{ color: 'var(--color-amber)' }} />, text: 'Review and discover books' },
            ].map((feat, i) => (
              <div
                key={i}
                className="font-sans text-sm flex items-center gap-3 text-[color:var(--color-text-1)] transition-all duration-300"
                style={{
                  background: 'rgba(212, 160, 83, 0.04)',
                  border: '1px solid rgba(212, 160, 83, 0.15)',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  backdropFilter: 'blur(8px)',
                  cursor: 'default',
                }}
                onMouseEnter={(e) => {
                   e.currentTarget.style.transform = 'translateY(-2px)';
                   e.currentTarget.style.boxShadow = '0 8px 25px rgba(212, 160, 83, 0.2)';
                   e.currentTarget.style.borderColor = 'rgba(212, 160, 83, 0.3)';
                }}
                onMouseLeave={(e) => {
                   e.currentTarget.style.transform = 'translateY(0)';
                   e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
                   e.currentTarget.style.borderColor = 'rgba(212, 160, 83, 0.15)';
                }}
              >
                {feat.icon}
                <span style={{ fontWeight: 500, letterSpacing: '0.2px' }}>{feat.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: form area */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 32px',
          overflowY: 'auto',
        }}
      >
        {/* Mobile logo */}
        <h1
          className="font-display text-3xl mb-2 lg:hidden"
          style={{ color: 'var(--color-amber)', textAlign: 'center' }}
        >
          Pustakalaya
        </h1>

        <div style={{ width: '100%', maxWidth: '400px' }}>
          {title && (
            <div style={{ marginBottom: '32px' }}>
              <h2 className="font-display text-3xl mb-2" style={{ color: 'var(--color-text-1)' }}>
                {title}
              </h2>
              {subtitle && (
                <p className="font-sans text-sm" style={{ color: 'var(--color-text-2)' }}>
                  {subtitle}
                </p>
              )}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}
