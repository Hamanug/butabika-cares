export const formatPatientName = (user) => {
  if (!user) return 'Unknown User';
  if (user.first_name || user.last_name) {
    const first = user.first_name || '';
    const last = user.last_name || '';
    return `${first} ${last}`.trim();
  }
  return `Patient #${user.display_id || 'Unknown'}`;
};

export const formatUserName = (user) => {
  if (!user) return 'Unknown User';
  if (user.role === 'therapist') {
    const first = user.first_name || (user.name ? user.name.split(' ')[0] : '');
    const last = user.last_name || (user.name ? user.name.split(' ').slice(1).join(' ') : '');
    if (!first && !last) return 'Dr. Therapist';
    return `Dr. ${first} ${last}`.trim();
  }
  return formatPatientName(user);
};

export const getPatientAvatar = (user) => {
  if (!user) return 'U';
  const first = user.first_name || '';
  const last = user.last_name || '';
  if (first || last) {
    return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  }
  return 'P';
};
