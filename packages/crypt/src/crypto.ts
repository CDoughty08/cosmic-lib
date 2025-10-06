import * as crypto from 'node:crypto';
import { promisify } from 'node:util';

export const randomBytes = promisify(crypto.randomBytes);
export const pbkdf2 = promisify(crypto.pbkdf2);

export { pbkdf2Sync, randomBytes as randomBytesSync } from 'node:crypto';
