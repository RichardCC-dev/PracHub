export const sanitizeText = (value) => value.replace(/[<>]/g, '').trim();

export const sanitizePayload = (payload) => Object.fromEntries(
  Object.entries(payload).map(([key, value]) => [
    key,
    typeof value === 'string' ? sanitizeText(value) : value,
  ]),
);
