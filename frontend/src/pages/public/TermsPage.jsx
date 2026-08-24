const Section = ({ title, children }) => (
  <section className="mt-8">
    <h2 className="text-lg font-semibold text-[var(--color-ink)]">{title}</h2>
    <div className="mt-2 space-y-2 text-sm leading-relaxed text-[var(--color-ink-soft)]">{children}</div>
  </section>
);

export const TermsPage = () => (
  <div className="container-page max-w-2xl py-16">
    <h1 className="text-3xl font-semibold text-[var(--color-ink)]">Terms &amp; Conditions</h1>
    <p className="mt-2 text-sm text-[var(--color-ink-soft)]">Last updated: August 2026</p>

    <Section title="1. Accuracy of Information">
      <p>
        By registering a facility, you confirm that all information provided — including
        contact details, location, and services — is accurate and that you are authorized to
        register the facility on Hospital Marketplace.
      </p>
    </Section>

    <Section title="2. Listing Review">
      <p>
        All new registrations are reviewed by our team before appearing publicly. We reserve the
        right to reject or suspend listings that violate these terms or contain misleading
        information.
      </p>
    </Section>

    <Section title="3. Free Registration">
      <p>Listing your facility on Hospital Marketplace is free. We do not charge for standard registration or approval.</p>
    </Section>

    <Section title="4. Account Responsibility">
      <p>
        You are responsible for keeping your login credentials confidential and for all activity
        under your account.
      </p>
    </Section>

    <Section title="5. Content Guidelines">
      <p>
        Reviews and facility descriptions must not contain false medical claims, spam, or
        offensive content. We moderate reviews before they appear publicly.
      </p>
    </Section>

    <Section title="6. Limitation of Liability">
      <p>
        Hospital Marketplace is a directory service. We do not provide medical advice and are not
        responsible for the quality of care provided by listed facilities.
      </p>
    </Section>

    <Section title="7. Changes to These Terms">
      <p>We may update these terms from time to time. Continued use of the platform after changes constitutes acceptance.</p>
    </Section>
  </div>
);
