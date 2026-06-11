import { useState, useEffect, useRef } from 'react';
import { BookOpen, Search } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import Navbar from '../components/layout/Navbar';
import BookCard from '../components/ui/BookCard';
import { SkeletonList } from '../components/ui/SkeletonLoader';
import EmptyState from '../components/ui/EmptyState';
import api from '../lib/api';
import { gsap } from '../lib/gsap';
import { Link } from 'react-router-dom';

export default function MyBooks() {
  const { user } = useAuthStore();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchVal, setSearchVal] = useState('');
  
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchMyBooks = async () => {
      try {
        if (!user?.id) return;
        const res = await api.get(`/books/user/${user.id}`);
        setBooks(res.data);
      } catch (err) {
        // Handle 404 cleanly as "no books found" instead of a hard error
        if (err.response?.status === 404) {
           setBooks([]);
        } else {
           console.error('Failed to fetch user books:', err);
           setError('Failed to load your books.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchMyBooks();
  }, [user?.id]);

  useEffect(() => {
    if (!loading && books.length > 0 && containerRef.current) {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReduced) {
        gsap.fromTo(
          '.book-item',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
        );
      }
    }
  }, [loading, books]);

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchVal.toLowerCase()) || 
    b.author.toLowerCase().includes(searchVal.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-12 px-6" ref={containerRef}>
        <div className="max-w-7xl mx-auto space-y-8">
          
          <header style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 className="font-display text-4xl mb-2" style={{ color: 'var(--color-text-1)', textShadow: '0 0 30px rgba(212,160,83,0.1)' }}>
                My Library
              </h1>
              <p className="font-sans text-sm" style={{ color: 'var(--color-text-3)' }}>
                Manage all the books and documents you have uploaded to Pustakalaya.
              </p>
            </div>

            {books.length > 0 && (
              <div style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-3)' }} />
                <input
                  type="text"
                  placeholder="Filter your books..."
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  className="font-sans text-sm"
                  style={{
                    width: '100%',
                    background: 'var(--color-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '10px 12px 10px 36px',
                    color: 'var(--color-text-1)',
                    outline: 'none',
                    transition: 'border-color var(--t-fast), box-shadow var(--t-fast)'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = 'var(--color-amber)';
                    e.target.style.boxShadow = '0 0 0 2px var(--color-amber-ghost)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'var(--border-subtle)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
            )}
          </header>

          {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-64 rounded-2xl" style={{ background: 'var(--color-card)', border: '1px solid var(--border-subtle)' }} />
                ))}
             </div>
          ) : error ? (
             <EmptyState icon={BookOpen} title="Error" message={error} />
          ) : books.length === 0 ? (
             <div style={{ padding: '60px 20px', textAlign: 'center', background: 'var(--color-card)', border: '1px dashed var(--border-subtle)', borderRadius: '20px' }}>
                <div style={{ display: 'inline-flex', padding: '20px', background: 'var(--color-elevated)', borderRadius: '50%', marginBottom: '20px' }}>
                  <BookOpen size={40} color="var(--color-amber)" />
                </div>
                <h2 className="font-display text-2xl mb-2" style={{ color: 'var(--color-text-1)' }}>Your Library is Empty</h2>
                <p className="font-sans text-sm mb-6 max-w-md mx-auto" style={{ color: 'var(--color-text-3)' }}>
                  You haven't uploaded any books or documents yet. Start building your personal knowledge base today.
                </p>
                <Link
                  to="/books/upload"
                  className="font-sans text-sm font-medium inline-flex items-center gap-2"
                  style={{
                    background: 'var(--color-amber)',
                    color: 'var(--color-void)',
                    padding: '10px 24px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    transition: 'background var(--t-fast), box-shadow var(--t-fast)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--color-amber-bright)';
                    e.currentTarget.style.boxShadow = '0 0 24px var(--color-amber-glow)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--color-amber)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  Upload Your First Book
                </Link>
             </div>
          ) : filteredBooks.length === 0 ? (
             <p className="text-center py-12 text-[color:var(--color-text-3)]">No books match your filter.</p>
          ) : (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredBooks.map((book) => (
                  <div key={book.book_id} className="book-item">
                    <BookCard book={book} />
                  </div>
                ))}
             </div>
          )}

        </div>
      </main>
    </>
  );
}
