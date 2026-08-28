export const formatPatientName = ({ first_name, last_name, display_id }) => {
  const first = first_name?.trim();
  const last = last_name?.trim();
  
  if (first && last) return `${first} ${last}`;
  if (first || last) return `${first || last} (${display_id})`;
  if (display_id) return `Patient ${display_id}`;
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
