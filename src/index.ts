#!/usr/bin/env node
import { resolve } from 'node:path';
import { Command } from 'commander';
import pc from 'picocolors';
import { generateMock, generateMockFactory } from './mock-generator.js';
import { readInterfaces } from './reader.js';

export { generateMock, generateMockFactory, readInterfaces };
export type { ParsedInterface, ParsedProperty } from './reader.js';
export type { MockGeneratorOptions } from './mock-generator.js';

const program = new Command();

program
  .name('typescript-mock-builder')
  .description('Read a TypeScript interface and generate a typed mock object')
  .version('1.0.0')
  .argument('<file>', 'TypeScript file containing the interface')
  .option('--interface <name>', 'specific interface to generate mock for')
  .option('--factory', 'generate a factory function instead of a plain object')
  .option('--export', 'add export keyword to the generated mock')
  .option('--var <name>', 'custom variable/function name for the mock')
  .action((filePath: string, opts: { interface?: string; factory?: boolean; export?: boolean; var?: string }) => {
    const resolvedPath = resolve(filePath);

    let interfaces;
    try {
      interfaces = readInterfaces(resolvedPath);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(pc.red(`Error reading ${filePath}: ${msg}`));
      process.exit(1);
    }

    if (interfaces.length === 0) {
      console.log(pc.yellow('No interfaces or type aliases found in file.'));
      process.exit(0);
    }

    const targets = opts.interface
      ? interfaces.filter((i) => i.name === opts.interface)
      : interfaces;

    if (targets.length === 0) {
      console.error(pc.red(`Interface "${opts.interface}" not found in ${filePath}`));
      console.error(pc.dim(`Available: ${interfaces.map((i) => i.name).join(', ')}`));
      process.exit(1);
    }

    const mockOpts = { varName: opts.var, exportMock: opts.export };

    for (const iface of targets) {
      const output = opts.factory
        ? generateMockFactory(iface, mockOpts)
        : generateMock(iface, mockOpts);
      console.log('');
      console.log(pc.dim(`// Mock for ${iface.name}`));
      console.log(output);
    }

    console.log('');
  });

program.parse();
