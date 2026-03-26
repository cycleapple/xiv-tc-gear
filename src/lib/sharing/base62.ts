/** Base62 encoding/decoding using BigInt */

const CHARSET = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const BASE = BigInt(CHARSET.length); // 62n

/** Encode a BigInt to a base62 string */
export function encode(n: bigint): string {
  if (n === 0n) return CHARSET[0];
  let result = '';
  let value = n;
  while (value > 0n) {
    result = CHARSET[Number(value % BASE)] + result;
    value = value / BASE;
  }
  return result;
}

/** Decode a base62 string to a BigInt */
export function decode(s: string): bigint {
  let result = 0n;
  for (const ch of s) {
    const idx = CHARSET.indexOf(ch);
    if (idx === -1) throw new Error(`Invalid base62 character: ${ch}`);
    result = result * BASE + BigInt(idx);
  }
  return result;
}
