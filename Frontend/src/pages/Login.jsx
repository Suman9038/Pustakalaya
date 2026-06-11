import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import { useToast } from '../components/ui/Toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/auth/login', { email, password });
      
      const { access_token, refresh_token } = res.data;
      
      // Fetch user data after successful login
      const userRes = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      setAuth({ user: userRes.data, access_token, refresh_token });
      toast.success('Logged in successfully');
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 403 && err.response?.data?.detail === "Account not verified") {
        toast.warning('Account not verified. Please check your email.');
      } else {
        toast.error(err.response?.data?.detail || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Enter your credentials to access your library">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <div>
          <label className="block font-sans text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-2)' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full font-sans text-sm transition-all outline-none rounded-lg"
            style={{
              background: 'var(--color-card)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--color-text-1)',
              padding: '12px 16px',
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
        </div>

        <div>
          <label className="block font-sans text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-2)' }}>
            Password
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
          <div className="flex justify-end mt-2">
            <Link to="/forgot-password" className="font-sans text-xs text-[color:var(--color-amber)] hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !email || !password}
          className="w-full font-sans font-medium text-sm rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{
            background: 'var(--color-amber)',
            color: 'var(--color-void)',
            padding: '14px 16px',
            marginTop: '8px',
          }}
          onMouseEnter={(e) => {
            if (!loading && email && password) {
              e.currentTarget.style.background = 'var(--color-amber-bright)';
              e.currentTarget.style.boxShadow = '0 0 20px var(--color-amber-glow)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading && email && password) {
              e.currentTarget.style.background = 'var(--color-amber)';
              e.currentTarget.style.boxShadow = 'none';
            }
          }}
        >
          {loading && <span className="animate-spin w-4 h-4 border-2 border-[color:var(--color-void)] border-t-transparent rounded-full" />}
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p className="text-center font-sans text-sm mt-4" style={{ color: 'var(--color-text-3)' }}>
          Don't have an account?{' '}
          <Link to="/signup" className="text-[color:var(--color-amber)] hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
