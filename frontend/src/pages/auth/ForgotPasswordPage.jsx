import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaEnvelopeCircleCheck } from 'react-icons/fa6';
import { authService } from '@/services/authService';
import { parseApiError } from '@/services/api';
import { isValidEmail } from '@/utils/validators';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!isValidEmail(email)) {
      setError('Enter a valid email address.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await authService.forgotPassword({ email });
    } catch (err) {
      // Deliberately do not reveal whether the email exists — that's a
      // user-enumeration leak. We still show the same success state.
      void parseApiError(err);
    } finally {
      setLoading(false);
      setSent(true);
    }
  };

  return (
    <div className="container-page flex min-h-[80vh] items-center justify-center py-12">
      <div className="w-full max-w-sm">
        {sent ? (
          <div className="card p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-teal-050)] text-[var(--color-teal-600)]">
              <FaEnvelopeCircleCheck size={22} />
            </div>
            <h1 className="text-lg font-semibold text-[var(--color-ink)]">Check your email</h1>
            <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
              If an account exists for <strong>{email}</strong>, we've sent a link to reset your password.
            </p>
            <Link to="/login" className="btn-secondary mt-6 w-full">Back to Login</Link>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-semibold text-[var(--color-ink)]">Forgot Password</h1>
              <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Enter your email and we'll send you a reset link.</p>
            </div>
            <form onSubmit={submit} className="card space-y-4 p-6">
              <div>
                <label className="label">Email</label>
                <input type="email" className={`input ${error ? 'input-error' : ''}`} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                {error && <p className="field-error">{error}</p>}
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-[var(--color-ink-soft)]">
              <Link to="/login" className="font-semibold text-[var(--color-teal-700)] hover:underline">← Back to Login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
};
