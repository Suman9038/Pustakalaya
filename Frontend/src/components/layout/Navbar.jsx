import { useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Upload, LogOut, User, BookOpen, ChevronDown, Shield } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { gsap } from '../../lib/gsap';
import api from '../../lib/api';
import { useToast } from '../ui/Toast';
import logoImg from '../../assets/274d338457f44fbfa52373f1aada2f20.png';

export default function Navbar({ onSearch }) {
  const navRef = useRef(null);
  const dropRef = useRef(null);
  const [dropOpen, setDropOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const { user, logout, isAdmin } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();

  // Scroll effect: transparent → glassmorphism
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const nav = navRef.current;
    if (!nav) return;

    const onScroll = () => {
      if (window.scrollY > 60) {
        nav.style.background = 'var(--color-glass)';
        nav.style.backdropFilter = 'blur(24px)';
        nav.style.webkitBackdropFilter = 'blur(24px)';
        nav.style.borderBottom = '1px solid var(--border-subtle)';
        nav.style.boxShadow = '0 4px 30px rgba(0,0,0,0.3)';
      } else {
        nav.style.background = 'transparent';
        nav.style.backdropFilter = 'none';
        nav.style.webkitBackdropFilter = 'none';
        nav.style.borderBottom = '1px solid transparent';
        nav.style.boxShadow = 'none';
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Dropdown animation
  useEffect(() => {
    if (!dropRef.current) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (dropOpen) {
      if (!prefersReduced) {
        gsap.fromTo(
          dropRef.current,
          { opacity: 0, y: -8, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.25, ease: 'power2.out' }
        );
        const items = dropRef.current.querySelectorAll('.drop-item');
        gsap.fromTo(
          items,
          { opacity: 0, x: -8 },
          { opacity: 1, x: 0, duration: 0.2, stagger: 0.05, delay: 0.05, ease: 'power2.out' }
        );
      }
    }
  }, [dropOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('#avatar-menu')) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = async () => {
    try {
      await api.get('/auth/logout');
    } catch {}
    logout();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) navigate(`/search?q=${encodeURIComponent(searchVal.trim())}`);
  };

  const initials = user
    ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() || user.username?.[0]?.toUpperCase()
    : 'U';

  return (
    <nav
      ref={navRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 500,
        transition: 'background 0.3s ease, backdrop-filter 0.3s ease, border-color 0.3s ease',
        background: 'transparent',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        {/* Logo */}
        <Link
          to="/dashboard"
          className="font-display text-xl shrink-0"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: 'var(--color-amber)',
            textDecoration: 'none',
            textShadow: '0 0 20px rgba(212,160,83,0.25)',
            letterSpacing: '-0.02em',
          }}
        >
          <img src={logoImg} alt="Pustakalaya Logo" style={{ width: '65px', height: '65px', objectFit: 'contain' }} />
          Pustakalaya
        </Link>

        {/* Conditional Search - Only for logged in users */}
        {user && (
          <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: '400px', margin: '0 auto' }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-3)',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="search"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                placeholder="Search books, authors..."
                aria-label="Search books"
                className="font-sans w-full text-sm"
                style={{
                  background: 'var(--color-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '9px 12px 9px 36px',
                  color: 'var(--color-text-1)',
                  outline: 'none',
                  transition: 'border-color var(--t-fast), box-shadow var(--t-fast)',
                  width: '100%',
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
          </form>
        )}

        {/* Right actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
          {!user ? (
            <>
              <Link
                to="/login"
                className="font-sans text-sm font-medium transition-colors"
                style={{
                  color: 'var(--color-text-1)',
                  textDecoration: 'none',
                  padding: '8px 16px',
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-amber)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-1)'}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="font-sans text-sm font-medium transition-all"
                style={{
                  background: 'var(--color-amber)',
                  color: 'var(--color-void)',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-amber-bright)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--color-amber)'}
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              {/* Upload button */}
              <Link
                to="/books/upload"
                className="font-sans text-sm font-medium cursor-pointer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--color-amber)',
                  color: 'var(--color-void)',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  minHeight: '44px',
                  transition: 'background var(--t-fast), box-shadow var(--t-fast)',
                  whiteSpace: 'nowrap',
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
                <Upload size={15} />
                <span className="hidden sm:inline">Upload</span>
              </Link>

              {/* Avatar + dropdown */}
              <div id="avatar-menu" style={{ position: 'relative' }}>
                <button
                  onClick={() => setDropOpen((v) => !v)}
                  aria-label="User menu"
                  aria-expanded={dropOpen}
                  aria-haspopup="true"
                  className="cursor-pointer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'var(--color-elevated)',
                      border: '2px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--color-amber)',
                      fontFamily: 'var(--font-display)',
                      fontSize: '14px',
                      fontWeight: 600,
                      transition: 'border-color var(--t-fast), box-shadow var(--t-fast)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-amber)';
                      e.currentTarget.style.boxShadow = '0 0 16px var(--color-amber-glow)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    {initials}
                  </div>
                  <ChevronDown
                    size={14}
                    style={{
                      color: 'var(--color-text-2)',
                      transition: 'transform var(--t-fast)',
                      transform: dropOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  />
                </button>

                {/* Dropdown */}
                {dropOpen && (
                  <div
                    ref={dropRef}
                    role="menu"
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 8px)',
                      right: 0,
                      minWidth: '180px',
                      background: 'var(--color-raised)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '12px',
                      padding: '8px',
                      boxShadow: 'var(--shadow-modal)',
                      zIndex: 600,
                    }}
                  >
                    <div
                      style={{
                        padding: '8px 12px 12px',
                        borderBottom: '1px solid var(--border-subtle)',
                        marginBottom: '6px',
                      }}
                    >
                      <p className="font-sans font-medium text-sm" style={{ color: 'var(--color-text-1)' }}>
                        {user?.first_name} {user?.last_name}
                      </p>
                      <p className="font-sans text-xs" style={{ color: 'var(--color-text-3)' }}>
                        @{user?.username}
                      </p>
                    </div>

                    {[
                      { to: '/profile', icon: User, label: 'Profile' },
                      { to: '/my-books', icon: BookOpen, label: 'My Books' },
                      ...(isAdmin() ? [{ to: '/admin', icon: Shield, label: 'Admin Panel' }] : []),
                    ].map(({ to, icon: Icon, label }) => (
                      <Link
                        key={to}
                        to={to}
                        role="menuitem"
                        onClick={() => setDropOpen(false)}
                        className="drop-item cursor-pointer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '9px 12px',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          color: 'var(--color-text-2)',
                          fontSize: '14px',
                          fontFamily: 'var(--font-sans)',
                          transition: 'background var(--t-fast), color var(--t-fast)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'var(--color-amber-ghost)';
                          e.currentTarget.style.color = 'var(--color-text-1)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.color = 'var(--color-text-2)';
                        }}
                      >
                        <Icon size={15} />
                        {label}
                      </Link>
                    ))}

                    <button
                      onClick={handleLogout}
                      role="menuitem"
                      className="drop-item cursor-pointer w-full"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '9px 12px',
                        borderRadius: '8px',
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-error)',
                        fontSize: '14px',
                        fontFamily: 'var(--font-sans)',
                        width: '100%',
                        textAlign: 'left',
                        marginTop: '4px',
                        borderTop: '1px solid var(--border-subtle)',
                        paddingTop: '12px',
                        cursor: 'pointer',
                        transition: 'background var(--t-fast)',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(248,113,113,0.08)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >
                      <LogOut size={15} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
