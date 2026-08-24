import { WEBSITE_SERVICE_EMAIL } from '@/utils/constants';

const Section = ({ title, children }) => (
  <section className="mt-8">
    <h2 className="text-lg font-semibold text-[var(--color-ink)]">{title}</h2>
    <div className="mt-2 space-y-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">{children}</div>
  </section>
);

export const PrivacyPolicyPage = () => (
  <div className="container-page max-w-2xl py-16">
    <h1 className="text-3xl font-semibold text-[var(--color-ink)]">Privacy Policy</h1>
    <p className="mt-2 text-sm text-[var(--color-ink-soft)]">Last updated: August 2026</p>

    <Section title="What Information We Collect">
      <p>
        When you register a facility, we collect your facility name, owner/contact name, email,
        password, mobile numbers, business address, and precise map location. When you browse the
        site, we do not require an account.
      </p>
    </Section>

    <Section title="Why We Collect It">
      <p>
        We use this information to verify and display your facility listing, to contact you about
        your registration status, and to help patients find and reach your facility.
      </p>
    </Section>

    <Section title="How Information Is Stored">
      <p>
        Passwords are never stored in plain text — they are hashed using industry-standard bcrypt
        hashing before being saved. We never return password hashes or authentication secrets in
        any API response.
      </p>
    </Section>

    <Section title="Location Data">
      <p>
        Facility location (latitude/longitude) is collected only for facilities you register, so
        patients can find your business on the map and get directions. We do not track visitor
        location unless you explicitly use "Use current location" while registering.
      </p>
    </Section>

    <Section title="Contact Information">
      <p>
        Your contact details are shown publicly only after your listing is approved, so patients
        can reach you. Contact details submitted for a website request are used solely to follow
        up about that request.
      </p>
    </Section>

    <Section title="Cookies &amp; Authentication">
      <p>
        We use a secure, HTTP-only cookie to keep facility and admin accounts logged in. This
        cookie cannot be read by scripts and is not used for advertising or tracking.
      </p>
    </Section>

    <Section title="Your Rights">
      <p>
        You can update or correct your facility's information at any time from your dashboard, or
        by contacting us at{' '}
        <a href={`mailto:${WEBSITE_SERVICE_EMAIL}`} className="font-medium text-[var(--color-teal-700)]">{WEBSITE_SERVICE_EMAIL}</a>.
        You may also request deletion of your account and listing.
      </p>
    </Section>
  </div>
);
