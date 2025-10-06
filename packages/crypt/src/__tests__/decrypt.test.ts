import { IV_LENGTH, PASS_LENGTH, SALT_LENGTH } from '../constants';
import { randomBytesSync } from '../crypto';
import { decrypt, decryptSync } from '../decrypt';
import { encrypt, encryptSync } from '../encrypt';
import { CryptError, CryptErrorCode } from '../errors';

describe('Decrypt', () => {
  const text = randomBytesSync(1024);
  const password = randomBytesSync(PASS_LENGTH);
  const iv = randomBytesSync(IV_LENGTH);
  const salt = randomBytesSync(SALT_LENGTH);
  const fastRounds = 1000;

  describe('async decrypt', () => {
    it('should decrypt data successfully', async () => {
      const encrypted = await encrypt(text, password, iv, salt, fastRounds);
      const decrypted = await decrypt(encrypted, password);

      expect(decrypted).toBeInstanceOf(Buffer);
      expect(decrypted.equals(text)).toBe(true);
    });

    it('should fail with authentication error for tampered data', async () => {
      const encrypted = await encrypt(text, password, iv, salt, fastRounds);
      encrypted[encrypted.length - 10] = 1; // Tamper with data

      await expect(decrypt(encrypted, password)).rejects.toThrow(CryptError);

      try {
        await decrypt(encrypted, password);
      } catch (error) {
        expect(error).toBeInstanceOf(CryptError);
        expect((error as CryptError).code).toBe(CryptErrorCode.AUTHENTICATION_FAILED);
      }
    });

    it('should fail with invalid metadata length', async () => {
      const invalidData = Buffer.from('Invalid encryption data');

      await expect(decrypt(invalidData, password)).rejects.toThrow(CryptError);

      try {
        await decrypt(invalidData, password);
      } catch (error) {
        expect(error).toBeInstanceOf(CryptError);
        expect((error as CryptError).code).toBe(CryptErrorCode.INVALID_METADATA_LENGTH);
      }
    });

    it('should fail with missing marker', async () => {
      const encrypted = await encrypt(text, password, iv, salt);
      encrypted[0] = 0; // Corrupt marker

      await expect(decrypt(encrypted, password)).rejects.toThrow(CryptError);

      try {
        await decrypt(encrypted, password);
      } catch (error) {
        expect(error).toBeInstanceOf(CryptError);
        expect((error as CryptError).code).toBe(CryptErrorCode.INVALID_MARKER);
      }
    });

    it('should fail with invalid encrypted data length', async () => {
      let encrypted = await encrypt(text, password, iv, salt, fastRounds);
      encrypted = encrypted.subarray(0, encrypted.length - 10); // Truncate data

      await expect(decrypt(encrypted, password)).rejects.toThrow(CryptError);

      try {
        await decrypt(encrypted, password);
      } catch (error) {
        expect(error).toBeInstanceOf(CryptError);
        expect((error as CryptError).code).toBe(CryptErrorCode.INVALID_ENCRYPTED_DATA_LENGTH);
      }
    });

    it('should fail with wrong password', async () => {
      const encrypted = await encrypt(text, password, iv, salt, fastRounds);
      const wrongPassword = randomBytesSync(PASS_LENGTH);

      await expect(decrypt(encrypted, wrongPassword)).rejects.toThrow(CryptError);

      try {
        await decrypt(encrypted, wrongPassword);
      } catch (error) {
        expect(error).toBeInstanceOf(CryptError);
        expect((error as CryptError).code).toBe(CryptErrorCode.AUTHENTICATION_FAILED);
      }
    });
  });

  describe('sync decryptSync', () => {
    it('should decrypt data successfully', () => {
      const encrypted = encryptSync(text, password, iv, salt, fastRounds);
      const decrypted = decryptSync(encrypted, password);

      expect(decrypted).toBeInstanceOf(Buffer);
      expect(decrypted.equals(text)).toBe(true);
    });

    it('should fail with authentication error for tampered data', () => {
      const encrypted = encryptSync(text, password, iv, salt, fastRounds);
      encrypted[encrypted.length - 10] = 1; // Tamper with data

      expect(() => decryptSync(encrypted, password)).toThrow(CryptError);

      try {
        decryptSync(encrypted, password);
      } catch (error) {
        expect(error).toBeInstanceOf(CryptError);
        expect((error as CryptError).code).toBe(CryptErrorCode.AUTHENTICATION_FAILED);
      }
    });

    it('should fail with invalid metadata length', () => {
      const invalidData = Buffer.from('Invalid encryption data');

      expect(() => decryptSync(invalidData, password)).toThrow(CryptError);

      try {
        decryptSync(invalidData, password);
      } catch (error) {
        expect(error).toBeInstanceOf(CryptError);
        expect((error as CryptError).code).toBe(CryptErrorCode.INVALID_METADATA_LENGTH);
      }
    });

    it('should fail with missing marker', () => {
      const encrypted = encryptSync(text, password, iv, salt, fastRounds);
      encrypted[0] = 0; // Corrupt marker

      expect(() => decryptSync(encrypted, password)).toThrow(CryptError);

      try {
        decryptSync(encrypted, password);
      } catch (error) {
        expect(error).toBeInstanceOf(CryptError);
        expect((error as CryptError).code).toBe(CryptErrorCode.INVALID_MARKER);
      }
    });

    it('should fail with invalid encrypted data length', () => {
      let encrypted = encryptSync(text, password, iv, salt, fastRounds);
      encrypted = encrypted.subarray(0, encrypted.length - 10); // Truncate data

      expect(() => decryptSync(encrypted, password)).toThrow(CryptError);

      try {
        decryptSync(encrypted, password);
      } catch (error) {
        expect(error).toBeInstanceOf(CryptError);
        expect((error as CryptError).code).toBe(CryptErrorCode.INVALID_ENCRYPTED_DATA_LENGTH);
      }
    });

    it('should fail with wrong password', () => {
      const encrypted = encryptSync(text, password, iv, salt, fastRounds);
      const wrongPassword = randomBytesSync(PASS_LENGTH);

      expect(() => decryptSync(encrypted, wrongPassword)).toThrow(CryptError);

      try {
        decryptSync(encrypted, wrongPassword);
      } catch (error) {
        expect(error).toBeInstanceOf(CryptError);
        expect((error as CryptError).code).toBe(CryptErrorCode.AUTHENTICATION_FAILED);
      }
    });
  });

  describe('roundtrip tests', () => {
    it('should handle empty buffer roundtrip', async () => {
      const emptyBuffer = Buffer.alloc(0);
      const encrypted = await encrypt(emptyBuffer, password, iv, salt, fastRounds);
      const decrypted = await decrypt(encrypted, password);

      expect(decrypted).toEqual(emptyBuffer);
    });

    it('should handle large buffer roundtrip', async () => {
      const largeBuffer = Buffer.alloc(1024 * 1024); // 1MB
      largeBuffer.fill('A');
      const encrypted = await encrypt(largeBuffer, password, iv, salt, fastRounds);
      const decrypted = await decrypt(encrypted, password);

      expect(decrypted.equals(largeBuffer)).toBe(true);
    });

    it('should handle binary data roundtrip', async () => {
      const binaryData = Buffer.from([0x00, 0x01, 0x02, 0xff, 0xfe, 0xfd]);
      const encrypted = await encrypt(binaryData, password, iv, salt, fastRounds);
      const decrypted = await decrypt(encrypted, password);

      expect(decrypted.equals(binaryData)).toBe(true);
    });

    it('should handle unicode text roundtrip', async () => {
      const unicodeText = Buffer.from('Hello 世界 🌍', 'utf8');
      const encrypted = await encrypt(unicodeText, password, iv, salt, fastRounds);
      const decrypted = await decrypt(encrypted, password);

      expect(decrypted.equals(unicodeText)).toBe(true);
    });
  });
});
