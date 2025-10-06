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
