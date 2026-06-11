// EmptyState — reusable empty state with icon, message, and CTA
import { BookOpen } from 'lucide-react';

export default function EmptyState({
  icon: Icon = BookOpen,
  title = 'Nothing here yet',
  message = '',
  action,
  actionLabel,
}) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center py-20 px-6"
      style={{ minHeight: '300px' }}
    >
      <div
        className="mb-6 p-5 rounded-2xl"
        style={{
          background: 'var(--color-card)',
          border: '1px solid var(--border-subtle)',
          color: 'var(--color-text-3)',
        }}
      >
        <Icon size={40} strokeWidth={1.2} />
      </div>
      <h3
        className="font-display text-2xl mb-3"
        style={{ color: 'var(--color-text-1)' }}
      >
        {title}
      </h3>
      {message && (
        <p className="font-sans text-sm mb-8 max-w-sm" style={{ color: 'var(--color-text-2)' }}>
          {message}
        </p>
      )}
      {action && (
        <button
          onClick={action}
          className="cursor-pointer font-sans font-medium text-sm px-6 py-3 rounded-lg transition-all"
          style={{
            background: 'var(--color-amber)',
            color: 'var(--color-void)',
            border: 'none',
            minHeight: '44px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-amber-bright)';
            e.currentTarget.style.boxShadow = '0 0 30px var(--color-amber-glow)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--color-amber)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
