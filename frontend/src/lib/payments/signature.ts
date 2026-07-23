/**
 * Payfast signature generation
 *
 * Generates an MD5 hash of urlencoded, sorted parameters + passphrase.
 * Matches PHP http_build_query behavior.
 */
import crypto from 'crypto';

function encodeParam(key: string, value: string): string {
  const encodedKey = encodeURIComponent(key);
  const encodedValue = encodeURIComponent(value);
  return `${encodedKey}=${encodedValue}`;
}

export function generateApiSignature(data: Record<string, unknown>, passphrase: string): string {
  const pfData = { ...data };

  if (passphrase) {
    pfData['passphrase'] = passphrase;
  }

  const sortedKeys = Object.keys(pfData).sort((a, b) => a.localeCompare(b));

  const pairs = sortedKeys
    .filter((key) => {
      const value = pfData[key];
      return value !== undefined && value !== null && value !== '';
    })
    .map((key) => encodeParam(key, String(pfData[key])));

  const paramString = pairs.join('&');

  return crypto.createHash('md5').update(paramString).digest('hex');
}
