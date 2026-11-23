import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import api from '../lib/api';
import { useToast } from '../components/ui/Toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setLoading(true);
      await api.post('/auth/forgot-password', { email: email.trim() });
      setSubmitted(true);
      toast.success('Password reset link sent to your email');
    } catch (err) {
      const detail = err.response?.data?.message || err.response?.data?.detail;
      if (err.response?.status === 401 && err.response?.data?.error_code === 'ERR_EMAIL_SET_TO_COOLDOWN') {
        toast.warning('Cooldown active: Please wait 60 seconds before requesting another email.');
      } else {
        toast.error(detail || 'Could not send reset link. Please check your email.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={submitted ? "Check your email" : "Reset your password"}
      subtitle={
        submitted
          ? `We sent instructions to ${email}`
          : "Enter the email associated with your account and we will send you a reset link"
      }
    >
      {submitted ? (
        <div className="flex flex-col items-center text-center py-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
            style={{ background: 'var(--color-amber-ghost)', color: 'var(--color-amber)' }}
          >
            <CheckCircle2 size={32} />
          </div>

          <p className="font-sans text-sm mb-6 leading-relaxed" style={{ color: 'var(--color-text-2)' }}>
            If an account exists with this email address, you will receive password reset instructions shortly.
            Please also check your spam or promotions folder.
          </p>

          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => {
                setSubmitted(false);
                setEmail('');
              }}
              className="w-full font-sans text-sm py-2.5 rounded-lg transition-colors cursor-pointer"
              style={{
                background: 'var(--color-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--color-text-1)',
              }}
            >
              Try another email
            </button>

            <Link
              to="/login"
              className="font-sans text-sm flex items-center justify-center gap-2 py-2 hover:underline"
              style={{ color: 'var(--color-amber)' }}
            >
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block font-sans text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-2)' }}>
              Account Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
                className="w-full font-sans text-sm transition-all outline-none rounded-lg"
                style={{
                  background: 'var(--color-card)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--color-text-1)',
                  padding: '12px 16px 12px 40px',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-amber)';
                  e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-amber-ghost)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <Mail
                size={18}
                className="absolute left-3.5 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--color-text-3)', pointerEvents: 'none' }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim()}
            className="w-full font-sans font-medium text-sm rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              background: 'var(--color-amber)',
              color: 'var(--color-void)',
              padding: '14px 16px',
              marginTop: '4px',
            }}
            onMouseEnter={(e) => {
              if (!loading && email) {
                e.currentTarget.style.background = 'var(--color-amber-bright)';
                e.currentTarget.style.boxShadow = '0 0 20px var(--color-amber-glow)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading && email) {
                e.currentTarget.style.background = 'var(--color-amber)';
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          >
            {loading && <span className="animate-spin w-4 h-4 border-2 border-[color:var(--color-void)] border-t-transparent rounded-full" />}
            {loading ? 'Sending link...' : 'Send Reset Link'}
          </button>

          <div className="flex justify-center mt-2">
            <Link
              to="/login"
              className="font-sans text-sm flex items-center gap-2 hover:underline"
              style={{ color: 'var(--color-text-3)' }}
            >
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
