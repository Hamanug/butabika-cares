export const formatPatientName = (user) => {
  if (!user) return 'Patient';

  // Renders cleanly as: "Patient #4921-8832"
  if (user.display_id) {
    return `Patient ${user.display_id}`;
  }

  return 'Anonymous Patient'; 
};

export const formatUserName = (user) => {
  if (!user) return 'Unknown User';
  if (user.role === 'therapist') {
    const first = user.first_name || (user.name ? user.name.split(' ')[0] : '');
    const last = user.last_name || (user.name ? user.name.split(' ').slice(1).join(' ') : '');
    const title = user.title ? `${user.title} ` : ''; 

    if (!first && !last) return user.title ? `${user.title} Therapist` : 'Therapist';
    return `${title}${first} ${last}`.trim();
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
