import * as Fa6 from 'react-icons/fa6';
import { FACILITY_TYPES, FACILITY_TYPE_ICON, WEBSITE_SERVICE_EMAIL } from '@/utils/constants';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { LocationPicker } from '@/components/map/LocationPicker';

const Field = ({ label, error, children, required }) => (
  <div>
    <label className="label">
      {label} {required && <span className="text-[var(--color-sand-600)]">*</span>}
    </label>
    {children}
    {error && <p className="field-error">{error}</p>}
  </div>
);

export const StepFacilityType = ({ data, setData, errors }) => (
  <div className="space-y-5">
    <div>
      <h2 className="text-xl font-semibold text-[var(--color-ink)]">What type of facility are you registering?</h2>
      <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Choose the category that best describes your business.</p>
    </div>
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {FACILITY_TYPES.map((t) => {
        const Icon = Fa6[FACILITY_TYPE_ICON[t]] || Fa6.FaHospital;
        const active = data.facilityType === t;
        return (
          <button
            key={t}
            type="button"
            onClick={() => setData({ ...data, facilityType: t })}
            className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center text-xs font-medium transition-colors ${
              active ? 'border-[var(--color-teal-600)] bg-[var(--color-teal-050)] text-[var(--color-teal-700)]' : 'border-[var(--color-line)] text-[var(--color-ink-soft)] hover:border-[var(--color-teal-600)]/50'
            }`}
          >
            <Icon size={20} />
            {t}
          </button>
        );
      })}
    </div>
    {errors.facilityType && <p className="field-error">{errors.facilityType}</p>}

    {data.facilityType === 'Other' && (
      <Field label="Specify Facility Type" error={errors.customFacilityType} required>
        <input
          className="input"
          value={data.customFacilityType}
          onChange={(e) => setData({ ...data, customFacilityType: e.target.value })}
          placeholder="e.g. Ayurvedic Center"
        />
      </Field>
    )}
  </div>
);

export const StepBasicInfo = ({ data, setData, errors }) => (
  <div className="space-y-5">
    <div>
      <h2 className="text-xl font-semibold text-[var(--color-ink)]">Basic Information</h2>
      <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Tell us about your facility and create your login.</p>
    </div>
    <Field label="Facility Name" error={errors.name} required>
      <input className="input" value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} placeholder="e.g. Alwar City Hospital" />
    </Field>
    <Field label="Owner / Contact Person Name" error={errors.ownerName} required>
      <input className="input" value={data.ownerName} onChange={(e) => setData({ ...data, ownerName: e.target.value })} placeholder="e.g. Dr. Rajesh Sharma" />
    </Field>
    <Field label="Email" error={errors.email} required>
      <input type="email" className="input" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} placeholder="you@example.com" />
    </Field>
    <Field label="Password" error={errors.password} required>
      <PasswordInput value={data.password} onChange={(e) => setData({ ...data, password: e.target.value })} showChecklist autoComplete="new-password" />
    </Field>
    <Field label="Confirm Password" error={errors.confirmPassword} required>
      <PasswordInput value={data.confirmPassword} onChange={(e) => setData({ ...data, confirmPassword: e.target.value })} autoComplete="new-password" />
    </Field>
  </div>
);

export const StepContact = ({ data, setData, errors }) => (
  <div className="space-y-5">
    <div>
      <h2 className="text-xl font-semibold text-[var(--color-ink)]">Contact Information</h2>
      <p className="mt-1 text-sm text-[var(--color-ink-soft)]">How should patients and our team reach you?</p>
    </div>
    <PhoneInput label="Mobile Number 1" required value={data.mobile1} onChange={(v) => setData({ ...data, mobile1: v })} error={errors.mobile1} />
    <PhoneInput label="Mobile Number 2 (optional)" value={data.mobile2} onChange={(v) => setData({ ...data, mobile2: v })} error={errors.mobile2} />
  </div>
);

export const StepLocation = ({ data, setData, errors }) => (
  <div className="space-y-5">
    <div>
      <h2 className="text-xl font-semibold text-[var(--color-ink)]">Location</h2>
      <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Pinpoint your facility so patients can find and navigate to it.</p>
    </div>
    <Field label="Address" error={errors.address} required>
      <input className="input" value={data.address} onChange={(e) => setData({ ...data, address: e.target.value })} placeholder="Building, street" />
    </Field>
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label="Area / Locality" error={errors.locality}>
        <input className="input" value={data.locality} onChange={(e) => setData({ ...data, locality: e.target.value })} placeholder="e.g. Company Bagh" />
      </Field>
      <Field label="Pincode" error={errors.pincode} required>
        <input className="input" value={data.pincode} onChange={(e) => setData({ ...data, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} placeholder="301001" />
      </Field>
      <Field label="City" error={errors.city} required>
        <input className="input" value={data.city} onChange={(e) => setData({ ...data, city: e.target.value })} />
      </Field>
      <Field label="State" error={errors.state} required>
        <input className="input" value={data.state} onChange={(e) => setData({ ...data, state: e.target.value })} />
      </Field>
    </div>

    <Field label="Pin Exact Location on Map" error={errors.location} required>
      <LocationPicker
        latitude={data.latitude}
        longitude={data.longitude}
        address={data.resolvedAddress}
        onChange={(next) => setData({ ...data, ...next })}
      />
    </Field>
  </div>
);

export const StepWebsite = ({ data, setData, errors }) => (
  <div className="space-y-5">
    <div>
      <h2 className="text-xl font-semibold text-[var(--color-ink)]">Website</h2>
      <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Do you have your own website?</p>
    </div>

    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <button
        type="button"
        onClick={() => setData({ ...data, hasWebsite: true, wantsWebsite: false })}
        className={`rounded-xl border p-4 text-left text-sm font-medium transition-colors ${
          data.hasWebsite === true ? 'border-[var(--color-teal-600)] bg-[var(--color-teal-050)] text-[var(--color-teal-700)]' : 'border-[var(--color-line)] text-[var(--color-ink-soft)]'
        }`}
      >
        Yes, I already have a website
      </button>
      <button
        type="button"
        onClick={() => setData({ ...data, hasWebsite: false, websiteUrl: '' })}
        className={`rounded-xl border p-4 text-left text-sm font-medium transition-colors ${
          data.hasWebsite === false ? 'border-[var(--color-teal-600)] bg-[var(--color-teal-050)] text-[var(--color-teal-700)]' : 'border-[var(--color-line)] text-[var(--color-ink-soft)]'
        }`}
      >
        No, I want a website
      </button>
    </div>

    {data.hasWebsite === true && (
      <Field label="Website URL" error={errors.websiteUrl} required>
        <input className="input" value={data.websiteUrl} onChange={(e) => setData({ ...data, websiteUrl: e.target.value })} placeholder="https://yourfacility.com" />
      </Field>
    )}

    {data.hasWebsite === false && (
      <div className="card border-[var(--color-sand-500)]/40 bg-[var(--color-sand-050)] p-5">
        <div className="flex items-start gap-3">
          <Fa6.FaWandMagicSparkles className="mt-0.5 shrink-0 text-[var(--color-sand-700)]" size={18} />
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">Need a professional website for your healthcare business?</h3>
            <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
              We can build and manage a modern website for your facility. Reach out to{' '}
              <a href={`mailto:${WEBSITE_SERVICE_EMAIL}`} className="font-medium text-[var(--color-teal-700)]">{WEBSITE_SERVICE_EMAIL}</a>{' '}
              or just check the box below — we'll follow up after you register.
            </p>
            <label className="mt-3 flex items-center gap-2 text-sm font-medium text-[var(--color-ink)]">
              <input
                type="checkbox"
                checked={data.wantsWebsite}
                onChange={(e) => setData({ ...data, wantsWebsite: e.target.checked })}
                className="h-4 w-4 accent-[var(--color-sand-600)]"
              />
              Yes, request a website for my facility
            </label>
          </div>
        </div>
      </div>
    )}
  </div>
);

export const StepReview = ({ data, setData, errors }) => (
  <div className="space-y-5">
    <div>
      <h2 className="text-xl font-semibold text-[var(--color-ink)]">Review &amp; Submit</h2>
      <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Please confirm your details before submitting.</p>
    </div>

    <div className="card divide-y divide-[var(--color-line)] p-1 text-sm">
      {[
        ['Facility Type', data.facilityType === 'Other' ? data.customFacilityType : data.facilityType],
        ['Facility Name', data.name],
        ['Owner / Contact', data.ownerName],
        ['Email', data.email],
        ['Mobile 1', data.mobile1 ? `+91 ${data.mobile1}` : ''],
        ['Mobile 2', data.mobile2 ? `+91 ${data.mobile2}` : '—'],
        ['Address', `${data.address}, ${data.locality ? data.locality + ', ' : ''}${data.city}, ${data.state} ${data.pincode}`],
        ['Website', data.hasWebsite ? data.websiteUrl : data.wantsWebsite ? 'Requested a new website' : 'Not provided'],
      ].map(([label, value]) => (
        <div key={label} className="flex items-start justify-between gap-4 px-4 py-3">
          <span className="text-[var(--color-ink-soft)]">{label}</span>
          <span className="text-right font-medium text-[var(--color-ink)]">{value || '—'}</span>
        </div>
      ))}
    </div>

    <label className="flex items-start gap-3 rounded-xl border border-[var(--color-line)] p-4 text-sm text-[var(--color-ink-soft)]">
      <input
        type="checkbox"
        checked={data.agreedToTerms}
        onChange={(e) => setData({ ...data, agreedToTerms: e.target.checked })}
        className="mt-0.5 h-4 w-4 accent-[var(--color-teal-600)]"
      />
      I confirm that the information provided is accurate and I agree to the{' '}
      <a href="/terms" target="_blank" className="font-medium text-[var(--color-teal-700)] underline">Terms &amp; Conditions</a> and{' '}
      <a href="/privacy-policy" target="_blank" className="font-medium text-[var(--color-teal-700)] underline">Privacy Policy</a>.
    </label>
    {errors.agreedToTerms && <p className="field-error">{errors.agreedToTerms}</p>}
  </div>
);
