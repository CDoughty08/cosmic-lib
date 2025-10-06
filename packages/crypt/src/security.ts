/**
 * Security utilities for handling sensitive data
 * Provides secure memory clearing and sensitive data handling
 */

import { randomBytesSync } from './crypto';

/**
 * Securely clear a buffer by overwriting it with random data
 * This helps prevent sensitive data from remaining in memory
 * @param buffer - The buffer to clear
 */
export function secureClear(buffer: Buffer): void {
  if (!buffer || buffer.length === 0) {
    return;
  }

  // Overwrite with random data multiple times
  buffer.set(randomBytesSync(buffer.length), 0);
  buffer.set(randomBytesSync(buffer.length), 0);
  buffer.set(randomBytesSync(buffer.length), 0);

  // Final overwrite with zeros
  buffer.fill(0);
}

/**
 * Securely clear multiple buffers at once
 * @param buffers - Array of buffers to clear
 */
export function secureClearMultiple(buffers: Buffer[]): void {
  buffers.forEach(secureClear);
}

/**
 * Create a secure wrapper for sensitive data that automatically clears on destruction
 */
export class SecureBuffer {
  private _buffer: Buffer;
  private _cleared = false;

  constructor(buffer: Buffer) {
    this._buffer = Buffer.from(buffer); // Create a copy
  }

  get buffer(): Buffer {
    if (this._cleared) {
      throw new Error('SecureBuffer has been cleared and cannot be accessed');
    }
    return this._buffer;
  }

  get length(): number {
    return this._cleared ? 0 : this._buffer.length;
  }

  /**
   * Securely clear the internal buffer
   */
  clear(): void {
    if (!this._cleared) {
      secureClear(this._buffer);
      this._cleared = true;
    }
  }

  /**
   * Get a copy of the buffer (caller is responsible for clearing)
   */
  copy(): Buffer {
    if (this._cleared) {
      throw new Error('SecureBuffer has been cleared and cannot be accessed');
    }
    return Buffer.from(this._buffer);
  }

  /**
   * Check if the buffer has been cleared
   */
  get isCleared(): boolean {
    return this._cleared;
  }
}

/**
 * Utility function to create a SecureBuffer
 */
export function createSecureBuffer(buffer: Buffer): SecureBuffer {
  return new SecureBuffer(buffer);
}

/**
 * Clear sensitive data from memory after use
 * This is a helper function that can be used in try-finally blocks
 */
export function withSecureCleanup<T>(sensitiveData: Buffer[], operation: () => T): T {
  try {
    return operation();
  } finally {
    secureClearMultiple(sensitiveData);
  }
}

export async function withSecureCleanupAsync<T>(sensitiveData: Buffer[], operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } finally {
    secureClearMultiple(sensitiveData);
  }
}
