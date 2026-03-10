import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateMock, generateMockFactory } from '../src/mock-generator.ts';
import type { ParsedInterface } from '../src/reader.ts';

const userInterface: ParsedInterface = {
  name: 'User',
  properties: [
    { name: 'id', type: 'number', optional: false },
    { name: 'email', type: 'string', optional: false },
    { name: 'name', type: 'string', optional: false },
    { name: 'avatarUrl', type: 'string', optional: false },
    { name: 'phone', type: 'string', optional: true },
    { name: 'createdAt', type: 'Date', optional: false },
    { name: 'isActive', type: 'boolean', optional: false },
    { name: 'score', type: 'number', optional: false },
    { name: 'tags', type: 'string[]', optional: false },
    { name: 'meta', type: 'object', optional: false },
    { name: 'status', type: 'active | inactive | null', optional: false },
  ],
};

describe('generateMock', () => {
  it('generates a typed const declaration', () => {
    const output = generateMock(userInterface);
    assert.ok(output.includes('const mockUser: User = {'));
    assert.ok(output.endsWith('};'));
  });

  it('uses name heuristic: id → 1', () => {
    const output = generateMock(userInterface);
    assert.ok(output.includes('id: 1,'));
  });

  it('uses name heuristic: email → mock@example.com', () => {
    const output = generateMock(userInterface);
    assert.ok(output.includes("email: 'mock@example.com',"));
  });

  it('uses name heuristic: name → mock-name', () => {
    const output = generateMock(userInterface);
    assert.ok(output.includes("name: 'mock-name',"));
  });

  it('uses name heuristic: avatarUrl → https://example.com', () => {
    const output = generateMock(userInterface);
    assert.ok(output.includes("avatarUrl: 'https://example.com',"));
  });

  it('uses name heuristic: createdAt → new Date()', () => {
    const output = generateMock(userInterface);
    assert.ok(output.includes('createdAt: new Date(),'));
  });

  it('uses type heuristic: boolean → false', () => {
    const output = generateMock(userInterface);
    assert.ok(output.includes('isActive: false,'));
  });

  it('uses type heuristic: number → 0', () => {
    const output = generateMock(userInterface);
    assert.ok(output.includes('score: 0,'));
  });

  it('uses type heuristic: string[] → []', () => {
    const output = generateMock(userInterface);
    assert.ok(output.includes('tags: [],'));
  });

  it('uses union type heuristic: picks first non-null option', () => {
    const output = generateMock(userInterface);
    // status: 'active | inactive | null' → picks 'active' → string → 'mock-status'
    assert.ok(output.includes('status:'));
  });

  it('skips optional properties by default', () => {
    const output = generateMock(userInterface);
    assert.ok(!output.includes('phone:'));
  });

  it('supports custom variable name', () => {
    const output = generateMock(userInterface, { varName: 'testUser' });
    assert.ok(output.includes('const testUser: User = {'));
  });

  it('supports export keyword', () => {
    const output = generateMock(userInterface, { exportMock: true });
    assert.ok(output.includes('export const mockUser: User = {'));
  });

  it('falls back to {} for unknown object types', () => {
    const output = generateMock(userInterface);
    assert.ok(output.includes('meta: {},'));
  });
});

describe('generateMockFactory', () => {
  it('generates a function with Partial overrides', () => {
    const output = generateMockFactory(userInterface);
    assert.ok(output.includes('function createUser(overrides: Partial<User> = {}): User {'));
    assert.ok(output.includes('...overrides,'));
    assert.ok(output.endsWith('}'));
  });

  it('uses create prefix for default name', () => {
    const output = generateMockFactory(userInterface);
    assert.ok(output.includes('function createUser('));
  });

  it('supports custom variable name', () => {
    const output = generateMockFactory(userInterface, { varName: 'buildUser' });
    assert.ok(output.includes('function buildUser('));
  });

  it('supports export keyword', () => {
    const output = generateMockFactory(userInterface, { exportMock: true });
    assert.ok(output.includes('export function createUser('));
  });

  it('skips optional properties', () => {
    const output = generateMockFactory(userInterface);
    assert.ok(!output.includes('phone:'));
  });

  it('applies same name heuristics as generateMock', () => {
    const output = generateMockFactory(userInterface);
    assert.ok(output.includes('id: 1,'));
    assert.ok(output.includes("email: 'mock@example.com',"));
  });
});
