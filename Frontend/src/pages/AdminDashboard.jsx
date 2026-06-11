import { useState, useEffect, useRef } from 'react';
import { Users, BookOpen, MessageSquare, ListTodo, Star, TrendingUp, Calendar } from 'lucide-react';
import { gsap } from '../lib/gsap';
import api from '../lib/api';
import Navbar from '../components/layout/Navbar';
import { SkeletonList } from '../components/ui/SkeletonLoader';
import EmptyState from '../components/ui/EmptyState';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const containerRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/admin/dashboard/overview');
        setData(res.data);
      } catch (err) {
        console.error('Failed to fetch admin dashboard:', err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (!loading && data && containerRef.current) {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!prefersReduced) {
        gsap.fromTo(
          cardsRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
        );
        gsap.fromTo(
          '.dashboard-section',
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.5, delay: 0.2, stagger: 0.1, ease: 'power2.out' }
        );
      }
    }
  }, [loading, data]);

  const addToCardsRef = (el) => {
    if (el && !cardsRef.current.includes(el)) {
      cardsRef.current.push(el);
    }
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-12 px-6">
          <div className="max-w-7xl mx-auto space-y-8">
            <h1 className="font-display text-3xl" style={{ color: 'var(--color-text-1)' }}>Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-28 rounded-2xl" style={{ background: 'var(--color-card)', border: '1px solid var(--border-subtle)' }} />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <SkeletonList count={4} />
              <SkeletonList count={4} />
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen pt-24 pb-12 px-6">
          <EmptyState icon={TrendingUp} title="Failed to Load" message={error} />
        </main>
      </>
    );
  }

  const { stats, recent_users, recent_books, top_users, top_books } = data;

  const statCards = [
    { label: 'Total Users', value: stats.total_users, icon: Users, color: '#3b82f6' },
    { label: 'Total Books', value: stats.total_books, icon: BookOpen, color: '#10b981' },
    { label: 'Total Reviews', value: stats.total_reviews, icon: Star, color: '#f59e0b' },
    { label: 'Conversations', value: stats.total_conversations, icon: ListTodo, color: '#8b5cf6' },
    { label: 'Total Messages', value: stats.total_messages, icon: MessageSquare, color: '#ec4899' },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-12 px-6" ref={containerRef}>
        <div className="max-w-7xl mx-auto space-y-12">
          
          <header>
            <h1 className="font-display text-4xl mb-2" style={{ color: 'var(--color-text-1)', textShadow: '0 0 30px rgba(212,160,83,0.1)' }}>
              Admin Overview
            </h1>
            <p className="font-sans text-sm" style={{ color: 'var(--color-text-3)' }}>
              Monitor system activity, user engagement, and content metrics.
            </p>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {statCards.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div
                  key={i}
                  ref={addToCardsRef}
                  style={{
                    background: 'var(--color-card)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '16px',
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                  }}
                  className="hover:-translate-y-1 hover:shadow-xl"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ padding: '10px', borderRadius: '12px', background: `${stat.color}15` }}>
                      <Icon size={20} color={stat.color} />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-display text-3xl font-semibold" style={{ color: 'var(--color-text-1)' }}>
                      {stat.value.toLocaleString()}
                    </h3>
                    <p className="font-sans text-xs mt-1 font-medium" style={{ color: 'var(--color-text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {stat.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 dashboard-section">
            
            {/* Recent Users */}
            <div style={{ background: 'var(--color-card)', border: '1px solid var(--border-subtle)', borderRadius: '20px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="font-display text-xl" style={{ color: 'var(--color-text-1)' }}>Recent Users</h2>
                <Users size={18} color="var(--color-text-3)" />
              </div>
              {recent_users.length > 0 ? (
                <div className="space-y-4">
                  {recent_users.map(u => (
                    <div key={u.user_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div>
                        <p className="font-sans font-medium text-sm" style={{ color: 'var(--color-text-1)' }}>@{u.username}</p>
                        <p className="font-sans text-xs" style={{ color: 'var(--color-text-3)' }}>{u.email}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '10px', padding: '4px 8px', borderRadius: '6px', background: u.is_verified ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: u.is_verified ? '#10b981' : '#f59e0b' }}>
                          {u.is_verified ? 'Verified' : 'Pending'}
                        </span>
                        <p className="font-sans text-xs mt-1" style={{ color: 'var(--color-text-4)' }}>{formatDate(u.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[color:var(--color-text-3)]">No users found.</p>
              )}
            </div>

            {/* Recent Books */}
            <div style={{ background: 'var(--color-card)', border: '1px solid var(--border-subtle)', borderRadius: '20px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="font-display text-xl" style={{ color: 'var(--color-text-1)' }}>Recent Uploads</h2>
                <BookOpen size={18} color="var(--color-text-3)" />
              </div>
              {recent_books.length > 0 ? (
                <div className="space-y-4">
                  {recent_books.map(b => (
                    <div key={b.book_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                      <div>
                        <p className="font-sans font-medium text-sm line-clamp-1" style={{ color: 'var(--color-text-1)' }}>{b.title}</p>
                        <p className="font-sans text-xs line-clamp-1" style={{ color: 'var(--color-text-3)' }}>by {b.author}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p className="font-sans text-xs" style={{ color: 'var(--color-text-4)' }}>{formatDate(b.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[color:var(--color-text-3)]">No books found.</p>
              )}
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 dashboard-section">
            
            {/* Top Users */}
            <div style={{ background: 'var(--color-card)', border: '1px solid var(--border-subtle)', borderRadius: '20px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="font-display text-xl" style={{ color: 'var(--color-text-1)' }}>Most Active Users</h2>
                <MessageSquare size={18} color="var(--color-text-3)" />
              </div>
              {top_users.length > 0 ? (
                <div className="space-y-4">
                  {top_users.map((u, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'var(--color-amber)', fontWeight: 'bold' }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p className="font-sans font-medium text-sm" style={{ color: 'var(--color-text-1)' }}>@{u.username}</p>
                        <div style={{ width: '100%', height: '4px', background: 'var(--border-subtle)', borderRadius: '2px', marginTop: '6px' }}>
                          <div style={{ width: `${Math.min((u.message_count / (top_users[0].message_count || 1)) * 100, 100)}%`, height: '100%', background: 'var(--color-amber)', borderRadius: '2px' }} />
                        </div>
                      </div>
                      <span className="font-sans text-xs font-medium" style={{ color: 'var(--color-text-2)' }}>{u.message_count} msgs</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[color:var(--color-text-3)]">No activity data.</p>
              )}
            </div>

            {/* Top Books */}
            <div style={{ background: 'var(--color-card)', border: '1px solid var(--border-subtle)', borderRadius: '20px', padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="font-display text-xl" style={{ color: 'var(--color-text-1)' }}>Most Discussed Books</h2>
                <ListTodo size={18} color="var(--color-text-3)" />
              </div>
              {top_books.length > 0 ? (
                <div className="space-y-4">
                  {top_books.map((b, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                       <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'var(--color-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'var(--color-amber)', fontWeight: 'bold' }}>
                        {i + 1}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p className="font-sans font-medium text-sm line-clamp-1" style={{ color: 'var(--color-text-1)' }}>{b.title}</p>
                        <div style={{ width: '100%', height: '4px', background: 'var(--border-subtle)', borderRadius: '2px', marginTop: '6px' }}>
                          <div style={{ width: `${Math.min((b.conversation_count / (top_books[0].conversation_count || 1)) * 100, 100)}%`, height: '100%', background: '#10b981', borderRadius: '2px' }} />
                        </div>
                      </div>
                      <span className="font-sans text-xs font-medium" style={{ color: 'var(--color-text-2)' }}>{b.conversation_count} convos</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[color:var(--color-text-3)]">No conversation data.</p>
              )}
            </div>

          </div>

        </div>
      </main>
    </>
  );
}
