#!/usr/bin/env node

import * as fs from 'node:fs';
import { program } from 'commander';
import { CosmicCrypt } from '../cosmic-crypt';
import { CryptError, CryptErrorCode } from '../errors';

interface CliOptions {
  in?: string;
  out?: string;
  phrase?: string;
  enc?: boolean;
  dec?: boolean;
  text?: string;
}

// Parse command line arguments
program
  .name('cosmic-crypt')
  .description('CosmicCrypt - Modern encryption/decryption tool')
  .version('1.0.0')
  .option('--in <filename>', 'Input from file')
  .option('--out <filename>', 'Output to file')
  .option('--phrase <text>', '64 byte passphrase in hex (128 characters)')
  .option('--enc', 'Encrypt mode')
  .option('--dec', 'Decrypt mode')
  .option('--text <text>', 'In-memory encryption/decryption')
  .option('--interactive', 'Interactive tool (not implemented)')
  .parse();

const options = program.opts<CliOptions>();

/**
 * Validate command line arguments and exit with error if invalid
 */
function validateArguments(): void {
  try {
    // Check input source
    if ((!options.in && !options.text) || (options.in && options.text)) {
      throw new CryptError(CryptErrorCode.INVALID_INPUT, 'Must specify input via --in <file> or --text <data>', {
        operation: 'validateArguments'
      });
    }

    // Check operation mode
    if ((!options.enc && !options.dec) || (options.enc && options.dec)) {
      throw new CryptError(CryptErrorCode.INVALID_INPUT, 'Must specify either --enc (encrypt) or --dec (decrypt)', {
        operation: 'validateArguments'
      });
    }

    // Check input file exists
    if (options.in && !fs.existsSync(options.in)) {
      throw new CryptError(CryptErrorCode.CLI_FILE_NOT_FOUND, 'Input file not found', {
        operation: 'validateArguments',
        additionalInfo: {
          fileName: options.in
        }
      });
    }

    // Check output file does not exist
    if (options.out && fs.existsSync(options.out)) {
      throw new CryptError(CryptErrorCode.CLI_FILE_EXISTS, 'Output file already exists', {
        operation: 'validateArguments',
        additionalInfo: {
          fileName: options.out
        }
      });
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

/**
 * Main CLI execution function
 */
async function main(): Promise<void> {
  try {
    validateArguments();

    const mode = options.enc ? 'encrypt' : 'decrypt';

    let data: Buffer | null = null;
    if (options.text) {
      data = Buffer.from(options.text);
    } else if (options.in) {
      data = fs.readFileSync(options.in);
    }

    if (!data) {
      console.error('Error: No input specified');
      process.exit(1);
    }

    switch (mode) {
      case 'encrypt':
        await handleEncrypt(data);
        break;
      case 'decrypt':
        await handleDecrypt(data);
        break;
    }
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

/**
 * Handle encryption operation
 */
async function handleEncrypt(data: Buffer): Promise<void> {
  const creds = await CosmicCrypt.generateCredentials();

  // Use provided password or generate new one
  if (options.phrase) {
    creds.password = Buffer.from(options.phrase, 'hex');
  }

  const encrypted = await CosmicCrypt.encrypt(data, creds);

  // Output results
  if (!options.phrase) {
    console.log(`Generated password: ${creds.password.toString('hex')}`);
  }

  if (!options.out) {
    console.log(`Encrypted data: ${encrypted.toString('hex')}`);
  } else {
    fs.writeFileSync(options.out, encrypted);
    console.log(`Encrypted content written to ${options.out}`);
  }
}

/**
 * Handle decryption operation
 */
async function handleDecrypt(data: Buffer): Promise<void> {
  if (!options.phrase) {
    throw new CryptError(CryptErrorCode.INVALID_INPUT, 'Must specify --phrase with --dec for decryption', {
      operation: 'handleDecrypt'
    });
  }

  const password = Buffer.from(options.phrase, 'hex');
  const decrypted = await CosmicCrypt.decrypt(data, password);

  if (!options.out) {
    console.log(`Decrypted data: ${decrypted.toString()}`);
  } else {
    fs.writeFileSync(options.out, decrypted);
    console.log(`Decrypted content written to ${options.out}`);
  }
}

// Execute CLI if this file is run directly
if (require.main === module) {
  void main();
}
