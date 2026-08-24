// Small dependency-free helper to set per-page SEO tags. We avoid pulling in
// react-helmet-async for a handful of tags — this covers title, description,
// canonical URL, and Open Graph basics, and cleans up on unmount.
import { useEffect } from 'react';

const setMeta = (attr, key, content) => {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

const setCanonical = (href) => {
  if (!href) return;
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
};

const DEFAULT_TITLE = 'Hospital Marketplace — Find Trusted Healthcare Services Near You';
const DEFAULT_DESCRIPTION =
  'Discover verified hospitals, clinics, pharmacies and diagnostic centers in Alwar, Rajasthan. Search, compare, and get directions to trusted healthcare facilities.';

export const useSeo = ({ title, description, image, path } = {}) => {
  useEffect(() => {
    const fullTitle = title ? `${title} — Hospital Marketplace` : DEFAULT_TITLE;
    document.title = fullTitle;

    setMeta('name', 'description', description || DEFAULT_DESCRIPTION);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description || DEFAULT_DESCRIPTION);
    if (image) setMeta('property', 'og:image', image);
    if (path) {
      setCanonical(`${window.location.origin}${path}`);
      setMeta('property', 'og:url', `${window.location.origin}${path}`);
    }

    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title, description, image, path]);
};
