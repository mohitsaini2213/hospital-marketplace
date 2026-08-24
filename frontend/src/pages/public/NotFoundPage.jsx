import { Link } from 'react-router-dom';
import { FaHouseChimney, FaTriangleExclamation } from 'react-icons/fa6';

export const NotFoundPage = () => (
  <div className="container-page flex min-h-[70vh] flex-col items-center justify-center text-center py-16">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-teal-050)] text-[var(--color-teal-600)]">
      <FaTriangleExclamation size={24} />
    </div>
    <h1 className="font-display text-3xl font-semibold text-[var(--color-ink)]">Page Not Found</h1>
    <p className="mt-2 max-w-sm text-sm text-[var(--color-ink-soft)]">
      The page you're looking for doesn't exist or may have been moved.
    </p>
    <Link to="/" className="btn-primary mt-6">
      <FaHouseChimney size={13} /> Back to Home
    </Link>
  </div>
);
