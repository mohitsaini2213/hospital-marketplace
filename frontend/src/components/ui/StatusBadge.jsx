import { FaCircleCheck } from 'react-icons/fa6';
import { STATUS_LABEL } from '@/utils/constants';

export const VerifiedBadge = () => (
  <span className="badge-verified" title="Verified by Hospital Marketplace">
    <FaCircleCheck size={12} /> Verified
  </span>
);

const STATUS_CLASS = {
  PENDING: 'badge-pending',
  APPROVED: 'badge-approved',
  REJECTED: 'badge-rejected',
  SUSPENDED: 'badge-suspended',
};

export const StatusBadge = ({ status }) => (
  <span className={STATUS_CLASS[status] || 'badge-suspended'}>{STATUS_LABEL[status] || status}</span>
);
