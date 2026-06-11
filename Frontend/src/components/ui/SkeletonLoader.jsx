// Skeleton loader — grain shimmer placeholders
export function SkeletonCard() {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: 'var(--color-card)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div className="skeleton h-4 w-16 rounded mb-4" />
      <div className="skeleton h-6 w-3/4 rounded mb-2" />
      <div className="skeleton h-4 w-1/2 rounded mb-6" />
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <div className="skeleton h-5 w-12 rounded-full" />
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-5 w-20 rounded-full" />
      </div>
      <div className="skeleton h-4 w-2/3 rounded" />
    </div>
  );
}

export function SkeletonList({ count = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl p-4"
          style={{ background: 'var(--color-card)', border: '1px solid var(--border-subtle)' }}
        >
          <div className="skeleton h-4 w-3/4 rounded mb-2" />
          <div className="skeleton h-3 w-1/2 rounded" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonText({ lines = 3 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="skeleton h-4 rounded"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}
