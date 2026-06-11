import { Trash2, Edit2 } from 'lucide-react';
import StarRating from './StarRating';
import { useAuthStore } from '../../store/authStore';

export default function ReviewCard({ review, onDelete, onEdit }) {
  const { user } = useAuthStore();
  const isOwner = user?.username === review.user?.username;

  return (
    <div
      className="p-5 rounded-xl transition-all"
      style={{
        background: 'var(--color-card)',
        border: `1px solid ${isOwner ? 'var(--border-hover)' : 'var(--border-subtle)'}`,
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 0 20px rgba(212,160,83,0.05)';
        e.currentTarget.style.borderColor = 'var(--border-hover)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = isOwner ? 'var(--border-hover)' : 'var(--border-subtle)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--color-elevated)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-2)',
              fontFamily: 'var(--font-display)',
              fontSize: '14px',
            }}
          >
            {review.user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <p className="font-sans font-medium text-sm" style={{ color: 'var(--color-text-1)' }}>
              @{review.user?.username}
            </p>
            <p className="font-sans text-xs" style={{ color: 'var(--color-text-3)' }}>
              {new Date(review.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <StarRating rating={review.rating} readOnly size={14} />
      </div>

      <p className="font-sans text-sm" style={{ color: 'var(--color-text-2)', lineHeight: 1.6 }}>
        {review.comment}
      </p>

      {isOwner && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'flex-end' }}>
          <button
            onClick={() => onEdit(review)}
            className="cursor-pointer transition-colors"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-3)',
              padding: '4px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-amber)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-3)')}
            aria-label="Edit review"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(review.id)}
            className="cursor-pointer transition-colors"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-3)',
              padding: '4px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-error)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-3)')}
            aria-label="Delete review"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
