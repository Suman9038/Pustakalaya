import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import BookCard from '../components/ui/BookCard';
import { SkeletonList } from '../components/ui/SkeletonLoader';
import EmptyState from '../components/ui/EmptyState';
import api from '../lib/api';
import { useToast } from '../components/ui/Toast';

export default function Dashboard() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q');
  const toast = useToast();

  useEffect(() => {
    fetchBooks();
  }, [q]);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const endpoint = q ? `/books/search?q=${encodeURIComponent(q)}` : '/books/';
      const res = await api.get(endpoint);
      setBooks(res.data);
    } catch (err) {
      toast.error('Failed to load books');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-display text-3xl text-[color:var(--color-text-1)]">
              {q ? `Search results for "${q}"` : 'Discover Books'}
            </h1>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <SkeletonList key={i} count={1} />
              ))}
            </div>
          ) : books.length === 0 ? (
            <EmptyState
              title={q ? 'No results found' : 'No books available'}
              message={q ? 'Try adjusting your search terms.' : 'Upload the first book to get started!'}
              action={() => window.location.href = '/books/upload'}
              actionLabel="Upload Book"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {books.map((book) => (
                <BookCard key={book.book_id} book={book} />
              ))}
            </div>
          )}
        </div>
      </main>
    </>
  );
}
