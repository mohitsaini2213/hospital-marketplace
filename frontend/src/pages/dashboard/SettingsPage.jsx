import { useState } from 'react';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { authService } from '@/services/authService';
import { parseApiError } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { isValidPassword } from '@/utils/validators';
import { useAuth } from '@/context/AuthContext';

export const SettingsPage = () => {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!currentPassword) errs.currentPassword = 'Enter your current password.';
    if (!isValidPassword(newPassword)) errs.newPassword = 'New password does not meet all requirements.';
    if (newPassword !== confirm) errs.confirm = 'Passwords do not match.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      toast.success('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirm('');
    } catch (err) {
      toast.error(parseApiError(err).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl space-y-8">
      <div>
        <h1 className="mb-1 text-2xl font-semibold text-[var(--color-ink)]">Account Settings</h1>
        <p className="text-sm text-[var(--color-ink-soft)]">Manage your login and account security.</p>
      </div>

      <div className="card p-6">
        <h3 className="mb-4 text-sm font-semibold text-[var(--color-ink)]">Account</h3>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-[var(--color-ink-soft)]">Email</dt>
            <dd className="font-medium text-[var(--color-ink)]">{user?.email}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-[var(--color-ink-soft)]">Facility Type</dt>
            <dd className="font-medium text-[var(--color-ink)]">{user?.facilityType}</dd>
          </div>
        </dl>
      </div>

      <form onSubmit={submit} className="card space-y-4 p-6">
        <h3 className="text-sm font-semibold text-[var(--color-ink)]">Change Password</h3>
        <div>
          <label className="label">Current Password</label>
          <PasswordInput value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} error={errors.currentPassword} autoComplete="current-password" />
        </div>
        <div>
          <label className="label">New Password</label>
          <PasswordInput value={newPassword} onChange={(e) => setNewPassword(e.target.value)} error={errors.newPassword} showChecklist autoComplete="new-password" />
        </div>
        <div>
          <label className="label">Confirm New Password</label>
          <PasswordInput value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} autoComplete="new-password" />
        </div>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Updating…' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};
