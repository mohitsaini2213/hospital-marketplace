import { useEffect, useState } from 'react';
import { FaPlus, FaPen, FaTrash } from 'react-icons/fa6';
import { DataTable } from '@/components/admin/DataTable';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { adminService } from '@/services/adminService';
import { facilityService } from '@/services/facilityService';
import { parseApiError } from '@/services/api';
import { useToast } from '@/context/ToastContext';

export const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', icon: 'FaHospital', sortOrder: 0, isActive: true });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const load = () => {
    setLoading(true);
    facilityService.categories().then((res) => setCategories(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', icon: 'FaHospital', sortOrder: categories.length, isActive: true });
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, icon: cat.icon, sortOrder: cat.sortOrder, isActive: cat.isActive });
    setModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await adminService.updateCategory(editing._id, form);
        toast.success('Category updated.');
      } else {
        await adminService.createCategory(form);
        toast.success('Category created.');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(parseApiError(err).message);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    try {
      await adminService.deleteCategory(deleteTarget._id);
      toast.success('Category deleted.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(parseApiError(err).message);
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    { key: 'name', header: 'Name' },
    { key: 'icon', header: 'Icon', render: (c) => <span className="font-mono text-xs text-[var(--color-ink-soft)]">{c.icon}</span> },
    { key: 'sortOrder', header: 'Order' },
    { key: 'isActive', header: 'Status', render: (c) => (
      <span className={c.isActive ? 'badge-approved' : 'badge-suspended'}>{c.isActive ? 'Active' : 'Inactive'}</span>
    ) },
    { key: 'actions', header: 'Actions', render: (c) => (
      <div className="flex gap-1.5">
        <button onClick={() => openEdit(c)} className="rounded-lg p-1.5 text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-dim)]"><FaPen size={13} /></button>
        <button onClick={() => setDeleteTarget(c)} className="rounded-lg p-1.5 text-[var(--color-red-600)] hover:bg-[var(--color-red-100)]"><FaTrash size={13} /></button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-ink)]">Categories</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Manage facility registration categories.</p>
        </div>
        <button onClick={openCreate} className="btn-primary"><FaPlus size={13} /> Add Category</button>
      </div>

      <DataTable columns={columns} rows={categories} loading={loading} emptyTitle="No categories yet" />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={save} className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input required className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Icon (react-icons/fa6 name)</label>
            <input className="input" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} placeholder="FaHospital" />
          </div>
          <div>
            <label className="label">Sort Order</label>
            <input type="number" className="input" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="accent-[var(--color-teal-600)]" />
            Active
          </label>
          <button type="submit" disabled={saving} className="btn-primary w-full">{saving ? 'Saving…' : 'Save Category'}</button>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={remove}
        loading={saving}
        tone="danger"
        title="Delete Category"
        description={`Delete "${deleteTarget?.name}"? Existing facilities keep their type, but it won't appear as a registration option.`}
        confirmLabel="Delete"
      />
    </div>
  );
};
