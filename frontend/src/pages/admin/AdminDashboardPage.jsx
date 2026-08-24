import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaBuilding,
  FaHourglassHalf,
  FaCircleCheck,
  FaCircleXmark,
  FaGlobe,
  FaHospital,
} from 'react-icons/fa6';
import { AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { StatsCard, ChartCard } from '@/components/admin/StatsCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Spinner } from '@/components/ui/Loading';
import { adminService } from '@/services/adminService';
import { formatDate, timeAgo } from '@/utils/format';

const PIE_COLORS = ['#0f7a63', '#b9803d', '#17916f', '#0b4f44', '#93601f', '#cf9a52', '#1e8f6f', '#b3771e', '#3c4e48', '#0e6455'];

export const AdminDashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.dashboardSummary().then((res) => setSummary(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading || !summary) {
    return (
      <div className="flex h-64 items-center justify-center text-[var(--color-teal-600)]">
        <Spinner size={26} />
      </div>
    );
  }

  const { totals, byType, trend, recentRegistrations, recentActivity } = summary;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-ink)]">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Platform overview and recent activity.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
        <StatsCard label="Total Facilities" value={totals.total} icon={FaBuilding} tone="teal" />
        <StatsCard label="Pending" value={totals.pending} icon={FaHourglassHalf} tone="amber" />
        <StatsCard label="Approved" value={totals.approved} icon={FaCircleCheck} tone="green" />
        <StatsCard label="Rejected" value={totals.rejected} icon={FaCircleXmark} tone="red" />
        <StatsCard label="Suspended" value={totals.suspended} icon={FaHospital} tone="sand" />
        <StatsCard label="Website Leads" value={totals.leads} icon={FaGlobe} tone="teal" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <ChartCard title="Registrations — Last 30 Days" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0f7a63" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#0f7a63" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e4dfd2" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#3c4e48' }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fontSize: 11, fill: '#3c4e48' }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 10, borderColor: '#e4dfd2', fontSize: 12 }} />
              <Area type="monotone" dataKey="count" stroke="#0f7a63" strokeWidth={2} fill="url(#trendFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="By Facility Type">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={byType} dataKey="count" nameKey="type" innerRadius={50} outerRadius={85} paddingAngle={2}>
                {byType.map((entry, i) => (
                  <Cell key={entry.type} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, borderColor: '#e4dfd2', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <ul className="mt-2 space-y-1.5">
            {byType.map((t, i) => (
              <li key={t.type} className="flex items-center justify-between text-xs text-[var(--color-ink-soft)]">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  {t.type}
                </span>
                <span className="font-medium text-[var(--color-ink)]">{t.count}</span>
              </li>
            ))}
          </ul>
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ChartCard title="Recent Registrations" action={<Link to="/admin/facilities" className="text-xs font-semibold text-[var(--color-teal-700)]">View all →</Link>}>
          <ul className="divide-y divide-[var(--color-line)]">
            {recentRegistrations.map((f) => (
              <li key={f._id} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <p className="font-medium text-[var(--color-ink)]">{f.name}</p>
                  <p className="text-xs text-[var(--color-ink-soft)]">{f.facilityType} · {f.city} · {formatDate(f.createdAt)}</p>
                </div>
                <StatusBadge status={f.status} />
              </li>
            ))}
            {recentRegistrations.length === 0 && <p className="py-4 text-sm text-[var(--color-ink-soft)]">No registrations yet.</p>}
          </ul>
        </ChartCard>

        <ChartCard title="Recent Activity" action={<Link to="/admin/activity" className="text-xs font-semibold text-[var(--color-teal-700)]">View all →</Link>}>
          <ul className="divide-y divide-[var(--color-line)]">
            {recentActivity.map((a) => (
              <li key={a._id} className="py-2.5 text-sm">
                <p className="text-[var(--color-ink)]">
                  <span className="font-medium">{a.actorName || a.actorType}</span> · {a.action.replaceAll('_', ' ').toLowerCase()}
                </p>
                <p className="text-xs text-[var(--color-ink-soft)]">{timeAgo(a.createdAt)}</p>
              </li>
            ))}
            {recentActivity.length === 0 && <p className="py-4 text-sm text-[var(--color-ink-soft)]">No activity yet.</p>}
          </ul>
        </ChartCard>
      </div>
    </div>
  );
};
