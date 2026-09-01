/**
 * Normalizes a phone number to the canonical Ugandan format: 256...
 * @param {string} phone 
 * @returns {string|null} The normalized phone number or null if invalid
 */
function formatPhone(phone) {
  if (!phone) return null;
  const digits = phone.toString().replace(/\D/g, '');
  
  if (digits.length === 9 && digits.startsWith('7')) return '256' + digits;
  if (digits.length === 10 && digits.startsWith('07')) return '256' + digits.slice(1);
  if (digits.length === 12 && digits.startsWith('2567')) return digits;
  
  return null;
}

module.exports = formatPhone;
