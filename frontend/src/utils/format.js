export const formatDate = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const formatDateTime = (value) => {
  if (!value) return '';
  return new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const timeAgo = (value) => {
  if (!value) return '';
  const seconds = Math.floor((Date.now() - new Date(value).getTime()) / 1000);
  const steps = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ];
  for (const [unit, secs] of steps) {
    const amount = Math.floor(seconds / secs);
    if (amount >= 1) return `${amount} ${unit}${amount > 1 ? 's' : ''} ago`;
  }
  return 'just now';
};

// Very small opening-hours helper — returns { isOpen, label } for "today".
export const openStatus = (openingHours = []) => {
  if (!openingHours.length) return null;
  const dayMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const now = new Date();
  const today = dayMap[now.getDay()];
  const entry = openingHours.find((h) => h.day === today);
  if (!entry || entry.closed || !entry.open || !entry.close) return { isOpen: false, label: 'Closed today' };

  const [oh, om] = entry.open.split(':').map(Number);
  const [ch, cm] = entry.close.split(':').map(Number);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const openMins = oh * 60 + om;
  const closeMins = ch * 60 + cm;
  const isOpen = nowMins >= openMins && nowMins <= closeMins;
  return { isOpen, label: isOpen ? `Open until ${entry.close}` : `Closed · Opens ${entry.open}` };
};

export const truncate = (text = '', n = 140) => (text.length > n ? `${text.slice(0, n).trim()}…` : text);
