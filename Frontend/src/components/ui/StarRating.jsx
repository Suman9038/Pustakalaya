import { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, onChange, readOnly = false, size = 18 }) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
      onMouseLeave={() => !readOnly && setHoverRating(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = (hoverRating || rating) >= star;
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onChange?.(star)}
            onMouseEnter={() => !readOnly && setHoverRating(star)}
            style={{
              background: 'none',
              border: 'none',
              cursor: readOnly ? 'default' : 'pointer',
              padding: '2px',
              color: isFilled ? 'var(--color-amber)' : 'var(--color-text-3)',
              transition: 'color var(--t-fast), transform var(--t-fast)',
              transform: isFilled && !readOnly ? 'scale(1.1)' : 'scale(1)',
            }}
            aria-label={`Rate ${star} stars`}
          >
            <Star
              size={size}
              fill={isFilled ? 'currentColor' : 'none'}
              style={{
                filter: isFilled ? 'drop-shadow(0 0 6px rgba(212,160,83,0.3))' : 'none',
              }}
            />
          </button>
        );
      })}
    </div>
  );
}
