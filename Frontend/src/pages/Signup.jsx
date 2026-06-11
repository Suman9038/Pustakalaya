import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import api from '../lib/api';
import { useToast } from '../components/ui/Toast';

export default function Signup() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const calculatePasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length > 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score; // 0 to 5
  };

  const strength = calculatePasswordStrength(formData.password);
  const strengthColors = ['var(--border-subtle)', '#f87171', '#fbbf24', '#4ade80', '#4ade80'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/auth/signup', formData);
      toast.success('Account created! Please check your email to verify.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Signup failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create an account" subtitle="Join Pustakalaya to start your digital library">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block font-sans text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-2)' }}>First Name</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
              className="w-full font-sans text-sm transition-all outline-none rounded-lg"
              style={{ background: 'var(--color-card)', border: '1px solid var(--border-subtle)', color: 'var(--color-text-1)', padding: '12px 16px' }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-amber)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
            />
          </div>
          <div className="flex-1">
            <label className="block font-sans text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-2)' }}>Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
              className="w-full font-sans text-sm transition-all outline-none rounded-lg"
              style={{ background: 'var(--color-card)', border: '1px solid var(--border-subtle)', color: 'var(--color-text-1)', padding: '12px 16px' }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-amber)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
            />
          </div>
        </div>

        <div>
          <label className="block font-sans text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-2)' }}>Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            className="w-full font-sans text-sm transition-all outline-none rounded-lg"
            style={{ background: 'var(--color-card)', border: '1px solid var(--border-subtle)', color: 'var(--color-text-1)', padding: '12px 16px' }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-amber)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
          />
        </div>

        <div>
          <label className="block font-sans text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-2)' }}>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full font-sans text-sm transition-all outline-none rounded-lg"
            style={{ background: 'var(--color-card)', border: '1px solid var(--border-subtle)', color: 'var(--color-text-1)', padding: '12px 16px' }}
            onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-amber)'}
            onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
          />
        </div>

        <div>
          <label className="block font-sans text-sm font-medium mb-1.5" style={{ color: 'var(--color-text-2)' }}>Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full font-sans text-sm transition-all outline-none rounded-lg"
              style={{ background: 'var(--color-card)', border: '1px solid var(--border-subtle)', color: 'var(--color-text-1)', padding: '12px 40px 12px 16px' }}
              onFocus={(e) => e.currentTarget.style.borderColor = 'var(--color-amber)'}
              onBlur={(e) => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--color-text-3)] hover:text-[color:var(--color-text-2)] transition-colors cursor-pointer"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {/* Password strength indicator */}
          <div className="flex gap-1 mt-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full transition-colors duration-300"
                style={{ background: i <= strength ? strengthColors[strength] : 'var(--border-subtle)' }}
              />
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || strength < 3}
          className="w-full font-sans font-medium text-sm rounded-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          style={{ background: 'var(--color-amber)', color: 'var(--color-void)', padding: '14px 16px' }}
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>

        <p className="text-center font-sans text-sm mt-4" style={{ color: 'var(--color-text-3)' }}>
          Already have an account?{' '}
          <Link to="/login" className="text-[color:var(--color-amber)] hover:underline">Log in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
