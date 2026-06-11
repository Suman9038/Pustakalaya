import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import AuthLayout from '../components/layout/AuthLayout';
import api from '../lib/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying'); // verifying, success, error

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    const verify = async () => {
      try {
        await api.get(`/auth/verify-email?token=${token}`);
        setStatus('success');
      } catch (err) {
        setStatus('error');
      }
    };

    verify();
  }, [token]);

  return (
    <AuthLayout title="Email Verification">
      <div className="flex flex-col items-center justify-center text-center py-8">
        {status === 'verifying' && (
          <>
            <div className="w-16 h-16 border-4 border-[color:var(--border-subtle)] border-t-[color:var(--color-amber)] rounded-full animate-spin mb-6" />
            <p className="font-sans text-lg text-[color:var(--color-text-1)]">Verifying your email...</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ background: 'rgba(74,222,128,0.1)', color: '#4ade80' }}>
              <CheckCircle size={32} />
            </div>
            <h3 className="font-display text-2xl mb-2 text-[color:var(--color-text-1)]">Email Verified!</h3>
            <p className="font-sans text-sm text-[color:var(--color-text-2)] mb-8">Your account is now active. You can log in.</p>
            <Link
              to="/login"
              className="w-full font-sans font-medium text-sm rounded-lg transition-all text-center py-3"
              style={{ background: 'var(--color-amber)', color: 'var(--color-void)' }}
            >
              Go to Login
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }}>
              <XCircle size={32} />
            </div>
            <h3 className="font-display text-2xl mb-2 text-[color:var(--color-text-1)]">Verification Failed</h3>
            <p className="font-sans text-sm text-[color:var(--color-text-2)] mb-8">The link might be invalid or expired.</p>
            <Link
              to="/login"
              className="w-full font-sans font-medium text-sm rounded-lg transition-all text-center py-3"
              style={{ background: 'transparent', border: '1px solid var(--border-subtle)', color: 'var(--color-text-1)' }}
            >
              Back to Login
            </Link>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
