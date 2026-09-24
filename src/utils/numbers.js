/**
 * Converts Eastern Arabic (Kurdish / Persian / Arabic) numerals to Latin digits.
 *
 * Handles:
 *   Arabic-Indic  U+0660-U+0669  0123456789 (Arabic)
 *   Extended / Persian  U+06F0-U+06F9  0123456789 (Persian/Kurdish)
 *
 * Non-digit characters pass through unchanged, so it is safe to apply to any input value.
 *
 * @param {*} str - Any value; coerced to string.
 * @returns {string} The value with Kurdish/Arabic digits replaced by Latin digits.
 */
export function toLatinDigits(str) {
  if (str === null || str === undefined) return str;
  return String(str)
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[\u06f0-\u06f9]/g, (d) => String(d.charCodeAt(0) - 0x06f0));
}
