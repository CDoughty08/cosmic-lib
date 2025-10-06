import * as crypto from 'node:crypto';
import {
  deriveKey,
  deriveKeySync,
  ENCRYPT_ALGORITHM,
  EncryptedData,
  HMAC_ALGORITHM,
  KeyMetadata,
  MARKER_BUFFER,
  unpack
} from './utility';
import { CryptError, CryptErrorCode } from './errors';

function decryptBuffer(encrypted: EncryptedData, keyInfo: KeyMetadata): Buffer {
  const hmac = crypto.createHmac(HMAC_ALGORITHM, keyInfo.hmacKey);

  hmac.update(MARKER_BUFFER);
  hmac.update(encrypted.rounds);
  hmac.update(encrypted.encrypted);
  hmac.update(encrypted.iv);
  hmac.update(encrypted.salt);

  const digest = hmac.digest();

  if (!crypto.timingSafeEqual(encrypted.hmac, digest)) {
    throw new CryptError(CryptErrorCode.AUTHENTICATION_FAILED, 'Authentication failed', {
      operation: 'decrypt',
      additionalInfo: {
        expectedHmac: encrypted.hmac.toString('hex'),
        actualHmac: digest.toString('hex')
      }
    });
  }

  const cipher = crypto.createDecipheriv(ENCRYPT_ALGORITHM, keyInfo.derivedKey, encrypted.iv);

  const deciphered = Buffer.concat([cipher.update(encrypted.encrypted), cipher.final()]);

  return deciphered;
}

/**
 * Asynchronously decrypt a buffer using AES-256-CBC with HMAC authentication
 * @param buffer - The encrypted data buffer
 * @param password - The password buffer used for encryption
 * @returns Promise resolving to decrypted buffer
 * @throws DecryptError if authentication fails or data is invalid
 * @throws UnpackError if the buffer format is invalid
 */
export async function decrypt(buffer: Buffer, password: Buffer): Promise<Buffer> {
  const data = unpack(buffer);
  const rounds = data.rounds.readUInt32LE(0);
  const keyInfo = await deriveKey(password, data.salt, rounds);

  return decryptBuffer(data, keyInfo);
}

/**
 * Synchronously decrypt a buffer using AES-256-CBC with HMAC authentication
 * @param buffer - The encrypted data buffer
 * @param password - The password buffer used for encryption
 * @returns Decrypted buffer
 * @throws DecryptError if authentication fails or data is invalid
 * @throws UnpackError if the buffer format is invalid
 */
export function decryptSync(buffer: Buffer, password: Buffer): Buffer {
  const data = unpack(buffer);
  const rounds = data.rounds.readUInt32LE(0);
  const keyInfo = deriveKeySync(password, data.salt, rounds);

  return decryptBuffer(data, keyInfo);
}
