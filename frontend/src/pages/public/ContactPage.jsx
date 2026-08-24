import { FaEnvelope, FaLocationDot } from 'react-icons/fa6';
import { WEBSITE_SERVICE_EMAIL } from '@/utils/constants';

export const ContactPage = () => (
  <div className="container-page max-w-2xl py-16">
    <h1 className="text-3xl font-semibold text-[var(--color-ink)]">Contact Us</h1>
    <p className="mt-3 text-[var(--color-ink-soft)]">
      Have a question about a listing, need help with registration, or want a website for your
      healthcare business? We're happy to help.
    </p>

    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="card p-5">
        <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-teal-050)] text-[var(--color-teal-700)]">
          <FaEnvelope size={15} />
        </div>
        <h3 className="text-sm font-semibold text-[var(--color-ink)]">Email</h3>
        <a href={`mailto:${WEBSITE_SERVICE_EMAIL}`} className="mt-1 block text-sm text-[var(--color-teal-700)]">{WEBSITE_SERVICE_EMAIL}</a>
      </div>
      <div className="card p-5">
        <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-teal-050)] text-[var(--color-teal-700)]">
          <FaLocationDot size={15} />
        </div>
        <h3 className="text-sm font-semibold text-[var(--color-ink)]">Location</h3>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Alwar, Rajasthan, India</p>
      </div>
    </div>
  </div>
);
