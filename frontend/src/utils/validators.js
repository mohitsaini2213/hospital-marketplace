export const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '');

export const isValidIndianMobile = (value) => /^(\+91)?[6-9][0-9]{9}$/.test((value || '').replace(/\s/g, ''));

export const isValidPincode = (value) => /^[1-9][0-9]{5}$/.test(value || '');

export const passwordChecks = (value = '') => ({
  length: value.length >= 8,
  upper: /[A-Z]/.test(value),
  lower: /[a-z]/.test(value),
  number: /[0-9]/.test(value),
  special: /[^A-Za-z0-9]/.test(value),
});

export const isValidPassword = (value) => Object.values(passwordChecks(value)).every(Boolean);

export const isValidUrl = (value) => {
  if (!value) return false;
  try {
    const u = new URL(value);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

export const normalizeMobile = (value = '') => {
  const digits = value.replace(/\D/g, '').slice(-10);
  return digits ? `+91${digits}` : '';
};
