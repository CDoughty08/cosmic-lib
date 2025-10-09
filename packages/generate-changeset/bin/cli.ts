#!/usr/bin/env node

import { Command } from 'commander';

const program = new Command();

program.name('generate-changeset').description('Generate changeset utility (not yet implemented)').version('1.0.0');

program
  .command('generate')
  .description('Generate a new changeset')
  .action(() => {
    console.error('generate-changeset is not yet implemented');
    process.exit(1);
  });

program.parse();
