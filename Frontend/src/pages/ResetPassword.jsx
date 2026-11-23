import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import api from '../lib/api';
import { useToast } from '../components/ui/Toast';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const toast = useToast();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const calculatePasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[!@#$%^&*]/.test(pwd)) score++;
    return score; // 0 to 5
  };

  const strength = calculatePasswordStrength(password);
  const strengthColors = ['var(--border-subtle)', '#f87171', '#fbbf24', '#4ade80', '#4ade80', '#4ade80'];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      toast.error('Missing or invalid reset token');
      return;
    }

    if (password !== confirmPassword) {
      toast.warning('Passwords do not match');
      return;
    }

    if (strength < 4) {
      toast.warning('Password must contain at least 8 characters, an uppercase letter, lowercase letter, number, and special character');
      return;
    }

    try {
      setLoading(true);
      await api.post('/auth/reset-password', {
        token,
        new_password: password,
      });
      setIsSuccess(true);
      toast.success('Password reset successfully!');
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        'Failed to reset password. Link may be expired.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout title="Invalid Link" subtitle="Reset token is missing or malformed">
        <div className="flex flex-col items-center text-center py-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
            style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }}
          >
            <AlertTriangle size={32} />
          </div>
          <p className="font-sans text-sm mb-6 text-[color:var(--color-text-2)]">
            This password reset link is invalid or has already expired. Please request a new link.
          </p>
          <Link
            to="/forgot-password"
            className="w-full font-sans font-medium text-sm py-3 rounded-lg text-center"
            style={{ background: 'var(--color-amber)', color: 'var(--color-void)' }}
          >
            Request New Reset Link
          </Link>
        </div>
      </AuthLayout>
    );
  }

  if (isSuccess) {
    return (
      <AuthLayout title="Password Reset" subtitle="Your account has been secured with a new password">
        <div className="flex flex-col items-center text-center py-6">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
            style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80' }}
          >
            <CheckCircle2 size={32} />
          </div>
          <h3 className="font-display text-2xl mb-2 text-[color:var(--color-text-1)]">All set!</h3>
          <p className="font-sans text-sm mb-8 text-[color:var(--color-text-2)]">
            Your password has been changed successfully. You can now use your new password to sign in.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full font-sans font-medium text-sm py-3 rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all"
            style={{ background: 'var(--color-amber)', color: 'var(--color-void)' }}
          >
            <span>Sign In Now</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Choose new password" subtitle="Create a strong password for your Pustakalaya account">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block font-sans text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-2)' }}>
            New Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full font-sans text-sm transition-all outline-none rounded-lg"
              style={{
                background: 'var(--color-card)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--color-text-1)',
                padding: '12px 40px 12px 16px',
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
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--color-text-3)] hover:text-[color:var(--color-text-2)] transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Password strength meter */}
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full transition-colors duration-300"
                style={{ background: i <= strength ? strengthColors[strength] : 'var(--border-subtle)' }}
              />
            ))}
          </div>
          <span className="text-[11px] font-sans mt-1 block" style={{ color: 'var(--color-text-3)' }}>
            Min 8 chars with uppercase, lowercase, number & symbol (!@#$%^&*)
          </span>
        </div>

        <div>
          <label className="block font-sans text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-2)' }}>
            Confirm New Password
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full font-sans text-sm transition-all outline-none rounded-lg"
              style={{
                background: 'var(--color-card)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--color-text-1)',
                padding: '12px 40px 12px 16px',
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
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--color-text-3)] hover:text-[color:var(--color-text-2)] transition-colors cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {confirmPassword && password !== confirmPassword && (
            <span className="text-xs font-sans mt-1 text-[color:var(--color-error)] block">
              Passwords do not match
            </span>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !password || !confirmPassword || password !== confirmPassword}
          className="w-full font-sans font-medium text-sm rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{
            background: 'var(--color-amber)',
            color: 'var(--color-void)',
            padding: '14px 16px',
            marginTop: '8px',
          }}
          onMouseEnter={(e) => {
            if (!loading && password && confirmPassword) {
              e.currentTarget.style.background = 'var(--color-amber-bright)';
              e.currentTarget.style.boxShadow = '0 0 20px var(--color-amber-glow)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && password && confirmPassword) {
              e.currentTarget.style.background = 'var(--color-amber)';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
        >
          {loading && <span className="animate-spin w-4 h-4 border-2 border-[color:var(--color-void)] border-t-transparent rounded-full" />}
          {loading ? 'Updating password...' : 'Update Password'}
        </button>
      </form>
    </AuthLayout>
  );
}
