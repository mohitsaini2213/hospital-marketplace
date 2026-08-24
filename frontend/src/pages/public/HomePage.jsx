import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as Fa6 from 'react-icons/fa6';
import { SearchBar } from '@/components/facility/SearchBar';
import { FacilityCard } from '@/components/facility/FacilityCard';
import { CardSkeletonGrid } from '@/components/ui/Loading';
import { PinClusterMotif } from '@/components/ui/PinClusterMotif';
import { facilityService } from '@/services/facilityService';
import { useSeo } from '@/hooks/useSeo';
import { WEBSITE_SERVICE_EMAIL } from '@/utils/constants';

const TRUST_POINTS = [
  { icon: Fa6.FaShieldHeart, title: 'Verified Listings', desc: 'Every facility is reviewed by our team before it goes live — no fake or duplicate listings.' },
  { icon: Fa6.FaMagnifyingGlass, title: 'Easy Search', desc: 'Search by name, service, or facility type and find what you need in seconds.' },
  { icon: Fa6.FaMapLocationDot, title: 'Location-Based Discovery', desc: 'See exactly how far a facility is and get directions with one tap.' },
  { icon: Fa6.FaHandHoldingHeart, title: 'Trusted Directory', desc: 'Built for Alwar, by people who understand what patients and families actually need.' },
  { icon: Fa6.FaFileCircleCheck, title: 'Free Registration', desc: 'Listing your facility costs nothing. Reach more patients without ad spend.' },
  { icon: Fa6.FaIdCardClip, title: 'Professional Profiles', desc: 'A clean, credible page for your facility — hours, services, photos, and contact details.' },
];

const HOW_IT_WORKS = [
  { title: 'Search or Register', desc: 'Visitors search for care nearby, or facility owners start a free registration.' },
  { title: 'We Verify', desc: 'Our team checks every submitted listing before it becomes public.' },
  { title: 'Get Discovered', desc: 'Approved listings appear in search, the directory, and the map — ready to be found.' },
];

const TYPE_SECTIONS = [
  { type: 'Hospital', title: 'Popular Hospitals', desc: 'Multi-specialty and general hospitals serving Alwar.' },
  { type: 'Clinic', title: 'Clinics Near You', desc: 'Family doctors and specialist clinics for everyday care.' },
  { type: 'Medical Store / Pharmacy', title: 'Medical Stores', desc: 'Pharmacies for medicines and healthcare essentials.' },
  { type: 'Diagnostic Center', title: 'Diagnostic Centers', desc: 'Labs and imaging centers for tests and screenings.' },
];

export const HomePage = () => {
  useSeo({ path: '/' });
  const [sections, setSections] = useState({});
  const [featured, setFeatured] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const results = await Promise.all([
          ...TYPE_SECTIONS.map((s) => facilityService.list({ type: s.type, limit: 3, sort: 'rating' })),
          facilityService.list({ featured: true, limit: 3 }),
        ]);
        const byType = {};
        TYPE_SECTIONS.forEach((s, i) => {
          byType[s.type] = results[i].data;
        });
        setSections(byType);
        setFeatured(results[results.length - 1].data);
      } catch {
        // Directory sections are supplementary — fail quietly, page still works
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div>
      {/* ---------- HERO ---------- */}
      <section className="relative overflow-hidden border-b border-[var(--color-line)] bg-gradient-to-b from-[var(--color-teal-050)]/60 to-[var(--color-paper)]">
        <div className="container-page grid grid-cols-1 items-center gap-10 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <span className="eyebrow">
              <Fa6.FaLocationDot size={11} /> Alwar, Rajasthan
            </span>
            <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.08] text-[var(--color-ink)] sm:text-5xl">
              Find Hospitals, Clinics &amp; Medical Services in Alwar
            </h1>
            <p className="mt-4 max-w-lg text-base text-[var(--color-ink-soft)]">
              Discover verified hospitals, clinics, pharmacies and diagnostic centers near you —
              search, compare, and get directions in seconds.
            </p>

            <div className="mt-8">
              <SearchBar />
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link to="/directory" className="btn-primary">
                <Fa6.FaMagnifyingGlass size={13} /> Search Healthcare
              </Link>
              <Link to="/register" className="btn-secondary">
                <Fa6.FaBuilding size={13} /> Register Your Facility
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <PinClusterMotif className="w-full" />
          </div>
        </div>
      </section>

      {/* ---------- TYPE SECTIONS ---------- */}
      {TYPE_SECTIONS.map((s) => (
        <section key={s.type} className="border-b border-[var(--color-line)] py-14">
          <div className="container-page">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-semibold text-[var(--color-ink)]">{s.title}</h2>
                <p className="mt-1 text-sm text-[var(--color-ink-soft)]">{s.desc}</p>
              </div>
              <Link to={`/directory?type=${encodeURIComponent(s.type)}`} className="text-sm font-semibold text-[var(--color-teal-700)] hover:underline">
                View all →
              </Link>
            </div>
            {loading ? (
              <CardSkeletonGrid count={3} />
            ) : sections[s.type]?.length ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {sections[s.type].map((f) => (
                  <FacilityCard key={f._id} facility={f} />
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-dashed border-[var(--color-line)] px-5 py-8 text-center text-sm text-[var(--color-ink-soft)]">
                No {s.type.toLowerCase()} listings yet — be the first to register.
              </p>
            )}
          </div>
        </section>
      ))}

      {/* ---------- FEATURED ---------- */}
      {!loading && featured?.length > 0 && (
        <section className="border-b border-[var(--color-line)] bg-[var(--color-paper-dim)]/40 py-14">
          <div className="container-page">
            <h2 className="mb-7 text-2xl font-semibold text-[var(--color-ink)]">Featured Listings</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((f) => (
                <FacilityCard key={f._id} facility={f} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------- WHY / TRUST ---------- */}
      <section className="border-b border-[var(--color-line)] py-16">
        <div className="container-page">
          <div className="mb-10 max-w-xl">
            <span className="eyebrow">Why Hospital Marketplace</span>
            <h2 className="mt-3 text-3xl font-semibold text-[var(--color-ink)]">Built for trust, not just traffic</h2>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TRUST_POINTS.map((t) => (
              <div key={t.title} className="card p-5">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-teal-050)] text-[var(--color-teal-700)]">
                  <t.icon size={17} />
                </div>
                <h3 className="text-sm font-semibold text-[var(--color-ink)]">{t.title}</h3>
                <p className="mt-1.5 text-sm text-[var(--color-ink-soft)]">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- HOW IT WORKS ---------- */}
      <section className="border-b border-[var(--color-line)] bg-[var(--color-teal-900)] py-16 text-white">
        <div className="container-page">
          <span className="eyebrow text-[var(--color-teal-100)]">How It Works</span>
          <h2 className="mt-3 text-3xl font-semibold">From registration to discovery</h2>
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.title} className="relative">
                <span className="font-display text-4xl font-semibold text-white/25">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="mt-2 text-lg font-semibold">{step.title}</h3>
                <p className="mt-1.5 text-sm text-white/70">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- REGISTER CTA ---------- */}
      <section className="border-b border-[var(--color-line)] py-16">
        <div className="container-page">
          <div className="card flex flex-col items-start gap-6 bg-[var(--color-teal-050)] p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div>
              <h2 className="text-2xl font-semibold text-[var(--color-ink)]">Own a Hospital, Clinic or Medical Store?</h2>
              <p className="mt-2 max-w-md text-sm text-[var(--color-ink-soft)]">
                Get your healthcare business discovered by people in Alwar. Free to list, verified for trust.
              </p>
            </div>
            <Link to="/register" className="btn-primary shrink-0">
              <Fa6.FaBuilding size={13} /> Register Your Facility
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- WEBSITE SERVICE CTA ---------- */}
      <section className="pb-20">
        <div className="container-page">
          <div className="card flex flex-col items-start gap-6 border-[var(--color-sand-500)]/40 bg-[var(--color-sand-050)] p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div>
              <h2 className="text-2xl font-semibold text-[var(--color-ink)]">Need a Professional Website?</h2>
              <p className="mt-2 max-w-md text-sm text-[var(--color-ink-soft)]">
                Grow your healthcare business with a modern website, built and managed for you.
              </p>
            </div>
            <a href={`mailto:${WEBSITE_SERVICE_EMAIL}?subject=Website Request - Hospital Marketplace`} className="btn-accent shrink-0">
              <Fa6.FaEnvelope size={13} /> Request a Website
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
