import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaCircleCheck } from 'react-icons/fa6';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { authService } from '@/services/authService';
import { parseApiError } from '@/services/api';
import { isValidPassword } from '@/utils/validators';
import { useToast } from '@/context/ToastContext';

export const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!isValidPassword(password)) errs.password = 'Password does not meet all requirements.';
    if (password !== confirm) errs.confirm = 'Passwords do not match.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await authService.resetPassword({ token, password });
      setDone(true);
    } catch (err) {
      const { message } = parseApiError(err);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="container-page flex min-h-[80vh] items-center justify-center py-12">
        <div className="card w-full max-w-sm p-6 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-teal-050)] text-[var(--color-teal-600)]">
            <FaCircleCheck size={22} />
          </div>
          <h1 className="text-lg font-semibold text-[var(--color-ink)]">Password updated</h1>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">You can now log in with your new password.</p>
          <button onClick={() => navigate('/login')} className="btn-primary mt-6 w-full">Go to Login</button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page flex min-h-[80vh] items-center justify-center py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-semibold text-[var(--color-ink)]">Reset Password</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Choose a new password for your account.</p>
        </div>
        <form onSubmit={submit} className="card space-y-4 p-6">
          <div>
            <label className="label">New Password</label>
            <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} showChecklist autoComplete="new-password" />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <PasswordInput value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} autoComplete="new-password" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-[var(--color-ink-soft)]">
          <Link to="/login" className="font-semibold text-[var(--color-teal-700)] hover:underline">← Back to Login</Link>
        </p>
      </div>
    </div>
  );
};
