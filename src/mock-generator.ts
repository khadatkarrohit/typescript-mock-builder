import type { ParsedInterface, ParsedProperty } from './reader.ts';

export interface MockGeneratorOptions {
  varName?: string;
  exportMock?: boolean;
}

export function generateMock(iface: ParsedInterface, opts: MockGeneratorOptions = {}): string {
  const varName = opts.varName ?? `mock${iface.name}`;
  const exportKeyword = opts.exportMock ? 'export ' : '';
  const lines: string[] = [];

  lines.push(`${exportKeyword}const ${varName}: ${iface.name} = {`);

  for (const prop of iface.properties) {
    if (prop.optional) continue; // skip optional by default
    const value = mockValue(prop);
    lines.push(`  ${prop.name}: ${value},`);
  }

  lines.push('};');

  return lines.join('\n');
}

export function generateMockFactory(iface: ParsedInterface, opts: MockGeneratorOptions = {}): string {
  const varName = opts.varName ?? `create${iface.name}`;
  const exportKeyword = opts.exportMock ? 'export ' : '';
  const lines: string[] = [];

  lines.push(`${exportKeyword}function ${varName}(overrides: Partial<${iface.name}> = {}): ${iface.name} {`);
  lines.push('  return {');

  for (const prop of iface.properties) {
    if (prop.optional) continue;
    const value = mockValue(prop);
    lines.push(`    ${prop.name}: ${value},`);
  }

  lines.push('    ...overrides,');
  lines.push('  };');
  lines.push('}');

  return lines.join('\n');
}

function mockValue(prop: ParsedProperty): string {
  const t = prop.type.toLowerCase();
  const name = prop.name.toLowerCase();

  // Name-based heuristics first
  if (name === 'id' || name.endsWith('id')) return '1';
  if (name === 'email' || name.endsWith('email')) return `'mock@example.com'`;
  if (name === 'url' || name.endsWith('url') || name.endsWith('uri')) return `'https://example.com'`;
  if (name === 'name' || name.endsWith('name')) return `'mock-${prop.name}'`;
  if (name === 'password' || name === 'hash') return `'mock-password'`;
  if (name === 'token' || name.endsWith('token')) return `'mock-token'`;
  if (name === 'phone' || name.endsWith('phone')) return `'+1234567890'`;
  if (name === 'count' || name === 'total' || name === 'amount') return '0';
  if (name === 'createdat' || name === 'updatedat' || name.endsWith('date') || name.endsWith('at')) {
    return 'new Date()';
  }

  // Type-based fallbacks
  if (t === 'string') return `'mock-${prop.name}'`;
  if (t === 'number' || t === 'int' || t === 'float') return '0';
  if (t === 'boolean') return 'false';
  if (t === 'date') return 'new Date()';
  if (t.startsWith('string[]') || t === 'array<string>') return '[]';
  if (t.startsWith('number[]') || t === 'array<number>') return '[]';
  if (t.endsWith('[]') || t.startsWith('array<')) return '[]';
  if (t === 'null') return 'null';
  if (t === 'undefined') return 'undefined';
  if (t.includes('|')) {
    // Union — pick first non-null/undefined option
    const options = t.split('|').map((s) => s.trim()).filter((s) => s !== 'null' && s !== 'undefined');
    if (options.length > 0) return mockValue({ ...prop, type: options[0] });
  }

  return '{}';
}
