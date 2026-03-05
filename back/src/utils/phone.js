const DIGITS_ONLY_REGEX = /\D/g;
const E164_REGEX = /^\+[1-9]\d{7,14}$/;

export const normalizePhoneNumber = (rawValue, { defaultCountryPrefix = "+57" } = {}) => {
  if (rawValue === undefined || rawValue === null) {
    return null;
  }

  const value = String(rawValue).trim();
  if (!value) {
    return null;
  }

  const digits = value.replace(DIGITS_ONLY_REGEX, "");
  if (!digits) {
    return null;
  }

  if (value.startsWith("+")) {
    const normalized = `+${digits}`;
    return E164_REGEX.test(normalized) ? normalized : null;
  }

  const countryDigits = defaultCountryPrefix.replace(DIGITS_ONLY_REGEX, "");
  const normalized = digits.startsWith(countryDigits)
    ? `+${digits}`
    : `${defaultCountryPrefix}${digits}`;

  return E164_REGEX.test(normalized) ? normalized : null;
};
