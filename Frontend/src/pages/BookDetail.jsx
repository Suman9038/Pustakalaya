import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, FileText, Download, MessageSquare, Edit2, Trash2 } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Badge, { FileTypeBadge } from '../components/ui/Badge';
import ReviewCard from '../components/ui/ReviewCard';
import StarRating from '../components/ui/StarRating';
import ConfirmModal from '../components/ui/ConfirmModal';
import { SkeletonText } from '../components/ui/SkeletonLoader';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../components/ui/Toast';

export default function BookDetail() {
  const { bookId } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const { user, isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    fetchBook();
  }, [bookId]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/books/${bookId}`);
      setBook(res.data);
    } catch (err) {
      toast.error('Failed to load book details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/books/${bookId}/delete`);
      toast.success('Book deleted successfully');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to delete book');
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (reviewRating === 0) {
      toast.warning('Please select a rating');
      return;
    }
    try {
      setSubmittingReview(true);
      await api.post(`/books/reviews/${bookId}/add-review`, {
        rating: reviewRating,
        comment: reviewText
      });
      toast.success('Review added');
      setReviewText('');
      setReviewRating(0);
      fetchBook();
    } catch (err) {
      toast.error('Failed to add review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const deleteReview = async (reviewId) => {
    try {
      await api.delete(`/books/reviews/${reviewId}/delete-review`);
      toast.success('Review deleted');
      fetchBook();
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-12 px-6 max-w-5xl mx-auto">
          <SkeletonText lines={10} />
        </main>
      </>
    );
  }

  if (!book) return null;

  const isOwnerOrAdmin = user?.id === book.user_id || isAdmin();

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-12 px-6">
        <div className="max-w-5xl mx-auto">
          
          {/* Hero Band */}
          <div className="rounded-2xl p-8 mb-10 relative overflow-hidden" style={{ background: 'var(--color-card)', border: '1px solid var(--border-subtle)' }}>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%221%22/%3E%3C/svg%3E')] opacity-5 mix-blend-overlay pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">
              <div>
                <div className="flex gap-3 items-center mb-4">
                  <FileTypeBadge mimeType={book.mime_type} fileName={book.file_name} />
                  <span className="font-sans text-sm text-[color:var(--color-text-3)] flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(book.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h1 className="font-display text-4xl mb-2 text-[color:var(--color-text-1)]">{book.title}</h1>
                <p className="font-sans text-lg text-[color:var(--color-text-2)] mb-6">by {book.author}</p>
                
                <div className="flex flex-wrap gap-4 items-center">
                  {book.language && <Badge variant="muted">{book.language}</Badge>}
                  {book.number_of_pages && <Badge variant="muted">{book.number_of_pages} Pages</Badge>}
                  <Badge variant="muted">{(book.file_size / (1024 * 1024)).toFixed(2)} MB</Badge>
                  <span className="font-sans text-sm text-[color:var(--color-text-3)]">
                    Uploaded by @{book.uploaded_by}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto shrink-0">
                <Link
                  to={`/books/${bookId}/chat`}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-sans font-medium transition-all"
                  style={{ background: 'var(--color-amber)', color: 'var(--color-void)' }}
                >
                  <MessageSquare size={18} /> Chat with Book
                </Link>
                <a
                  href={`http://localhost:8000/books/${bookId}/view`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-sans font-medium transition-all"
                  style={{ background: 'var(--color-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--color-text-1)' }}
                >
                  <Download size={18} /> Download
                </a>
                
                {isOwnerOrAdmin && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDeleteModalOpen(true)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-sans text-sm font-medium transition-all"
                      style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }}
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Col: Description & Extracted Text Sample */}
            <div className="lg:col-span-2 space-y-8">
              <section>
                <h2 className="font-display text-2xl mb-4 text-[color:var(--color-text-1)]">Description</h2>
                <div className="p-6 rounded-xl font-sans text-sm leading-relaxed" style={{ background: 'var(--color-card)', border: '1px solid var(--border-subtle)', color: 'var(--color-text-2)' }}>
                  {book.description || 'No description available for this book.'}
                </div>
              </section>

              <section>
                <h2 className="font-display text-2xl mb-4 text-[color:var(--color-text-1)] flex items-center gap-2">
                  <FileText size={24} className="text-[color:var(--color-amber)]" /> Text Preview
                </h2>
                <div className="p-6 rounded-xl font-sans text-sm leading-relaxed max-h-96 overflow-y-auto" style={{ background: 'var(--color-base)', border: '1px solid var(--border-subtle)', color: 'var(--color-text-3)' }}>
                  {book.text_content ? book.text_content.substring(0, 2000) + '...' : 'Text content not available.'}
                </div>
              </section>
            </div>

            {/* Right Col: Reviews */}
            <div className="space-y-6">
              <h2 className="font-display text-2xl mb-4 text-[color:var(--color-text-1)]">Reviews ({book.reviews?.length || 0})</h2>
              
              <form onSubmit={submitReview} className="p-5 rounded-xl space-y-4" style={{ background: 'var(--color-card)', border: '1px solid var(--border-hover)' }}>
                <h3 className="font-sans font-medium text-[color:var(--color-text-1)]">Add a Review</h3>
                <StarRating rating={reviewRating} onChange={setReviewRating} size={24} />
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="What did you think of this book?"
                  required
                  rows={3}
                  className="w-full font-sans text-sm transition-all outline-none rounded-lg resize-none"
                  style={{ background: 'var(--color-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--color-text-1)', padding: '12px' }}
                  onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-amber)'}
                  onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                />
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="w-full font-sans text-sm font-medium py-2.5 rounded-lg transition-all"
                  style={{ background: 'var(--color-amber-ghost)', color: 'var(--color-amber)' }}
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>

              <div className="space-y-4">
                {book.reviews?.length > 0 ? (
                  book.reviews.map(review => (
                    <ReviewCard key={review.id} review={review} onDelete={deleteReview} />
                  ))
                ) : (
                  <p className="font-sans text-sm text-[color:var(--color-text-3)] text-center py-8">
                    No reviews yet. Be the first!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Delete Book"
        message={`Are you sure you want to delete "${book.title}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </>
  );
}
