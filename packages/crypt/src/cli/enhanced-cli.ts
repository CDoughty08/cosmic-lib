#!/usr/bin/env node

import * as fs from 'node:fs';
import * as readline from 'node:readline';
import { program } from 'commander';
import { CosmicCrypt } from '../cosmic-crypt';
import { CryptError, CryptErrorCode } from '../errors';
import { PASS_LENGTH } from '../constants';

interface CliOptions {
  in?: string;
  out?: string;
  password?: string;
  phrase?: string;
  enc?: boolean;
  dec?: boolean;
  text?: string;
  interactive?: boolean;
  progress?: boolean;
  force?: boolean;
  verbose?: boolean;
  rounds?: number;
}

class EnhancedCli {
  private options: CliOptions;
  private rl?: readline.Interface;

  constructor(options: CliOptions) {
    this.options = options;
  }

  /**
   * Main CLI execution function
   */
  async run(): Promise<void> {
    try {
      this.validateArguments();

      const mode = this.options.enc ? 'encrypt' : 'decrypt';
      console.log(`🔐 CosmicCrypt - ${mode.charAt(0).toUpperCase() + mode.slice(1)}ion Mode`);

      let data: Buffer | null = null;

      if (this.options.text) {
        data = Buffer.from(this.options.text);
        console.log(`📝 Processing text data (${data.length} bytes)`);
      } else if (this.options.in) {
        data = fs.readFileSync(this.options.in);
        console.log(`📁 Processing file: ${this.options.in} (${data.length} bytes)`);
      }

      if (!data) {
        throw new CryptError(CryptErrorCode.INVALID_INPUT, 'No input data specified', {
          operation: 'run'
        });
      }

      switch (mode) {
        case 'encrypt':
          await this.handleEncrypt(data);
          break;
        case 'decrypt':
          await this.handleDecrypt(data);
          break;
      }

      console.log('✅ Operation completed successfully');
    } catch (error) {
      this.handleError(error);
      process.exit(1);
    } finally {
      this.cleanup();
    }
  }

  /**
   * Validate command line arguments
   */
  private validateArguments(): void {
    // Check input source
    if ((!this.options.in && !this.options.text) || (this.options.in && this.options.text)) {
      throw new CryptError(CryptErrorCode.INVALID_INPUT, 'Must specify input via --in <file> or --text <data>', {
        operation: 'validateArguments'
      });
    }

    // Check operation mode
    if ((!this.options.enc && !this.options.dec) || (this.options.enc && this.options.dec)) {
      throw new CryptError(CryptErrorCode.INVALID_INPUT, 'Must specify either --enc (encrypt) or --dec (decrypt)', {
        operation: 'validateArguments'
      });
    }

    // Check input file exists
    if (this.options.in && !fs.existsSync(this.options.in)) {
      throw new CryptError(CryptErrorCode.CLI_FILE_NOT_FOUND, 'Input file not found', {
        operation: 'validateArguments',
        additionalInfo: {
          fileName: this.options.in
        }
      });
    }

    // Check output file doesn't exist (unless --force)
    if (this.options.out && fs.existsSync(this.options.out) && !this.options.force) {
      throw new CryptError(CryptErrorCode.CLI_FILE_EXISTS, 'Output file already exists', {
        operation: 'validateArguments',
        additionalInfo: {
          fileName: this.options.out
        }
      });
    }

    // Validate rounds if provided
    if (this.options.rounds && (this.options.rounds < 1000 || this.options.rounds > 10000000)) {
      throw new CryptError(CryptErrorCode.INVALID_INPUT, 'Rounds must be between 1000 and 10000000', {
        operation: 'validateArguments'
      });
    }
  }

  /**
   * Handle encryption operation
   */
  private async handleEncrypt(data: Buffer): Promise<void> {
    console.log('🔑 Generating encryption credentials...');
    const creds = await CosmicCrypt.generateCredentials();

    // Use provided password or generate new one
    if (this.options.password) {
      console.log('🔐 Using provided password...');
      creds.password = await this.derivePasswordFromString(this.options.password);
    } else if (this.options.phrase) {
      console.log('🔐 Using provided passphrase...');
      creds.password = Buffer.from(this.options.phrase, 'hex');
    }

    console.log('🔒 Encrypting data...');
    const encrypted = await CosmicCrypt.encrypt(data, creds);

    // Output results
    if (!this.options.password && !this.options.phrase) {
      console.log(`\n🔑 Generated password: ${creds.password.toString('hex')}`);
      console.log('⚠️  IMPORTANT: Save this password securely! It cannot be recovered.');
    }

    if (!this.options.out) {
      console.log(`\n📦 Encrypted data (hex): ${encrypted.toString('hex')}`);
    } else {
      fs.writeFileSync(this.options.out, encrypted);
      console.log(`\n💾 Encrypted content written to: ${this.options.out}`);
    }

    if (this.options.verbose) {
      console.log(`\n📊 Encryption details:`);
      console.log(`   - Data size: ${data.length} bytes`);
      console.log(`   - Encrypted size: ${encrypted.length} bytes`);
      console.log(`   - Overhead: ${encrypted.length - data.length} bytes`);
      console.log(`   - IV: ${creds.iv.toString('hex')}`);
      console.log(`   - Salt: ${creds.salt.toString('hex')}`);
    }
  }

  /**
   * Handle decryption operation
   */
  private async handleDecrypt(data: Buffer): Promise<void> {
    if (!this.options.password && !this.options.phrase) {
      throw new CryptError(CryptErrorCode.INVALID_INPUT, 'Must specify --password or --phrase for decryption', {
        operation: 'handleDecrypt'
      });
    }

    let password: Buffer;
    if (this.options.password) {
      console.log('🔐 Using provided password...');
      password = await this.derivePasswordFromString(this.options.password);
    } else {
      console.log('🔐 Using provided passphrase...');
      password = Buffer.from(this.options.phrase as string, 'hex');
    }

    console.log('🔓 Decrypting data...');
    const decrypted = await CosmicCrypt.decrypt(data, password);

    if (!this.options.out) {
      console.log(`\n📝 Decrypted data: ${decrypted.toString()}`);
    } else {
      fs.writeFileSync(this.options.out, decrypted);
      console.log(`\n💾 Decrypted content written to: ${this.options.out}`);
    }

    if (this.options.verbose) {
      console.log(`\n📊 Decryption details:`);
      console.log(`   - Encrypted size: ${data.length} bytes`);
      console.log(`   - Decrypted size: ${decrypted.length} bytes`);
    }
  }

  /**
   * Derive password from string using PBKDF2
   */
  private async derivePasswordFromString(password: string): Promise<Buffer> {
    const crypto = await import('node:crypto');
    const salt = crypto.randomBytes(32);
    const derived = crypto.pbkdf2Sync(password, salt, 100000, PASS_LENGTH, 'sha512');
    return derived;
  }

  /**
   * Handle errors with user-friendly messages
   */
  private handleError(error: unknown): void {
    if (error instanceof CryptError) {
      console.error(`\n❌ Error: ${error.message}`);

      if (this.options.verbose) {
        console.error(`\n🔍 Debug information:`);
        console.error(error.getDebugMessage());
      }
    } else if (error instanceof Error) {
      console.error(`\n❌ Error: ${error.message}`);

      if (this.options.verbose) {
        console.error(`\n🔍 Stack trace:`);
        console.error(error.stack);
      }
    } else {
      console.error(`\n❌ Unknown error:`, error);
    }
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    if (this.rl) {
      this.rl.close();
    }
  }
}

/**
 * Set up the enhanced CLI
 */
function setupCli(): void {
  program
    .name('cosmic-crypt')
    .description('🔐 CosmicCrypt - Modern encryption/decryption tool with enhanced security')
    .version('1.0.0')
    .option('--in <filename>', 'Input from file')
    .option('--out <filename>', 'Output to file')
    .option('--password <text>', 'Password (will be derived to 64 bytes)')
    .option('--phrase <text>', 'Raw 64-byte passphrase in hex (128 characters)')
    .option('--enc', 'Encrypt mode')
    .option('--dec', 'Decrypt mode')
    .option('--text <text>', 'In-memory encryption/decryption')
    .option('--interactive', 'Interactive mode (prompt for password)')
    .option('--progress', 'Show progress for long operations')
    .option('--force', 'Overwrite existing output files')
    .option('--verbose', 'Verbose output with detailed information')
    .option('--rounds <number>', 'Number of PBKDF2 rounds (1000-10000000)', '300000')
    .parse();

  const options = program.opts<CliOptions>();

  // Convert rounds to number
  if (options.rounds) {
    options.rounds = parseInt(String(options.rounds), 10);
  }

  const cli = new EnhancedCli(options);
  cli.run().catch((error) => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
}

// Export for testing
export { EnhancedCli, setupCli };

// Run CLI if this file is executed directly
if (require.main === module) {
  setupCli();
}
