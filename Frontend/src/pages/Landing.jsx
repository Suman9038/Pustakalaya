import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Sparkles, MessageSquare, Star } from 'lucide-react';
import { gsap, ScrollTrigger } from '../lib/gsap';
import Navbar from '../components/layout/Navbar';
import CursorSpotlight from '../components/ui/CursorSpotlight';
import ShadowWaveBackground from '../components/ui/ShadowWaveBackground';
import { useAuthStore } from '../store/authStore';

export default function Landing() {
  const heroRef = useRef(null);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    // Hero Timeline
    const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.fromTo('.hero-eyebrow', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5 })
      .fromTo(
        '.hero-title',
        { opacity: 0, y: 40, skewY: 2 },
        { opacity: 1, y: 0, skewY: 0, duration: 0.9 },
        '-=0.2'
      )
      .fromTo('.hero-subtitle', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
      .fromTo('.hero-cta', { opacity: 0, y: 20, scale: 0.95 }, { opacity: 1, y: 0, scale: 1, duration: 0.5 }, '-=0.3')
      .fromTo('.hero-scroll-hint', { opacity: 0 }, { opacity: 1, duration: 0.4 }, '-=0.1');

    // Scroll Reveal for Features
    gsap.utils.toArray('.reveal-up').forEach((elem, i) => {
      gsap.fromTo(
        elem,
        { opacity: 0, y: 80, rotateX: -15, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: elem,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    // Parallax elements
    gsap.utils.toArray('.parallax').forEach(layer => {
      const speed = layer.getAttribute('data-speed') || 1;
      gsap.to(layer, {
        y: () => (ScrollTrigger.maxScroll(window) * speed * 0.1),
        ease: 'none',
        scrollTrigger: {
          trigger: 'body',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1
        }
      });
    });

    // Floating orbs
    gsap.to('.floating-orb', {
      y: 'random(-20, 20)',
      x: 'random(-20, 20)',
      rotation: 'random(-15, 15)',
      duration: 'random(3, 5)',
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      stagger: 0.2
    });
  }, []);

  const handleCardMouseMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    gsap.to(card, {
      rotateX,
      rotateY,
      duration: 0.5,
      ease: 'power2.out',
      transformPerspective: 1000
    });
  };

  const handleCardMouseLeave = (e) => {
    gsap.to(e.currentTarget, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.5,
      ease: 'power2.out'
    });
  };

  return (
    <>
      <Navbar />
      <CursorSpotlight />

      <main className="relative z-10">
        {/* HERO SECTION */}
        <section
          ref={heroRef}
          className="relative flex flex-col items-center justify-center min-h-screen text-center px-6 overflow-hidden"
          style={{ paddingTop: '80px' }}
        >
          <ShadowWaveBackground />
          
          {/* Floating Background Orbs */}
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full floating-orb mix-blend-screen pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.15) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(40px)' }} />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 rounded-full floating-orb mix-blend-screen pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.1) 0%, rgba(0,0,0,0) 70%)', filter: 'blur(60px)' }} />

          <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center parallax" data-speed="0.5">
            <span
              className="hero-eyebrow font-sans text-sm tracking-[0.2em] uppercase mb-6"
              style={{ color: 'var(--color-text-2)' }}
            >
              AI-Powered Digital Library
            </span>

            <h1
              className="hero-title font-display text-6xl md:text-7xl lg:text-8xl font-bold mb-6"
              style={{
                color: 'var(--color-text-1)',
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                textShadow: '0 10px 40px rgba(0,0,0,0.5)',
              }}
            >
              Your Books. Your AI.<br />
              <span className="text-amber-glow" style={{ color: 'var(--color-amber)' }}>One Library.</span>
            </h1>

            <p
              className="hero-subtitle font-sans text-lg md:text-xl max-w-2xl mx-auto mb-10"
              style={{ color: 'var(--color-text-2)', lineHeight: 1.6 }}
            >
              Upload any book. Ask it anything. Get answers powered by RAG AI.
              Experience the cinematic atmospheric digital library.
            </p>

            <div className="hero-cta flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <Link
                to={isAuthenticated ? '/dashboard' : '/signup'}
                className="font-sans font-medium text-base px-8 py-4 rounded-xl w-full sm:w-auto transition-all flex items-center justify-center gap-2"
                style={{
                  background: 'var(--color-amber)',
                  color: 'var(--color-void)',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-amber-bright)';
                  e.currentTarget.style.boxShadow = '0 0 40px var(--color-amber-glow)';
                  e.currentTarget.style.transform = 'scale(1.03)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--color-amber)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Get Started <ArrowRight size={18} />
              </Link>
              <a
                href="#features"
                className="font-sans font-medium text-base px-8 py-4 rounded-xl w-full sm:w-auto transition-all"
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-hover)',
                  color: 'var(--color-amber)',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--color-amber-ghost)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                See How It Works
              </a>
            </div>
          </div>

          {/* Scroll Hint */}
          <div
            className="hero-scroll-hint absolute bottom-10 left-1/2 -translate-x-1/2"
            style={{ animation: 'scroll-bounce 2s infinite' }}
          >
            <div
              style={{
                width: '1px',
                height: '40px',
                background: 'linear-gradient(to bottom, var(--color-amber), transparent)',
              }}
            />
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section id="features" className="py-24 px-6 relative z-10" style={{ background: 'var(--color-base)' }}>
          <div className="max-w-7xl mx-auto features-grid">
            <h2 className="font-display text-4xl mb-16 text-center reveal-up" style={{ color: 'var(--color-text-1)' }}>
              A New Way to Read and Research
            </h2>

            {/* Asymmetric Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Feature 1 - 5 cols */}
              <div
                className="reveal-up md:col-span-5 p-8 rounded-2xl relative overflow-hidden group"
                style={{ background: 'var(--color-card)', border: '1px solid var(--border-subtle)', transformStyle: 'preserve-3d' }}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%221%22/%3E%3C/svg%3E')] opacity-5 mix-blend-overlay pointer-events-none transition-opacity duration-500 group-hover:opacity-10" />
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110" style={{ background: 'var(--color-amber-ghost)', color: 'var(--color-amber)' }}>
                  <BookOpen size={28} />
                </div>
                <h3 className="font-display text-2xl mb-3" style={{ color: 'var(--color-text-1)' }}>Upload Any Book</h3>
                <p className="font-sans text-sm" style={{ color: 'var(--color-text-2)', lineHeight: 1.6 }}>
                  Support for PDF, EPUB, and DOCX formats. Your personal library, accessible anywhere, with full text extraction and indexing.
                </p>
              </div>

              {/* Feature 2 - 4 cols */}
              <div
                className="reveal-up md:col-span-4 p-8 rounded-2xl relative overflow-hidden group"
                style={{ background: 'var(--color-card)', border: '1px solid var(--border-subtle)', transformStyle: 'preserve-3d' }}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%221%22/%3E%3C/svg%3E')] opacity-5 mix-blend-overlay pointer-events-none transition-opacity duration-500 group-hover:opacity-10" />
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110" style={{ background: 'var(--color-amber-ghost)', color: 'var(--color-amber)' }}>
                  <MessageSquare size={28} />
                </div>
                <h3 className="font-display text-2xl mb-3" style={{ color: 'var(--color-text-1)' }}>Chat with AI</h3>
                <p className="font-sans text-sm" style={{ color: 'var(--color-text-2)', lineHeight: 1.6 }}>
                  Ask questions, get summaries, and explore concepts. The AI reads the book and provides cited answers in real-time.
                </p>
              </div>

              {/* Feature 3 - 3 cols */}
              <div
                className="reveal-up md:col-span-3 p-8 rounded-2xl relative overflow-hidden group"
                style={{ background: 'var(--color-card)', border: '1px solid var(--border-subtle)', transformStyle: 'preserve-3d' }}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%221%22/%3E%3C/svg%3E')] opacity-5 mix-blend-overlay pointer-events-none transition-opacity duration-500 group-hover:opacity-10" />
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110" style={{ background: 'var(--color-amber-ghost)', color: 'var(--color-amber)' }}>
                  <Star size={28} />
                </div>
                <h3 className="font-display text-2xl mb-3" style={{ color: 'var(--color-text-1)' }}>Review & Discover</h3>
                <p className="font-sans text-sm" style={{ color: 'var(--color-text-2)', lineHeight: 1.6 }}>
                  Rate books, write reviews, and see what others in the community are reading.
                </p>
              </div>

              {/* Feature 4 - Full Width for AI Insights */}
              <div
                className="reveal-up md:col-span-12 p-8 rounded-2xl relative overflow-hidden group flex flex-col md:flex-row items-start md:items-center gap-8 mt-4"
                style={{ background: 'linear-gradient(145deg, var(--color-card), rgba(212, 160, 83, 0.05))', border: '1px solid var(--border-subtle)', transformStyle: 'preserve-3d' }}
                onMouseMove={handleCardMouseMove}
                onMouseLeave={handleCardMouseLeave}
              >
                <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22 opacity=%221%22/%3E%3C/svg%3E')] opacity-5 mix-blend-overlay pointer-events-none transition-opacity duration-500 group-hover:opacity-10" />
                <div className="w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 shadow-[0_0_20px_rgba(245,158,11,0.2)]" style={{ background: 'var(--color-amber-ghost)', color: 'var(--color-amber)' }}>
                  <Sparkles size={32} />
                </div>
                <div>
                  <h3 className="font-display text-3xl mb-3" style={{ color: 'var(--color-text-1)' }}>Deep AI Insights</h3>
                  <p className="font-sans text-base max-w-3xl" style={{ color: 'var(--color-text-2)', lineHeight: 1.6 }}>
                    Unlock the hidden knowledge within your books. Our advanced RAG pipeline automatically generates comprehensive summaries, extracts key concepts, and highlights critical information, transforming how you digest large volumes of text.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="py-8 text-center" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <p className="font-sans text-sm" style={{ color: 'var(--color-text-3)' }}>
            Pustakalaya © 2026. All rights reserved.
          </p>
        </footer>
      </main>
    </>
  );
}
