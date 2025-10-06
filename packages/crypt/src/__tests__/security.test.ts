import { secureClear, secureClearMultiple, SecureBuffer, createSecureBuffer, withSecureCleanup } from '../security';

describe('Security Utilities', () => {
  describe('secureClear', () => {
    it('should clear a buffer', () => {
      const buffer = Buffer.from('sensitive data');
      secureClear(buffer);

      // Buffer should be filled with zeros
      expect(buffer.every((byte) => byte === 0)).toBe(true);
    });

    it('should handle empty buffer', () => {
      const buffer = Buffer.alloc(0);
      expect(() => secureClear(buffer)).not.toThrow();
    });

    it('should handle null/undefined buffer', () => {
      expect(() => secureClear(null as unknown as Buffer)).not.toThrow();
      expect(() => secureClear(undefined as unknown as Buffer)).not.toThrow();
    });
  });

  describe('secureClearMultiple', () => {
    it('should clear multiple buffers', () => {
      const buffers = [Buffer.from('data1'), Buffer.from('data2'), Buffer.from('data3')];

      secureClearMultiple(buffers);

      buffers.forEach((buffer) => {
        expect(buffer.every((byte) => byte === 0)).toBe(true);
      });
    });

    it('should handle empty array', () => {
      expect(() => secureClearMultiple([])).not.toThrow();
    });
  });

  describe('SecureBuffer', () => {
    it('should create SecureBuffer with data', () => {
      const data = Buffer.from('test data');
      const secureBuffer = new SecureBuffer(data);

      expect(secureBuffer.buffer).toEqual(data);
      expect(secureBuffer.length).toBe(data.length);
      expect(secureBuffer.isCleared).toBe(false);
    });

    it('should clear buffer', () => {
      const data = Buffer.from('test data');
      const secureBuffer = new SecureBuffer(data);

      secureBuffer.clear();

      expect(secureBuffer.isCleared).toBe(true);
      expect(() => secureBuffer.buffer).toThrow('SecureBuffer has been cleared');
    });

    it('should create copy of buffer', () => {
      const data = Buffer.from('test data');
      const secureBuffer = new SecureBuffer(data);

      const copy = secureBuffer.copy();

      expect(copy).toEqual(data);
      expect(copy).not.toBe(data); // Should be a different instance
    });

    it('should not allow access to cleared buffer', () => {
      const data = Buffer.from('test data');
      const secureBuffer = new SecureBuffer(data);

      secureBuffer.clear();

      expect(() => secureBuffer.buffer).toThrow('SecureBuffer has been cleared');
      expect(() => secureBuffer.copy()).toThrow('SecureBuffer has been cleared');
    });

    it('should handle multiple clear calls', () => {
      const data = Buffer.from('test data');
      const secureBuffer = new SecureBuffer(data);

      secureBuffer.clear();
      secureBuffer.clear(); // Should not throw

      expect(secureBuffer.isCleared).toBe(true);
    });
  });

  describe('createSecureBuffer', () => {
    it('should create SecureBuffer using factory function', () => {
      const data = Buffer.from('test data');
      const secureBuffer = createSecureBuffer(data);

      expect(secureBuffer).toBeInstanceOf(SecureBuffer);
      expect(secureBuffer.buffer).toEqual(data);
    });
  });

  describe('withSecureCleanup', () => {
    it('should execute operation and clean up', () => {
      const sensitiveData = [Buffer.from('data1'), Buffer.from('data2')];
      let operationExecuted = false;

      const result = withSecureCleanup(sensitiveData, () => {
        operationExecuted = true;
        return 'success';
      });

      expect(operationExecuted).toBe(true);
      expect(result).toBe('success');

      // Data should be cleared
      sensitiveData.forEach((buffer) => {
        expect(buffer.every((byte) => byte === 0)).toBe(true);
      });
    });

    it('should clean up even if operation throws', () => {
      const sensitiveData = [Buffer.from('data1'), Buffer.from('data2')];

      expect(() => {
        withSecureCleanup(sensitiveData, () => {
          throw new Error('Operation failed');
        });
      }).toThrow('Operation failed');

      // Data should still be cleared
      sensitiveData.forEach((buffer) => {
        expect(buffer.every((byte) => byte === 0)).toBe(true);
      });
    });

    it('should handle empty sensitive data array', () => {
      const result = withSecureCleanup([], () => 'success');
      expect(result).toBe('success');
    });
  });
});
