import { useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Star, MessageSquare, BookOpen, Calendar } from 'lucide-react';
import { gsap } from '../../lib/gsap';
import Badge, { FileTypeBadge } from '../ui/Badge';

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return date.toLocaleDateString();
}

function formatFileSize(bytes) {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function avgRating(reviews) {
  if (!reviews?.length) return null;
  return (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
}

export default function BookCard({ book }) {
  const cardRef = useRef(null);
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const handleMouseMove = useCallback(
    (e) => {
      if (prefersReduced || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const rotX = ((e.clientY - cy) / (rect.height / 2)) * -6;
      const rotY = ((e.clientX - cx) / (rect.width / 2)) * 6;

      gsap.to(cardRef.current, {
        rotateX: rotX,
        rotateY: rotY,
        transformPerspective: 900,
        transformOrigin: 'center center',
        translateZ: 16,
        translateY: -5,
        duration: 0.28,
        ease: 'power2.out',
      });
    },
    [prefersReduced]
  );

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      translateZ: 0,
      translateY: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.75)',
    });
    cardRef.current.style.borderColor = 'var(--border-subtle)';
    cardRef.current.style.boxShadow = 'var(--shadow-card)';
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (!cardRef.current) return;
    cardRef.current.style.borderColor = 'var(--border-hover)';
    cardRef.current.style.boxShadow = 'var(--shadow-hover)';
  }, []);

  const rating = avgRating(book.reviews);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{
        background: 'var(--color-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '14px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: 'var(--shadow-card)',
        transition: 'border-color var(--t-smooth), box-shadow var(--t-smooth)',
        cursor: 'pointer',
        willChange: 'transform',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Grain overlay on card */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E\")",
          backgroundSize: '160px 160px',
          opacity: 0.05,
          borderRadius: '14px',
          pointerEvents: 'none',
        }}
      />

      {/* File type badge + date row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <FileTypeBadge mimeType={book.mime_type} fileName={book.file_name} />
        <span
          className="font-sans text-xs flex items-center gap-1"
          style={{ color: 'var(--color-text-3)' }}
        >
          <Calendar size={11} />
          {formatDate(book.created_at)}
        </span>
      </div>

      {/* Title + Author */}
      <div>
        <h3
          className="font-display text-lg leading-snug mb-1"
          style={{
            color: 'var(--color-text-1)',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {book.title}
        </h3>
        <p className="font-sans text-sm" style={{ color: 'var(--color-text-2)' }}>
          {book.author}
        </p>
      </div>

      {/* Meta chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
        {book.language && <Badge variant="muted">{book.language}</Badge>}
        {book.number_of_pages && (
          <span className="font-sans text-xs" style={{ color: 'var(--color-text-3)' }}>
            {book.number_of_pages} pages
          </span>
        )}
        {book.file_size && (
          <span className="font-sans text-xs" style={{ color: 'var(--color-text-3)' }}>
            {formatFileSize(book.file_size)}
          </span>
        )}
      </div>

      {/* Rating + uploader */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {rating ? (
            <>
              <Star size={14} fill="var(--color-amber)" color="var(--color-amber)" />
              <span className="font-sans text-sm font-medium" style={{ color: 'var(--color-amber)' }}>
                {rating}
              </span>
              <span className="font-sans text-xs" style={{ color: 'var(--color-text-3)' }}>
                ({book.reviews?.length})
              </span>
            </>
          ) : (
            <span className="font-sans text-xs" style={{ color: 'var(--color-text-3)' }}>
              No reviews yet
            </span>
          )}
        </div>
        {book.uploaded_by && (
          <span className="font-sans text-xs" style={{ color: 'var(--color-text-3)' }}>
            by @{book.uploaded_by}
          </span>
        )}
      </div>

      {/* Action row */}
      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
        <Link
          to={`/books/${book.book_id}`}
          onClick={(e) => e.stopPropagation()}
          className="font-sans text-xs font-medium cursor-pointer flex-1"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            padding: '8px 12px',
            borderRadius: '8px',
            textDecoration: 'none',
            background: 'var(--color-elevated)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--color-text-2)',
            transition: 'background var(--t-fast), color var(--t-fast)',
            minHeight: '36px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-hover)';
            e.currentTarget.style.color = 'var(--color-text-1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--color-elevated)';
            e.currentTarget.style.color = 'var(--color-text-2)';
          }}
        >
          <BookOpen size={13} />
          Details
        </Link>

        <Link
          to={`/books/${book.book_id}/chat`}
          onClick={(e) => e.stopPropagation()}
          className="font-sans text-xs font-medium cursor-pointer"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            padding: '8px 14px',
            borderRadius: '8px',
            textDecoration: 'none',
            background: 'var(--color-amber-ghost)',
            border: '1px solid var(--border-hover)',
            color: 'var(--color-amber)',
            transition: 'background var(--t-fast), box-shadow var(--t-fast)',
            minHeight: '36px',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-amber-glow)';
            e.currentTarget.style.boxShadow = '0 0 16px var(--color-amber-ghost)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--color-amber-ghost)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <MessageSquare size={13} />
          Chat
        </Link>
      </div>
    </div>
  );
}
