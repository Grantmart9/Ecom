import { describe, it, expect } from 'vitest';
import { generateApiSignature } from '../signature';

describe('generateApiSignature', () => {
  it('returns md5 hash of sorted urlencoded params plus passphrase', () => {
    const result = generateApiSignature(
      {
        'merchant-id': '10000100',
        version: 'v1',
        timestamp: '2020-04-01T12:00:01+02:00',
      },
      'passphrase',
    );

    expect(result).toBe('8e237e61984b20b67d69344bd6e57cdb');
  });

  it('sorts keys alphabetically before hashing', () => {
    const result = generateApiSignature(
      {
        timestamp: '2020-04-01T12:00:01+02:00',
        'merchant-id': '10000100',
        version: 'v1',
      },
      'passphrase',
    );

    expect(result).toBe('8e237e61984b20b67d69344bd6e57cdb');
  });

  it('produces a valid 32-character lowercase hex md5 hash', () => {
    const result = generateApiSignature(
      {
        foo: 'bar',
        baz: 'qux',
      },
      'secret',
    );

    expect(result).toHaveLength(32);
    expect(/^[0-9a-f]+$/.test(result)).toBe(true);
  });

  it('is deterministic', () => {
    const data = {
      'merchant-id': '10000100',
      version: 'v1',
      timestamp: '2020-04-01T12:00:01+02:00',
    };
    const first = generateApiSignature(data, 'passphrase');
    const second = generateApiSignature(data, 'passphrase');
    expect(first).toBe(second);
  });

  it('excludes empty string values from signature', () => {
    const result = generateApiSignature(
      {
        foo: '',
        bar: 'value',
      },
      'pass',
    );

    expect(result).toBeDefined();
    expect(/^[0-9a-f]+$/.test(result)).toBe(true);
  });

  it('includes passphrase in signature params', () => {
    const withPhrase = generateApiSignature({ foo: 'bar' }, 'secret');
    const withoutPhrase = generateApiSignature({ foo: 'bar' }, '');

    expect(withPhrase).not.toBe(withoutPhrase);
  });
});
