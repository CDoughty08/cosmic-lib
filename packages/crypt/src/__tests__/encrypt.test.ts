import { IV_LENGTH, PASS_LENGTH, SALT_LENGTH } from '../constants';
import { randomBytesSync } from '../crypto';
import { encrypt, encryptSync } from '../encrypt';
import { CryptError, CryptErrorCode } from '../errors';

describe('Encrypt', () => {
  const text = Buffer.from('Test Data!');
  const password = randomBytesSync(PASS_LENGTH);
  const iv = randomBytesSync(IV_LENGTH);
  const salt = randomBytesSync(SALT_LENGTH);
  const fastRounds = 1000;

  describe('async encrypt', () => {
    it('should encrypt data successfully', async () => {
      const encrypted = await encrypt(text, password, iv, salt, fastRounds);
      expect(encrypted).toBeInstanceOf(Buffer);
      expect(encrypted.length).toBeGreaterThan(text.length);
      expect(encrypted.toString('hex')).toMatch(/^434352595054/); // Should start with CCRYPT marker
    });

    it('should fail with invalid password length', async () => {
      const shortPassword = randomBytesSync(PASS_LENGTH - 1);

      await expect(encrypt(text, shortPassword, iv, salt, fastRounds)).rejects.toThrow(CryptError);

      try {
        await encrypt(text, shortPassword, iv, salt, fastRounds);
      } catch (error) {
        expect(error).toBeInstanceOf(CryptError);
        expect((error as CryptError).code).toBe(CryptErrorCode.PASSWORD_TOO_SHORT);
      }
    });

    it('should fail with invalid IV length', async () => {
      const badIv = randomBytesSync(IV_LENGTH - 1);

      await expect(encrypt(text, password, badIv, salt, fastRounds)).rejects.toThrow(CryptError);

      try {
        await encrypt(text, password, badIv, salt, fastRounds);
      } catch (error) {
        expect(error).toBeInstanceOf(CryptError);
        expect((error as CryptError).code).toBe(CryptErrorCode.INVALID_IV_LENGTH);
      }
    });

    it('should fail with invalid salt length', async () => {
      const badSalt = randomBytesSync(SALT_LENGTH - 1);

      await expect(encrypt(text, password, iv, badSalt, fastRounds)).rejects.toThrow(CryptError);

      try {
        await encrypt(text, password, iv, badSalt, fastRounds);
      } catch (error) {
        expect(error).toBeInstanceOf(CryptError);
        expect((error as CryptError).code).toBe(CryptErrorCode.INVALID_SALT_LENGTH);
      }
    });

    it('should use custom rounds when provided', async () => {
      const customRounds = 5000;
      const encrypted = await encrypt(text, password, iv, salt, customRounds);
      expect(encrypted).toBeInstanceOf(Buffer);
      // The rounds are embedded in the encrypted data, we can't easily verify them here
      // but the function should not throw an error
    });

    it('should fail with password too long', async () => {
      const longPassword = randomBytesSync(1025);

      await expect(encrypt(text, longPassword, iv, salt, fastRounds)).rejects.toThrow(CryptError);

      try {
        await encrypt(text, longPassword, iv, salt, fastRounds);
      } catch (error) {
        expect(error).toBeInstanceOf(CryptError);
        expect((error as CryptError).code).toBe(CryptErrorCode.PASSWORD_TOO_LONG);
      }
    });

    it('should fail with rounds too low', async () => {
      const lowRounds = 999; // Below minimum of 1000

      await expect(encrypt(text, password, iv, salt, lowRounds)).rejects.toThrow(CryptError);

      try {
        await encrypt(text, password, iv, salt, lowRounds);
      } catch (error) {
        expect(error).toBeInstanceOf(CryptError);
        expect((error as CryptError).code).toBe(CryptErrorCode.INVALID_ROUNDS);
      }
    });

    it('should fail with rounds too high', async () => {
      const highRounds = 10000001; // Above maximum of 10000000

      await expect(encrypt(text, password, iv, salt, highRounds)).rejects.toThrow(CryptError);

      try {
        await encrypt(text, password, iv, salt, highRounds);
      } catch (error) {
        expect(error).toBeInstanceOf(CryptError);
        expect((error as CryptError).code).toBe(CryptErrorCode.INVALID_ROUNDS);
      }
    });
  });

  describe('sync encryptSync', () => {
    it('should encrypt data successfully', () => {
      const encrypted = encryptSync(text, password, iv, salt, fastRounds);
      expect(encrypted).toBeInstanceOf(Buffer);
      expect(encrypted.length).toBeGreaterThan(text.length);
      expect(encrypted.toString('hex')).toMatch(/^434352595054/); // Should start with CCRYPT marker
    });

    it('should fail with invalid password length', () => {
      const shortPassword = randomBytesSync(PASS_LENGTH - 1);

      expect(() => encryptSync(text, shortPassword, iv, salt, fastRounds)).toThrow(CryptError);

      try {
        encryptSync(text, shortPassword, iv, salt, fastRounds);
      } catch (error) {
        expect(error).toBeInstanceOf(CryptError);
        expect((error as CryptError).code).toBe(CryptErrorCode.PASSWORD_TOO_SHORT);
      }
    });

    it('should fail with invalid IV length', () => {
      const badIv = randomBytesSync(IV_LENGTH - 1);

      expect(() => encryptSync(text, password, badIv, salt, fastRounds)).toThrow(CryptError);

      try {
        encryptSync(text, password, badIv, salt, fastRounds);
      } catch (error) {
        expect(error).toBeInstanceOf(CryptError);
        expect((error as CryptError).code).toBe(CryptErrorCode.INVALID_IV_LENGTH);
      }
    });

    it('should fail with invalid salt length', () => {
      const badSalt = Buffer.from('not salty enough');

      expect(() => encryptSync(text, password, iv, badSalt, fastRounds)).toThrow(CryptError);

      try {
        encryptSync(text, password, iv, badSalt, fastRounds);
      } catch (error) {
        expect(error).toBeInstanceOf(CryptError);
        expect((error as CryptError).code).toBe(CryptErrorCode.INVALID_SALT_LENGTH);
      }
    });

    it('should use custom rounds when provided', () => {
      const customRounds = 5000;
      const encrypted = encryptSync(text, password, iv, salt, customRounds);
      expect(encrypted).toBeInstanceOf(Buffer);
    });

    it('should fail with password too long', () => {
      const longPassword = randomBytesSync(1025);

      expect(() => encryptSync(text, longPassword, iv, salt, fastRounds)).toThrow(CryptError);

      try {
        encryptSync(text, longPassword, iv, salt, fastRounds);
      } catch (error) {
        expect(error).toBeInstanceOf(CryptError);
        expect((error as CryptError).code).toBe(CryptErrorCode.PASSWORD_TOO_LONG);
      }
    });

    it('should fail with rounds too low', () => {
      const lowRounds = 999; // Below minimum of 1000

      expect(() => encryptSync(text, password, iv, salt, lowRounds)).toThrow(CryptError);

      try {
        encryptSync(text, password, iv, salt, lowRounds);
      } catch (error) {
        expect(error).toBeInstanceOf(CryptError);
        expect((error as CryptError).code).toBe(CryptErrorCode.INVALID_ROUNDS);
      }
    });

    it('should fail with rounds too high', () => {
      const highRounds = 10000001; // Above maximum of 10000000

      expect(() => encryptSync(text, password, iv, salt, highRounds)).toThrow(CryptError);

      try {
        encryptSync(text, password, iv, salt, highRounds);
      } catch (error) {
        expect(error).toBeInstanceOf(CryptError);
        expect((error as CryptError).code).toBe(CryptErrorCode.INVALID_ROUNDS);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle empty buffer', async () => {
      const emptyBuffer = Buffer.alloc(0);
      const encrypted = await encrypt(emptyBuffer, password, iv, salt, fastRounds);
      expect(encrypted).toBeInstanceOf(Buffer);
    });

    it('should handle large buffer', async () => {
      const largeBuffer = Buffer.alloc(1024 * 1024); // 1MB
      largeBuffer.fill('A');
      const encrypted = await encrypt(largeBuffer, password, iv, salt, fastRounds);
      expect(encrypted).toBeInstanceOf(Buffer);
      expect(encrypted.length).toBeGreaterThan(largeBuffer.length);
    });

    it('should produce different results with different IVs', async () => {
      const iv1 = randomBytesSync(IV_LENGTH);
      const iv2 = randomBytesSync(IV_LENGTH);

      const encrypted1 = await encrypt(text, password, iv1, salt, fastRounds);
      const encrypted2 = await encrypt(text, password, iv2, salt, fastRounds);

      expect(encrypted1).not.toEqual(encrypted2);
    });

    it('should produce different results with different salts', async () => {
      const salt1 = randomBytesSync(SALT_LENGTH);
      const salt2 = randomBytesSync(SALT_LENGTH);

      const encrypted1 = await encrypt(text, password, iv, salt1, fastRounds);
      const encrypted2 = await encrypt(text, password, iv, salt2, fastRounds);

      expect(encrypted1).not.toEqual(encrypted2);
    });
  });
});
