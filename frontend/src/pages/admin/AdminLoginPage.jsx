import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { FaShieldHalved } from 'react-icons/fa6';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { parseApiError } from '@/services/api';
import { isValidEmail } from '@/utils/validators';

export const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { loginAdmin } = useAuth();
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
      await loginAdmin({ email, password });
      toast.success('Welcome back.');
      navigate(location.state?.from?.pathname || '/admin/dashboard', { replace: true });
    } catch (err) {
      const { message } = parseApiError(err);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-teal-900)] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 text-white">
            <FaShieldHalved size={20} />
          </span>
          <h1 className="text-2xl font-semibold text-white">Admin Login</h1>
          <p className="mt-1 text-sm text-white/60">Restricted access — Hospital Marketplace staff only.</p>
        </div>

        <form onSubmit={submit} className="card space-y-4 bg-white p-6">
          <div>
            <label className="label">Email</label>
            <input type="email" className={`input ${errors.email ? 'input-error' : ''}`} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@hospitalmarketplace.in" />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>
          <div>
            <label className="label">Password</label>
            <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} autoComplete="current-password" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Verifying…' : 'Login to Dashboard'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-white/50">
          <Link to="/" className="hover:text-white/80">← Back to Hospital Marketplace</Link>
        </p>
      </div>
    </div>
  );
};
