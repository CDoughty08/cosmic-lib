/**
 * Comprehensive error handling for CosmicCrypt
 * Provides detailed error codes, messages, and context information
 */

export enum CryptErrorCode {
  // Input validation errors
  INVALID_INPUT = 'INVALID_INPUT',
  PASSWORD_TOO_SHORT = 'PASSWORD_TOO_SHORT',
  PASSWORD_TOO_LONG = 'PASSWORD_TOO_LONG',
  INVALID_IV_LENGTH = 'INVALID_IV_LENGTH',
  INVALID_SALT_LENGTH = 'INVALID_SALT_LENGTH',
  INVALID_ROUNDS = 'INVALID_ROUNDS',
  // Cryptographic errors
  INVALID_METADATA_LENGTH = 'INVALID_METADATA_LENGTH',
  INVALID_MARKER = 'INVALID_MARKER',
  INVALID_ENCRYPTED_DATA_LENGTH = 'INVALID_ENCRYPTED_DATA_LENGTH',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  // CLI errors
  CLI_FILE_NOT_FOUND = 'CLI_FILE_NOT_FOUND',
  CLI_FILE_EXISTS = 'CLI_FILE_EXISTS'
}

export interface ErrorContext {
  operation?: string;
  inputSize?: number;
  actualSize?: number;
  expectedSize?: number;
  filePath?: string;
  timestamp?: Date;
  additionalInfo?: Record<string, unknown>;
}

export class CryptError extends Error {
  public readonly timestamp: Date;

  constructor(
    public readonly code: CryptErrorCode,
    message: string,
    public readonly context: ErrorContext,
    cause?: Error
  ) {
    super(message);
    this.name = 'CryptError';
    this.timestamp = new Date();

    if (cause) {
      this.cause = cause;
    }
  }

  public getDebugMessage(): string {
    return JSON.stringify(
      {
        timestamp: this.timestamp,
        code: this.code,
        message: this.message,
        context: this.context,
        cause: this.cause
      },
      null,
      2
    );
  }
}
