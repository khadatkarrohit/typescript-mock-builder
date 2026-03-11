# typescript-mock-builder

[![npm version](https://img.shields.io/npm/v/typescript-mock-builder)](https://www.npmjs.com/package/typescript-mock-builder)
[![npm downloads](https://img.shields.io/npm/dm/typescript-mock-builder)](https://www.npmjs.com/package/typescript-mock-builder)

Zero-config CLI and library that reads a TypeScript interface and instantly generates a typed mock object or factory function — no compiler plugins, no schemas, no setup.

**[View on npm →](https://www.npmjs.com/package/typescript-mock-builder)**

## Install

```bash
# As a dev dependency (recommended)
npm install -D typescript-mock-builder

# Or globally
npm install -g typescript-mock-builder
```

## Quick start

```bash
npx typescript-mock-builder ./src/types/User.ts
```

Paste the output directly into your test file. Done.

## Usage

Given a TypeScript file:

```ts
// src/types/User.ts
export interface User {
  id: number;
  email: string;
  name: string;
  createdAt: Date;
  isActive: boolean;
  phone?: string;
}
```

### Generate a plain mock object

```bash
npx typescript-mock-builder ./src/types/User.ts
```

Output:

```ts
const mockUser: User = {
  id: 1,
  email: 'mock@example.com',
  name: 'mock-name',
  createdAt: new Date(),
  isActive: false,
};
```

### Generate a factory function

```bash
npx typescript-mock-builder ./src/types/User.ts --factory
```

Output:

```ts
function createUser(overrides: Partial<User> = {}): User {
  return {
    id: 1,
    email: 'mock@example.com',
    name: 'mock-name',
    createdAt: new Date(),
    isActive: false,
    ...overrides,
  };
}
```

Use in tests:

```ts
const user = createUser({ email: 'custom@test.com' });
```

## Options

| Flag | Description |
|------|-------------|
| `--interface <name>` | Generate mock for a specific interface only |
| `--factory` | Generate a factory function instead of a plain object |
| `--export` | Add `export` keyword to the generated mock |
| `--var <name>` | Custom variable or function name |

### Examples

```bash
# Specific interface from a file with multiple interfaces
npx typescript-mock-builder ./src/types.ts --interface Product

# With export + custom name
npx typescript-mock-builder ./src/types.ts --export --var testUser

# Factory with export
npx typescript-mock-builder ./src/types.ts --factory --export
```

## How mock values are chosen

The generator uses name-based heuristics first, then type-based fallbacks:

| Property name pattern | Generated value |
|-----------------------|-----------------|
| `id`, `*Id` | `1` |
| `email`, `*Email` | `'mock@example.com'` |
| `url`, `*Url`, `*Uri` | `'https://example.com'` |
| `name`, `*Name` | `'mock-<propName>'` |
| `token`, `*Token` | `'mock-token'` |
| `phone`, `*Phone` | `'+1234567890'` |
| `createdAt`, `updatedAt`, `*Date`, `*At` | `new Date()` |

| Type | Generated value |
|------|-----------------|
| `string` | `'mock-<propName>'` |
| `number` | `0` |
| `boolean` | `false` |
| `Date` | `new Date()` |
| `string[]`, `number[]`, `T[]` | `[]` |
| Union (`A \| B \| null`) | picks first non-null option |
| anything else | `{}` |

Optional properties are skipped by default.

## Use as a library

```ts
import { readInterfaces, generateMock, generateMockFactory } from 'typescript-mock-builder';

const interfaces = readInterfaces('./src/types/User.ts');
const code = generateMock(interfaces[0]);
const factory = generateMockFactory(interfaces[0], { exportMock: true });
```

## Works with type aliases too

```ts
export type Product = {
  id: number;
  name: string;
};
```

Type aliases that are object types are parsed the same way as interfaces.

## License

MIT
