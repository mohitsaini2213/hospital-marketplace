import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaHospital } from 'react-icons/fa6';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { parseApiError } from '@/services/api';
import { isValidEmail } from '@/utils/validators';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { loginFacility } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!isValidEmail(email)) errs.email = 'Enter a valid email address.';
    if (!password) errs.password = 'Password is required.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await loginFacility({ email, password });
      toast.success('Welcome back!');
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      const { message } = parseApiError(err);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-page flex min-h-[80vh] items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-teal-600)] text-white">
            <FaHospital size={20} />
          </span>
          <h1 className="text-2xl font-semibold text-[var(--color-ink)]">Welcome back</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Login to manage your facility listing.</p>
        </div>

        <form onSubmit={submit} className="card space-y-4 p-6">
          <div>
            <label className="label">Email</label>
            <input type="email" className={`input ${errors.email ? 'input-error' : ''}`} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="label !mb-0">Password</label>
              <Link to="/forgot-password" className="text-xs font-medium text-[var(--color-teal-700)] hover:underline">
                Forgot password?
              </Link>
            </div>
            <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} autoComplete="current-password" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Logging in…' : 'Login'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--color-ink-soft)]">
          Don't have a listing yet?{' '}
          <Link to="/register" className="font-semibold text-[var(--color-teal-700)] hover:underline">
            Register your facility
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-[var(--color-ink-soft)]">
          <Link to="/admin/login" className="hover:underline">Admin login →</Link>
        </p>
      </div>
    </div>
  );
};
