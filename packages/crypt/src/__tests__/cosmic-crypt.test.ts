import { CosmicCrypt } from '../cosmic-crypt';
import { PASS_LENGTH, IV_LENGTH, SALT_LENGTH } from '../constants';
import { cloneCredentials } from '../utility';

describe('CosmicCrypt', () => {
  const testData = Buffer.from('Hello, World!');

  describe('generateCredentials', () => {
    it('should generate valid credentials asynchronously', async () => {
      const credentials = await CosmicCrypt.generateCredentials();

      expect(credentials).toBeDefined();
      expect(credentials.password).toBeInstanceOf(Buffer);
      expect(credentials.iv).toBeInstanceOf(Buffer);
      expect(credentials.salt).toBeInstanceOf(Buffer);

      expect(credentials.password.length).toBe(PASS_LENGTH);
      expect(credentials.iv.length).toBe(IV_LENGTH);
      expect(credentials.salt.length).toBe(SALT_LENGTH);
    });

    it('should generate valid credentials synchronously', () => {
      const credentials = CosmicCrypt.generateCredentialsSync();

      expect(credentials).toBeDefined();
      expect(credentials.password).toBeInstanceOf(Buffer);
      expect(credentials.iv).toBeInstanceOf(Buffer);
      expect(credentials.salt).toBeInstanceOf(Buffer);

      expect(credentials.password.length).toBe(PASS_LENGTH);
      expect(credentials.iv.length).toBe(IV_LENGTH);
      expect(credentials.salt.length).toBe(SALT_LENGTH);
    });

    it('should generate different credentials each time', async () => {
      const creds1 = await CosmicCrypt.generateCredentials();
      const creds2 = await CosmicCrypt.generateCredentials();

      expect(creds1.password).not.toEqual(creds2.password);
      expect(creds1.iv).not.toEqual(creds2.iv);
      expect(creds1.salt).not.toEqual(creds2.salt);
    });
  });

  describe('encrypt', () => {
    it('should encrypt data asynchronously', async () => {
      const credentials = CosmicCrypt.generateCredentialsSync();
      const encrypted = await CosmicCrypt.encrypt(testData, credentials);

      expect(encrypted).toBeInstanceOf(Buffer);
      expect(encrypted.length).toBeGreaterThan(testData.length);
    });

    it('should encrypt data synchronously', () => {
      const credentials = CosmicCrypt.generateCredentialsSync();
      const encrypted = CosmicCrypt.encryptSync(testData, credentials);

      expect(encrypted).toBeInstanceOf(Buffer);
      expect(encrypted.length).toBeGreaterThan(testData.length);
    });
  });

  describe('decrypt', () => {
    it('should decrypt data asynchronously', async () => {
      const credentials = CosmicCrypt.generateCredentialsSync();
      const clonedCredentials = cloneCredentials(credentials);
      const encrypted = await CosmicCrypt.encrypt(testData, credentials);
      const decrypted = await CosmicCrypt.decrypt(encrypted, clonedCredentials.password);

      expect(decrypted).toBeInstanceOf(Buffer);
      expect(decrypted.equals(testData)).toBe(true);
    });

    it('should decrypt data synchronously', () => {
      const credentials = CosmicCrypt.generateCredentialsSync();
      const clonedCredentials = cloneCredentials(credentials);
      const encrypted = CosmicCrypt.encryptSync(testData, credentials);
      const decrypted = CosmicCrypt.decryptSync(encrypted, clonedCredentials.password);

      expect(decrypted).toBeInstanceOf(Buffer);
      expect(decrypted.equals(testData)).toBe(true);
    });

    it('should fail to decrypt with wrong password', async () => {
      const credentials = CosmicCrypt.generateCredentialsSync();
      const encrypted = await CosmicCrypt.encrypt(testData, credentials);
      const wrongPassword = Buffer.from('ZYXWVUTSRQPONMLKJIHGFEDCBA1234567890ZYXWVUTSRQPONMLKJIHGFEDCBA12');

      await expect(CosmicCrypt.decrypt(encrypted, wrongPassword)).rejects.toThrow();
    });
  });

  describe('isCosmicCryptBuffer', () => {
    it('should return true for valid CosmicCrypt buffer', async () => {
      const credentials = CosmicCrypt.generateCredentialsSync();
      const encrypted = await CosmicCrypt.encrypt(testData, credentials);

      expect(CosmicCrypt.isCosmicCryptBuffer(encrypted)).toBe(true);
    });

    it('should return false for invalid buffer', () => {
      const invalidBuffer = Buffer.from('Not encrypted data');
      expect(CosmicCrypt.isCosmicCryptBuffer(invalidBuffer)).toBe(false);
    });

    it('should return false for empty buffer', () => {
      const emptyBuffer = Buffer.alloc(0);
      expect(CosmicCrypt.isCosmicCryptBuffer(emptyBuffer)).toBe(false);
    });

    it('should return false for buffer too short', () => {
      const shortBuffer = Buffer.from('CC');
      expect(CosmicCrypt.isCosmicCryptBuffer(shortBuffer)).toBe(false);
    });
  });

  describe('roundtrip tests', () => {
    it('should handle async roundtrip with generated credentials', async () => {
      const credentials = await CosmicCrypt.generateCredentials();
      const clonedCredentials = cloneCredentials(credentials);
      const originalData = Buffer.from('Roundtrip test data with unicode: 🚀');

      const encrypted = await CosmicCrypt.encrypt(originalData, credentials);
      const decrypted = await CosmicCrypt.decrypt(encrypted, clonedCredentials.password);

      expect(decrypted.equals(originalData)).toBe(true);
    });

    it('should handle sync roundtrip with generated credentials', () => {
      const credentials = CosmicCrypt.generateCredentialsSync();
      const clonedCredentials = cloneCredentials(credentials);
      const originalData = Buffer.from('Sync roundtrip test data');

      const encrypted = CosmicCrypt.encryptSync(originalData, credentials);
      const decrypted = CosmicCrypt.decryptSync(encrypted, clonedCredentials.password);

      expect(decrypted.equals(originalData)).toBe(true);
    });

    it('should handle mixed async/sync roundtrip', async () => {
      const credentials = CosmicCrypt.generateCredentialsSync();
      const originalData = Buffer.from('Mixed roundtrip test');

      // Encrypt with sync, decrypt with async
      const encrypted = CosmicCrypt.encryptSync(originalData, credentials);
      const decrypted = await CosmicCrypt.decrypt(encrypted, credentials.password);

      expect(decrypted.equals(originalData)).toBe(true);
    });

    it('should handle large data roundtrip', async () => {
      const credentials = CosmicCrypt.generateCredentialsSync();
      const clonedCredentials = cloneCredentials(credentials);
      const largeData = Buffer.alloc(1024 * 1024); // 1MB
      largeData.fill('X');

      const encrypted = await CosmicCrypt.encrypt(largeData, credentials);
      const decrypted = await CosmicCrypt.decrypt(encrypted, clonedCredentials.password);

      expect(decrypted.equals(largeData)).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle invalid credentials gracefully', () => {
      const invalidCredentials = {
        password: Buffer.from('short'),
        iv: Buffer.from('1234'),
        salt: Buffer.from('salt')
      };

      expect(() => CosmicCrypt.encryptSync(testData, invalidCredentials)).toThrow();
    });

    it('should handle corrupted encrypted data', () => {
      const credentials = CosmicCrypt.generateCredentialsSync();
      const clonedCredentials = cloneCredentials(credentials);
      const encrypted = CosmicCrypt.encryptSync(testData, credentials);
      encrypted[0] = 0; // Corrupt marker

      expect(() => CosmicCrypt.decryptSync(encrypted, clonedCredentials.password)).toThrow();
    });
  });
});
