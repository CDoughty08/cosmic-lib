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
export { secureClear, secureClear as secureClearMultiple, withSecureCleanup } from './security';
export { CryptError, CryptErrorCode, type ErrorContext } from './errors';

export * from './constants';
