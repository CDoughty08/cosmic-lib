import { HMAC_LENGTH, IV_LENGTH, MARKER_BUFFER, ROUNDS_SIZE, SALT_LENGTH } from './constants';
import { CryptError, CryptErrorCode } from './errors';

export interface EncryptedData {
  encrypted: Buffer;
  iv: Buffer;
  hmac: Buffer;
  salt: Buffer;
  rounds: Buffer;
}

/**
 * Unpack encrypted data buffer into its constituent parts
 * @param buffer - The encrypted data buffer
 * @returns Unpacked encrypted data
 * @throws UnpackError if the buffer is invalid
 */
export function unpack(buffer: Buffer): EncryptedData {
  const metaLength = MARKER_BUFFER.length + ROUNDS_SIZE + IV_LENGTH + SALT_LENGTH + HMAC_LENGTH;

  if (buffer.length < metaLength) {
    throw new CryptError(
      CryptErrorCode.INVALID_METADATA_LENGTH,
      `Invalid metadata length: ${buffer.length} bytes, expected at least ${metaLength} bytes`,
      {
        actualSize: buffer.length,
        expectedSize: metaLength,
        operation: 'unpack'
      }
    );
  }

  const markerBuffer = buffer.subarray(0, MARKER_BUFFER.length);
  if (markerBuffer.compare(MARKER_BUFFER) !== 0) {
    throw new CryptError(CryptErrorCode.INVALID_MARKER, 'Missing or invalid CosmicCrypt marker', {
      operation: 'unpack',
      additionalInfo: {
        expectedMarker: MARKER_BUFFER,
        actualMarker: markerBuffer.toString('hex')
      }
    });
  }

  let offset = MARKER_BUFFER.length;
  const rounds = buffer.subarray(offset, ROUNDS_SIZE + offset);
  offset += ROUNDS_SIZE;

  const iv = buffer.subarray(offset, IV_LENGTH + offset);
  offset += IV_LENGTH;

  const salt = buffer.subarray(offset, SALT_LENGTH + offset);
  offset += SALT_LENGTH;

  const hmac = buffer.subarray(offset, HMAC_LENGTH + offset);
  offset += HMAC_LENGTH;

  const encrypted = buffer.subarray(offset);

  // Validate encrypted data length (should be multiple of 16 for AES-256-CBC)
  if (encrypted.length % 16 !== 0) {
    throw new CryptError(
      CryptErrorCode.INVALID_ENCRYPTED_DATA_LENGTH,
      `Invalid encrypted data length: ${encrypted.length} bytes, must be multiple of 16`,
      {
        actualSize: encrypted.length,
        operation: 'unpack',
        additionalInfo: {
          expectedMultiple: 16,
          remainder: encrypted.length % 16
        }
      }
    );
  }

  return {
    encrypted,
    hmac,
    iv,
    rounds,
    salt
  };
}
