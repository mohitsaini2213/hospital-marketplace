import { useEffect, useState } from 'react';
import { FaPlus } from 'react-icons/fa6';
import { DataTable } from '@/components/admin/DataTable';
import { Modal } from '@/components/ui/Modal';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { adminService } from '@/services/adminService';
import { parseApiError } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { useAuth } from '@/context/AuthContext';
import { isValidEmail, isValidPassword } from '@/utils/validators';
import { formatDate } from '@/utils/format';

const ROLES = ['ADMIN', 'MODERATOR', 'OWNER'];

export const AdminUsersPage = () => {
  const { admin } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'MODERATOR' });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const load = () => {
    setLoading(true);
    adminService.listAdmins().then((res) => setAdmins(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!isValidEmail(form.email)) errs.email = 'Enter a valid email.';
    if (!isValidPassword(form.password)) errs.password = 'Password does not meet requirements.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      await adminService.createAdmin(form);
      toast.success('Admin user created.');
      setModalOpen(false);
      setForm({ name: '', email: '', password: '', role: 'MODERATOR' });
      load();
    } catch (err) {
      toast.error(parseApiError(err).message);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (row) => {
    try {
      await adminService.updateAdminStatus(row._id, { isActive: !row.isActive });
      toast.success(`${row.name} ${row.isActive ? 'deactivated' : 'activated'}.`);
      load();
    } catch (err) {
      toast.error(parseApiError(err).message);
    }
  };

  const columns = [
    { key: 'name', header: 'Name', render: (a) => (
      <div>
        <p className="font-medium text-[var(--color-ink)]">{a.name}</p>
        <p className="text-xs text-[var(--color-ink-soft)]">{a.email}</p>
      </div>
    ) },
    { key: 'role', header: 'Role', render: (a) => <span className="rounded-full bg-[var(--color-teal-050)] px-2.5 py-1 text-xs font-semibold text-[var(--color-teal-700)]">{a.role}</span> },
    { key: 'isActive', header: 'Status', render: (a) => <span className={a.isActive ? 'badge-approved' : 'badge-suspended'}>{a.isActive ? 'Active' : 'Inactive'}</span> },
    { key: 'createdAt', header: 'Added', render: (a) => formatDate(a.createdAt) },
    { key: 'actions', header: 'Actions', render: (a) => (
      a._id !== admin?.id && (
        <button onClick={() => toggleActive(a)} className="text-xs font-semibold text-[var(--color-teal-700)] hover:underline">
          {a.isActive ? 'Deactivate' : 'Activate'}
        </button>
      )
    ) },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-ink)]">Admin Users</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Owner-only: manage who can access the admin dashboard.</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="btn-primary"><FaPlus size={13} /> Add Admin</button>
      </div>

      <DataTable columns={columns} rows={admins} loading={loading} emptyTitle="No admin users yet" />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Admin User">
        <form onSubmit={create} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input className={`input ${errors.name ? 'input-error' : ''}`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            {errors.name && <p className="field-error">{errors.name}</p>}
          </div>
          <div>
            <label className="label">Email</label>
            <input type="email" className={`input ${errors.email ? 'input-error' : ''}`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>
          <div>
            <label className="label">Password</label>
            <PasswordInput value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} error={errors.password} showChecklist autoComplete="new-password" />
          </div>
          <div>
            <label className="label">Role</label>
            <select className="input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Creating…' : 'Create Admin'}</button>
        </form>
      </Modal>
    </div>
  );
};
