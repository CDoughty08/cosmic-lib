/**
 * @cosmic/crypt
 *
 * Modern encryption/decryption library with HMAC authentication
 * Features AES-256-CBC encryption with PBKDF2 key derivation and HMAC-SHA512 authentication
 */

export { CosmicCrypt } from './cosmic-crypt';
export { encrypt, encryptSync } from './encrypt';
export { decrypt, decryptSync } from './decrypt';
export { type EncryptedData, type CryptCredentials, type KeyMetadata } from './utility';
export { secureClear, secureClearMultiple, withSecureCleanup } from './security';
export { CryptError, CryptErrorCode, type ErrorContext } from './errors';

// Re-export constants for convenience
export {
  HMAC_ALGORITHM,
  ENCRYPT_ALGORITHM,
  DERIVE_ALGORITHM,
  PBKDF2_ROUNDS,
  PASS_KEY_SIZE,
  IV_LENGTH,
  PASS_LENGTH,
  HMAC_LENGTH,
  SALT_LENGTH,
  ROUNDS_SIZE,
  MARKER_BUFFER
} from './constants';
