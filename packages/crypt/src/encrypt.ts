import * as crypto from 'node:crypto';
import {
  deriveKey,
  deriveKeySync,
  ENCRYPT_ALGORITHM,
  HMAC_ALGORITHM,
  IV_LENGTH,
  PASS_LENGTH,
  PBKDF2_ROUNDS,
  ROUNDS_SIZE,
  SALT_LENGTH,
  MARKER_BUFFER,
  KeyMetadata
} from './utility';
import { CryptError, CryptErrorCode } from './errors';

/**
 * Validate the inputs for the encrypt function
 * @param password - The password buffer (must be at least PASS_LENGTH bytes)
 * @param iv - The initialization vector (must be IV_LENGTH bytes)
 * @param salt - The salt buffer (must be SALT_LENGTH bytes)
 * @param rounds - The number of PBKDF2 rounds (must be between 1000 and 10000000)
 */
function validateInputs(password: Buffer, iv: Buffer, salt: Buffer, rounds: number) {
  // Validate inputs
  if (password.length < PASS_LENGTH) {
    throw new CryptError(CryptErrorCode.PASSWORD_TOO_SHORT, 'Password too short', {
      actualSize: password.length,
      expectedSize: PASS_LENGTH,
      operation: 'encrypt'
    });
  }

  if (password.length > 1024) {
    throw new CryptError(CryptErrorCode.PASSWORD_TOO_LONG, 'Password too long', {
      actualSize: password.length,
      expectedSize: 1024,
      operation: 'encrypt'
    });
  }

  if (salt.length !== SALT_LENGTH) {
    throw new CryptError(CryptErrorCode.INVALID_SALT_LENGTH, 'Invalid salt length', {
      actualSize: salt.length,
      expectedSize: SALT_LENGTH,
      operation: 'encrypt'
    });
  }

  if (iv.length !== IV_LENGTH) {
    throw new CryptError(CryptErrorCode.INVALID_IV_LENGTH, 'Invalid IV length', {
      actualSize: iv.length,
      expectedSize: IV_LENGTH,
      operation: 'encrypt'
    });
  }

  if (rounds < 1000 || rounds > 10000000) {
    throw new CryptError(
      CryptErrorCode.INVALID_ROUNDS,
      `Invalid rounds: ${rounds}. Must be between 1000 and 10000000`,
      {
        actualSize: rounds,
        expectedSize: 1000,
        operation: 'encrypt',
        additionalInfo: { rounds }
      }
    );
  }
}

/**
 * Encrypt a buffer using AES-256-CBC with HMAC authentication
 * @param buffer - The data to encrypt
 * @param keyInfo - The key metadata
 * @param iv - The initialization vector
 * @param salt - The salt
 * @param rounds - The number of PBKDF2 rounds
 */
function encryptBuffer(buffer: Buffer, keyInfo: KeyMetadata, iv: Buffer, salt: Buffer, rounds: number) {
  const roundsBuffer = Buffer.alloc(ROUNDS_SIZE);
  roundsBuffer.writeUInt32LE(rounds, 0);

  const cipher = crypto.createCipheriv(ENCRYPT_ALGORITHM, keyInfo.derivedKey, iv);
  const hmac = crypto.createHmac(HMAC_ALGORITHM, keyInfo.hmacKey);

  const data = Buffer.concat([cipher.update(buffer), cipher.final()]);

  hmac.update(MARKER_BUFFER);
  hmac.update(roundsBuffer);
  hmac.update(data);
  hmac.update(iv);
  hmac.update(salt);

  const digest = hmac.digest();

  return Buffer.concat([MARKER_BUFFER, roundsBuffer, iv, salt, digest, data]);
}

/**
 * Asynchronously encrypt a buffer using AES-256-CBC with HMAC authentication
 * @param buffer - The data to encrypt
 * @param password - The password buffer (must be at least PASS_LENGTH bytes)
 * @param iv - The initialization vector (must be IV_LENGTH bytes)
 * @param salt - The salt buffer (must be SALT_LENGTH bytes)
 * @param rounds - Optional number of PBKDF2 rounds (defaults to PBKDF2_ROUNDS)
 * @returns Promise resolving to encrypted buffer
 * @throws EncryptError if validation fails
 */
export async function encrypt(
  buffer: Buffer,
  password: Buffer,
  iv: Buffer,
  salt: Buffer,
  rounds: number = PBKDF2_ROUNDS
): Promise<Buffer> {
  validateInputs(password, iv, salt, rounds);

  return encryptBuffer(buffer, await deriveKey(password, salt, rounds), iv, salt, rounds);
}

/**
 * Synchronously encrypt a buffer using AES-256-CBC with HMAC authentication
 * @param buffer - The data to encrypt
 * @param password - The password buffer (must be at least PASS_LENGTH bytes)
 * @param iv - The initialization vector (must be IV_LENGTH bytes)
 * @param salt - The salt buffer (must be SALT_LENGTH bytes)
 * @param rounds - Optional number of PBKDF2 rounds (defaults to PBKDF2_ROUNDS)
 * @returns Encrypted buffer
 * @throws EncryptError if validation fails
 */
export function encryptSync(
  buffer: Buffer,
  password: Buffer,
  iv: Buffer,
  salt: Buffer,
  rounds: number = PBKDF2_ROUNDS
): Buffer {
  validateInputs(password, iv, salt, rounds);

  return encryptBuffer(buffer, deriveKeySync(password, salt, rounds), iv, salt, rounds);
}
