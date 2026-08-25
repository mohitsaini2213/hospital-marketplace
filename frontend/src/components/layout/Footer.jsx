import { Link } from 'react-router-dom';
import { FaHouseChimneyMedical, FaEnvelope, FaLocationDot } from 'react-icons/fa6';
import { WEBSITE_SERVICE_EMAIL } from '@/utils/constants';

export const Footer = () => (
  <footer className="mt-24 border-t border-[var(--color-line)] bg-[var(--color-teal-900)] text-[var(--color-teal-050)]">
    <div className="container-page grid grid-cols-1 gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
      <div>
        <Link to="/" className="flex items-center gap-2 font-display text-lg font-semibold text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
            <FaHouseChimneyMedical size={15} />
          </span>
          Hospital Marketplace
        </Link>
        <p className="mt-3 max-w-xs text-sm text-[var(--color-teal-050)]/70">
          Find trusted healthcare services near you — starting in Alwar, Rajasthan.
        </p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-white">Quick Links</h4>
        <ul className="mt-3 space-y-2 text-sm text-[var(--color-teal-050)]/75">
          <li><Link to="/directory?type=Hospital" className="hover:text-white">Hospitals</Link></li>
          <li><Link to="/directory?type=Clinic" className="hover:text-white">Clinics</Link></li>
          <li><Link to="/directory?type=Medical Store / Pharmacy" className="hover:text-white">Medical Stores</Link></li>
          <li><Link to="/directory?type=Diagnostic Center" className="hover:text-white">Diagnostic Centers</Link></li>
          <li><Link to="/register" className="hover:text-white">Register Your Facility</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-white">Company</h4>
        <ul className="mt-3 space-y-2 text-sm text-[var(--color-teal-050)]/75">
          <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
          <li><Link to="/privacy-policy" className="hover:text-white">Privacy Policy</Link></li>
          <li><Link to="/terms" className="hover:text-white">Terms &amp; Conditions</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-white">Contact</h4>
        <ul className="mt-3 space-y-2.5 text-sm text-[var(--color-teal-050)]/75">
          <li className="flex items-start gap-2">
            <FaLocationDot size={14} className="mt-0.5 shrink-0" /> Alwar, Rajasthan, India
          </li>
          <li className="flex items-start gap-2">
            <FaEnvelope size={14} className="mt-0.5 shrink-0" />
            <a href={`mailto:${WEBSITE_SERVICE_EMAIL}`} className="hover:text-white">{WEBSITE_SERVICE_EMAIL}</a>
          </li>
        </ul>
      </div>
    </div>

    <div className="border-t border-white/10 py-5">
      <p className="container-page text-center text-xs text-[var(--color-teal-050)]/60">
        © {new Date().getFullYear()} Hospital Marketplace. All rights reserved.
      </p>
    </div>
  </footer>
);
