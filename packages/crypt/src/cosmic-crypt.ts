import { decrypt, decryptSync } from './decrypt';
import { encrypt, encryptSync } from './encrypt';
import {
  CryptCredentials,
  MARKER_BUFFER,
  randomBytes,
  randomBytesSync,
  IV_LENGTH,
  PASS_LENGTH,
  SALT_LENGTH,
  withSecureCleanup,
  withSecureCleanupAsync
} from './utility';

/**
 * CosmicCrypt - A modern encryption/decryption library with HMAC authentication
 *
 * This class provides both synchronous and asynchronous methods for:
 * - Generating secure credentials (IV, password, salt)
 * - Encrypting data with AES-256-CBC and HMAC-SHA512 authentication
 * - Decrypting and verifying data integrity
 * - Checking if a buffer contains CosmicCrypt encrypted data
 */
export class CosmicCrypt {
  /**
   * Generate credentials set using secure random bytes (asynchronous)
   * @returns Promise resolving to cryptographically secure credentials
   */
  public static async generateCredentials(): Promise<CryptCredentials> {
    return {
      iv: await randomBytes(IV_LENGTH),
      password: await randomBytes(PASS_LENGTH),
      salt: await randomBytes(SALT_LENGTH)
    };
  }

  /**
   * Generate credentials set using secure random bytes (synchronous)
   * @returns Cryptographically secure credentials
   */
  public static generateCredentialsSync(): CryptCredentials {
    return {
      iv: randomBytesSync(IV_LENGTH),
      password: randomBytesSync(PASS_LENGTH),
      salt: randomBytesSync(SALT_LENGTH)
    };
  }

  /**
   * Asynchronously encrypt a buffer using the provided credentials
   * @param buffer - The data to encrypt
   * @param credentials - The encryption credentials (password, iv, salt)
   * @returns Promise resolving to encrypted buffer
   */
  public static async encrypt(buffer: Buffer, credentials: CryptCredentials): Promise<Buffer> {
    return await withSecureCleanupAsync([credentials.password, credentials.iv, credentials.salt], () =>
      encrypt(buffer, credentials.password, credentials.iv, credentials.salt)
    );
  }

  /**
   * Synchronously encrypt a buffer using the provided credentials
   * @param buffer - The data to encrypt
   * @param credentials - The encryption credentials (password, iv, salt)
   * @returns Encrypted buffer
   */
  public static encryptSync(buffer: Buffer, credentials: CryptCredentials): Buffer {
    return withSecureCleanup([credentials.password, credentials.iv, credentials.salt], () =>
      encryptSync(buffer, credentials.password, credentials.iv, credentials.salt)
    );
  }

  /**
   * Asynchronously decrypt a buffer using the provided password
   * @param buffer - The encrypted data buffer
   * @param password - The password used for encryption
   * @returns Promise resolving to decrypted buffer
   */
  public static async decrypt(buffer: Buffer, password: Buffer): Promise<Buffer> {
    return await withSecureCleanupAsync([password], () => decrypt(buffer, password));
  }

  /**
   * Synchronously decrypt a buffer using the provided password
   * @param buffer - The encrypted data buffer
   * @param password - The password used for encryption
   * @returns Decrypted buffer
   */
  public static decryptSync(buffer: Buffer, password: Buffer): Buffer {
    return withSecureCleanup([password], () => decryptSync(buffer, password));
  }

  /**
   * Check if a buffer starts with the CosmicCrypt marker
   * @param buffer - The buffer to check
   * @returns True if the buffer appears to contain CosmicCrypt encrypted data
   */
  public static isCosmicCryptBuffer(buffer: Buffer): boolean {
    if (buffer.length < MARKER_BUFFER.length) {
      return false;
    }

    const markerBuffer = buffer.subarray(0, MARKER_BUFFER.length);

    return markerBuffer.compare(Buffer.from(MARKER_BUFFER)) === 0;
  }
}
