import { pbkdf2, pbkdf2Sync } from './crypto';
import { DERIVE_ALGORITHM, PASS_KEY_SIZE } from './constants';

export interface KeyMetadata {
  derivedKey: Buffer;
  hmacKey: Buffer;
}

/**
 * Derive encryption and HMAC keys from password and salt
 * @param password - The password buffer
 * @param salt - The salt buffer
 * @param rounds - Number of PBKDF2 rounds
 * @returns Promise resolving to derived key metadata
 */
export async function deriveKey(password: Buffer, salt: Buffer, rounds: number): Promise<KeyMetadata> {
  const key = await pbkdf2(password, salt, rounds, PASS_KEY_SIZE, DERIVE_ALGORITHM);

  const hex = key.toString('hex');
  const half = hex.length / 2;

  return {
    derivedKey: Buffer.from(hex.substring(0, half), 'hex'),
    hmacKey: Buffer.from(hex.substring(half), 'hex')
  };
}

/**
 * Synchronous version of deriveKey
 * @param password - The password buffer
 * @param salt - The salt buffer
 * @param rounds - Number of PBKDF2 rounds
 * @returns Derived key metadata
 */
export function deriveKeySync(password: Buffer, salt: Buffer, rounds: number): KeyMetadata {
  const key = pbkdf2Sync(password, salt, rounds, PASS_KEY_SIZE, DERIVE_ALGORITHM);

  const hex = key.toString('hex');
  const half = hex.length / 2;

  return {
    derivedKey: Buffer.from(hex.substring(0, half), 'hex'),
    hmacKey: Buffer.from(hex.substring(half), 'hex')
  };
}
