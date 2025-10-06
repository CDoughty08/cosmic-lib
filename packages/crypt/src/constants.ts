export const HMAC_ALGORITHM = 'sha512' as const;
export const ENCRYPT_ALGORITHM = 'aes-256-cbc' as const;
export const DERIVE_ALGORITHM = 'sha512' as const;

export const PBKDF2_ROUNDS = 300_000;
export const PASS_KEY_SIZE = 64;
export const IV_LENGTH = 16;
export const PASS_LENGTH = 64;
export const HMAC_LENGTH = 64;
export const SALT_LENGTH = 64;
export const ROUNDS_SIZE = 4;

export const MARKER_BUFFER = Buffer.from('CCRYPT');
