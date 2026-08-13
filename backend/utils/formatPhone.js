/**
 * Normalizes a phone number to the canonical Ugandan format: 256...
 * @param {string} phone 
 * @returns {string|null} The normalized phone number or null if invalid
 */
function formatPhone(phone) {
  if (!phone) return '';
  const digits = phone.toString().replace(/\D/g, '');
  const last9 = digits.slice(-9);
  return '256' + last9;
}

module.exports = formatPhone;
