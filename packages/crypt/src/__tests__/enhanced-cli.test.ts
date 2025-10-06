import { EnhancedCli } from '../cli/enhanced-cli';
import { CryptError, CryptErrorCode } from '../errors';

describe('EnhancedCli', () => {
  let cli: EnhancedCli;

  beforeEach(() => {
    cli = new EnhancedCli({
      enc: true,
      text: 'test data',
      verbose: true
    });
  });

  describe('validation', () => {
    it('should validate input source', () => {
      const invalidCli = new EnhancedCli({
        enc: true
        // No input specified
      });

      expect(() => invalidCli['validateArguments']()).toThrow();
    });

    it('should validate operation mode', () => {
      const invalidCli = new EnhancedCli({
        text: 'test'
        // No operation mode specified
      });

      expect(() => invalidCli['validateArguments']()).toThrow();
    });

    it('should validate both input sources not specified', () => {
      const invalidCli = new EnhancedCli({
        enc: true,
        in: 'file.txt',
        text: 'test'
      });

      expect(() => invalidCli['validateArguments']()).toThrow();
    });

    it('should validate both operation modes not specified', () => {
      const invalidCli = new EnhancedCli({
        text: 'test',
        enc: true,
        dec: true
      });

      expect(() => invalidCli['validateArguments']()).toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle CryptError properly', () => {
      const error = new CryptError(CryptErrorCode.INVALID_INPUT, 'Test error', { operation: 'testing' });
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      cli['handleError'](error);

      expect(consoleSpy).toHaveBeenCalledWith('\n❌ Error: Test error');
      consoleSpy.mockRestore();
    });

    it('should handle regular Error properly', () => {
      const error = new Error('Regular error');
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      cli['handleError'](error);

      expect(consoleSpy).toHaveBeenCalledWith('\n❌ Error: Regular error');
      consoleSpy.mockRestore();
    });

    it('should handle unknown error properly', () => {
      const error = 'Unknown error';
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      cli['handleError'](error);

      expect(consoleSpy).toHaveBeenCalledWith('\n❌ Unknown error:', error);
      consoleSpy.mockRestore();
    });
  });

  describe('password derivation', () => {
    it('should derive password from string', async () => {
      const password = 'test-password';
      const derived = await cli['derivePasswordFromString'](password);

      expect(derived).toBeInstanceOf(Buffer);
      expect(derived.length).toBe(64); // PASS_LENGTH
    });

    it('should produce different results for different passwords', async () => {
      const password1 = 'password1';
      const password2 = 'password2';

      const derived1 = await cli['derivePasswordFromString'](password1);
      const derived2 = await cli['derivePasswordFromString'](password2);

      expect(derived1).not.toEqual(derived2);
    });
  });
});
