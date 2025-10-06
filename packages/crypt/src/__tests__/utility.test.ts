import { deriveKey, deriveKeySync } from '../derive';
import { unpack } from '../unpack';
import { randomBytesSync } from '../crypto';
import { encryptSync } from '../encrypt';
import { CryptError, CryptErrorCode } from '../errors';
import { SALT_LENGTH } from '../constants';

describe('Utility Functions', () => {
  describe('deriveKey', () => {
    const password = Buffer.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ12');
    const salt = randomBytesSync(SALT_LENGTH);
    const rounds = 1000;

    it('should derive keys asynchronously', async () => {
      const keyInfo = await deriveKey(password, salt, rounds);

      expect(keyInfo).toBeDefined();
      expect(keyInfo.derivedKey).toBeInstanceOf(Buffer);
      expect(keyInfo.hmacKey).toBeInstanceOf(Buffer);
      expect(keyInfo.derivedKey.length).toBe(32);
      expect(keyInfo.hmacKey.length).toBe(32);
    });

    it('should derive keys synchronously', () => {
      const keyInfo = deriveKeySync(password, salt, rounds);

      expect(keyInfo).toBeDefined();
      expect(keyInfo.derivedKey).toBeInstanceOf(Buffer);
      expect(keyInfo.hmacKey).toBeInstanceOf(Buffer);
      expect(keyInfo.derivedKey.length).toBe(32);
      expect(keyInfo.hmacKey.length).toBe(32);
    });

    it('should produce consistent results for same inputs', async () => {
      const keyInfo1 = await deriveKey(password, salt, rounds);
      const keyInfo2 = await deriveKey(password, salt, rounds);

      expect(keyInfo1.derivedKey).toEqual(keyInfo2.derivedKey);
      expect(keyInfo1.hmacKey).toEqual(keyInfo2.hmacKey);
    });

    it('should produce different results for different inputs', async () => {
      const salt2 = randomBytesSync(SALT_LENGTH);
      const keyInfo1 = await deriveKey(password, salt, rounds);
      const keyInfo2 = await deriveKey(password, salt2, rounds);

      expect(keyInfo1.derivedKey).not.toEqual(keyInfo2.derivedKey);
      expect(keyInfo1.hmacKey).not.toEqual(keyInfo2.hmacKey);
    });
  });

  describe('unpack', () => {
    const password = Buffer.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ12');
    const iv = Buffer.from('1234123412341234');
    const salt = randomBytesSync(SALT_LENGTH);

    it('should unpack valid encrypted data', () => {
      const testData = Buffer.from('Test data for unpacking');
      const encrypted = encryptSync(testData, password, iv, salt);

      const unpacked = unpack(encrypted);

      expect(unpacked).toBeDefined();
      expect(unpacked.encrypted).toBeInstanceOf(Buffer);
      expect(unpacked.iv).toBeInstanceOf(Buffer);
      expect(unpacked.hmac).toBeInstanceOf(Buffer);
      expect(unpacked.salt).toBeInstanceOf(Buffer);
      expect(unpacked.rounds).toBeInstanceOf(Buffer);

      // Verify IV matches original
      expect(unpacked.iv).toEqual(iv);
      // Verify salt matches original
      expect(unpacked.salt).toEqual(salt);
    });

    it('should fail with invalid metadata length', () => {
      const invalidData = Buffer.from('Invalid encryption data');

      expect(() => unpack(invalidData)).toThrow(CryptError);

      try {
        unpack(invalidData);
      } catch (error) {
        expect(error).toBeInstanceOf(CryptError);
        expect((error as CryptError).code).toBe(CryptErrorCode.INVALID_METADATA_LENGTH);
      }
    });

    it('should fail with missing marker', () => {
      const testData = Buffer.from('Test data');
      const encrypted = encryptSync(testData, password, iv, salt);
      encrypted[0] = 0; // Corrupt marker

      expect(() => unpack(encrypted)).toThrow(CryptError);

      try {
        unpack(encrypted);
      } catch (error) {
        expect(error).toBeInstanceOf(CryptError);
        expect((error as CryptError).code).toBe(CryptErrorCode.INVALID_MARKER);
      }
    });

    it('should fail with invalid encrypted data length', () => {
      const testData = Buffer.from('Test data');
      let encrypted = encryptSync(testData, password, iv, salt);
      encrypted = encrypted.subarray(0, encrypted.length - 10); // Truncate data

      expect(() => unpack(encrypted)).toThrow(CryptError);

      try {
        unpack(encrypted);
      } catch (error) {
        expect(error).toBeInstanceOf(CryptError);
        expect((error as CryptError).code).toBe(CryptErrorCode.INVALID_ENCRYPTED_DATA_LENGTH);
      }
    });
  });

  describe('integration tests', () => {
    it('should handle full encrypt-decrypt-unpack cycle', async () => {
      const password = Buffer.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ12');
      const iv = Buffer.from('1234123412341234');
      const salt = randomBytesSync(SALT_LENGTH);
      const testData = Buffer.from('Integration test data');

      // Encrypt
      const encrypted = encryptSync(testData, password, iv, salt);

      // Unpack to verify structure
      const unpacked = unpack(encrypted);
      expect(unpacked.encrypted).toBeDefined();
      expect(unpacked.iv).toBeDefined();
      expect(unpacked.salt).toBeDefined();
      expect(unpacked.hmac).toBeDefined();
      expect(unpacked.rounds).toBeDefined();

      // Verify we can derive keys from unpacked data
      const rounds = unpacked.rounds.readUInt32LE(0);
      const keyInfo = await deriveKey(password, unpacked.salt, rounds);

      expect(keyInfo.derivedKey).toBeDefined();
      expect(keyInfo.hmacKey).toBeDefined();
    });
  });
});
