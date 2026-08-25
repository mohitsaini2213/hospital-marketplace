import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as Fa6 from 'react-icons/fa6';
import { facilityService } from '@/services/facilityService';
import { VerifiedBadge } from '@/components/ui/StatusBadge';
import { FacilityMap } from '@/components/map/FacilityMap';
import { Modal } from '@/components/ui/Modal';
import { Spinner, EmptyState } from '@/components/ui/Loading';
import { useToast } from '@/context/ToastContext';
import { useSeo } from '@/hooks/useSeo';
import { FACILITY_TYPE_ICON, DAYS } from '@/utils/constants';
import { openStatus, truncate } from '@/utils/format';

export const FacilityDetailsPage = () => {
  const { idOrSlug } = useParams();
  const toast = useToast();
  const [facility, setFacility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    setLoading(true);
    setError(false);
    facilityService
      .get(idOrSlug)
      .then((res) => setFacility(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [idOrSlug]);

  useSeo({
    title: facility ? `${facility.name} — ${facility.facilityType} in ${facility.city}` : undefined,
    description: facility
      ? truncate(facility.description || `${facility.name} is a ${facility.facilityType.toLowerCase()} located in ${facility.city}, Rajasthan.`, 155)
      : undefined,
    image: facility?.images?.[0]?.url,
    path: `/facility/${facility?.slug || facility?._id || ''}`,
  });

  // Structured data (schema.org MedicalBusiness) for richer search results.
  useEffect(() => {
    if (!facility) return;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'MedicalBusiness',
      name: facility.name,
      description: facility.description,
      telephone: facility.mobile1,
      address: {
        '@type': 'PostalAddress',
        streetAddress: facility.address,
        addressLocality: facility.city,
        addressRegion: facility.state,
        postalCode: facility.pincode,
        addressCountry: 'IN',
      },
      geo: { '@type': 'GeoCoordinates', latitude: facility.latitude, longitude: facility.longitude },
      url: facility.websiteUrl,
    });
    document.head.appendChild(script);
    return () => document.head.removeChild(script);
  }, [facility]);


  const submitReport = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await facilityService.report(facility._id, { reason: reportReason, details: reportDetails });
      toast.success('Thanks — our team will review this shortly.');
      setReportOpen(false);
      setReportReason('');
      setReportDetails('');
    } catch {
      toast.error('Could not submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-[var(--color-teal-600)]">
        <Spinner size={26} />
      </div>
    );
  }

  if (error || !facility) {
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={Fa6.FaTriangleExclamation}
          title="Facility not found"
          description="This listing may have been removed or is pending verification."
          action={
            <Link to="/directory" className="btn-primary">
              Back to Directory
            </Link>
          }
        />
      </div>
    );
  }

  const Icon = Fa6[FACILITY_TYPE_ICON[facility.facilityType]] || Fa6.FaHospital;
  const status = openStatus(facility.openingHours);
  const cover = facility.images?.[activeImage] || facility.images?.[0];

  return (
    <div className="container-page py-10">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="eyebrow">
            <Icon size={11} /> {facility.facilityType}
          </span>
          <h1 className="mt-2 text-3xl font-semibold text-[var(--color-ink)]">{facility.name}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            {facility.verified && <VerifiedBadge />}
            {status && (
              <span className={`text-sm font-medium ${status.isOpen ? 'text-[var(--color-green-600)]' : 'text-[var(--color-ink-soft)]'}`}>
                {status.label}
              </span>
            )}
            {facility.ratingCount > 0 && (
              <span className="flex items-center gap-1 text-sm font-medium text-[var(--color-sand-700)]">
                <Fa6.FaStar size={13} /> {facility.ratingAverage.toFixed(1)} ({facility.ratingCount} reviews)
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Link to={`/facility/${facility.slug || facility._id}/appointment`} className="btn-primary">
            <Fa6.FaCalendarCheck size={13} /> Book Appointment
          </Link>
          {facility.mobile1 && (
            <a href={`tel:${facility.mobile1}`} className="btn-secondary">
              <Fa6.FaPhone size={13} /> Call
            </a>
          )}
          {facility.websiteUrl && (
            <a href={facility.websiteUrl} target="_blank" rel="noreferrer" className="btn-secondary">
              <Fa6.FaGlobe size={13} /> Website
            </a>
          )}
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="btn-secondary"
          >
            <Fa6.FaDiamondTurnRight size={13} /> Directions
          </a>
        </div>
      </div>

      {/* Photos */}
      {facility.images?.length > 0 && (
        <div className="mb-8">
          <div className="mb-2 h-72 w-full overflow-hidden rounded-xl bg-[var(--color-teal-050)] sm:h-96">
            <img src={cover.url} alt={facility.name} className="h-full w-full object-cover" />
          </div>
          {facility.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {facility.images.map((img, i) => (
                <button
                  key={img.publicId || i}
                  onClick={() => setActiveImage(i)}
                  className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 ${i === activeImage ? 'border-[var(--color-teal-600)]' : 'border-transparent'}`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          {facility.description && (
            <section>
              <h2 className="mb-2 text-lg font-semibold text-[var(--color-ink)]">About</h2>
              <p className="text-sm leading-relaxed text-[var(--color-ink-soft)]">{facility.description}</p>
            </section>
          )}

          {facility.services?.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-[var(--color-ink)]">Services</h2>
              <div className="flex flex-wrap gap-2">
                {facility.services.map((s) => (
                  <span key={s} className="rounded-full bg-[var(--color-teal-050)] px-3 py-1.5 text-xs font-medium text-[var(--color-teal-700)]">
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}

          {facility.openingHours?.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-[var(--color-ink)]">Opening Hours</h2>
              <div className="card divide-y divide-[var(--color-line)] p-1">
                {DAYS.map((day) => {
                  const entry = facility.openingHours.find((h) => h.day === day);
                  return (
                    <div key={day} className="flex items-center justify-between px-4 py-2.5 text-sm">
                      <span className="font-medium text-[var(--color-ink)]">{day}</span>
                      <span className="text-[var(--color-ink-soft)]">
                        {!entry || entry.closed ? 'Closed' : `${entry.open} – ${entry.close}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <section>
            <h2 className="mb-3 text-lg font-semibold text-[var(--color-ink)]">Location</h2>
            <FacilityMap singleMarker={{ ...facility, name: facility.name }} height="320px" zoom={15} />
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-semibold text-[var(--color-ink)]">Contact Information</h3>
            <ul className="space-y-3 text-sm text-[var(--color-ink-soft)]">
              <li className="flex items-start gap-2.5">
                <Fa6.FaLocationDot size={14} className="mt-0.5 shrink-0 text-[var(--color-teal-600)]" />
                <span>
                  {facility.address}, {facility.locality && `${facility.locality}, `}
                  {facility.city}, {facility.state} {facility.pincode}
                </span>
              </li>
              {facility.mobile1 && (
                <li className="flex items-center gap-2.5">
                  <Fa6.FaPhone size={13} className="shrink-0 text-[var(--color-teal-600)]" />
                  <a href={`tel:${facility.mobile1}`} className="hover:text-[var(--color-teal-700)]">{facility.mobile1}</a>
                </li>
              )}
              {facility.mobile2 && (
                <li className="flex items-center gap-2.5">
                  <Fa6.FaPhone size={13} className="shrink-0 text-[var(--color-teal-600)]" />
                  <a href={`tel:${facility.mobile2}`} className="hover:text-[var(--color-teal-700)]">{facility.mobile2}</a>
                </li>
              )}
              {facility.email && (
                <li className="flex items-center gap-2.5">
                  <Fa6.FaEnvelope size={13} className="shrink-0 text-[var(--color-teal-600)]" />
                  <a href={`mailto:${facility.email}`} className="hover:text-[var(--color-teal-700)] break-all">{facility.email}</a>
                </li>
              )}
              {facility.websiteUrl && (
                <li className="flex items-center gap-2.5">
                  <Fa6.FaGlobe size={13} className="shrink-0 text-[var(--color-teal-600)]" />
                  <a href={facility.websiteUrl} target="_blank" rel="noreferrer" className="break-all hover:text-[var(--color-teal-700)]">
                    {facility.websiteUrl.replace(/^https?:\/\//, '')}
                  </a>
                </li>
              )}
            </ul>
          </div>

          <button
            onClick={() => setReportOpen(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--color-line)] px-4 py-3 text-xs font-medium text-[var(--color-ink-soft)] hover:border-[var(--color-red-600)]/40 hover:text-[var(--color-red-600)]"
          >
            <Fa6.FaFlag size={12} /> Report Incorrect Information
          </button>
        </aside>
      </div>

      <Modal open={reportOpen} onClose={() => setReportOpen(false)} title="Report Incorrect Information">
        <form onSubmit={submitReport} className="space-y-4">
          <div>
            <label className="label">What's incorrect?</label>
            <select value={reportReason} onChange={(e) => setReportReason(e.target.value)} required className="input">
              <option value="">Select a reason</option>
              <option value="Wrong contact number">Wrong contact number</option>
              <option value="Wrong address / location">Wrong address / location</option>
              <option value="Wrong opening hours">Wrong opening hours</option>
              <option value="Facility closed permanently">Facility closed permanently</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="label">Additional details (optional)</label>
            <textarea value={reportDetails} onChange={(e) => setReportDetails(e.target.value)} rows={3} className="input" />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full">
            {submitting ? 'Submitting…' : 'Submit Report'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
