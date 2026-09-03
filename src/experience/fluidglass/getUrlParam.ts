export function getUrlParam<T>(
  name: string,
  defaultValue: T,
  parseFn: (value: string) => T = (value) => value as T,
): T {
  const value = new URLSearchParams(window.location.search).get(name);
  if (value !== null) {
    try {
      return parseFn(value);
    } catch {
      // Preserve upstream behavior for malformed optional parameters.
    }
  }
  return defaultValue;
}

export function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace(/^#/, "");
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((value) => value + value)
          .join("")
      : normalized;
  const number = parseInt(expanded, 16);
  return [
    ((number >> 16) & 255) / 255,
    ((number >> 8) & 255) / 255,
    (number & 255) / 255,
  ];
}
