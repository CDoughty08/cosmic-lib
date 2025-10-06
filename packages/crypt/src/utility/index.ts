export * from '../constants';
export * from '../crypto';
export * from '../derive';
export * from '../unpack';
export * from '../security';

export interface CryptCredentials {
  password: Buffer;
  iv: Buffer;
  salt: Buffer;
}

export function cloneCredentials(credentials: CryptCredentials): CryptCredentials {
  return {
    password: Buffer.from(credentials.password),
    iv: Buffer.from(credentials.iv),
    salt: Buffer.from(credentials.salt)
  };
}
