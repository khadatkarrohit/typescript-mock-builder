import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { readInterfaces } from '../src/reader.ts';

const fixturePath = resolve('fixtures/User.ts');

describe('readInterfaces', () => {
  it('reads all interfaces from a file', () => {
    const result = readInterfaces(fixturePath);
    const names = result.map((i) => i.name);
    assert.ok(names.includes('User'));
    assert.ok(names.includes('Address'));
  });

  it('reads type aliases as interfaces', () => {
    const result = readInterfaces(fixturePath);
    const names = result.map((i) => i.name);
    assert.ok(names.includes('Product'));
  });

  it('parses required and optional properties correctly', () => {
    const result = readInterfaces(fixturePath);
    const user = result.find((i) => i.name === 'User')!;
    assert.ok(user, 'User interface should exist');

    const phone = user.properties.find((p) => p.name === 'phone');
    assert.ok(phone, 'phone property should exist');
    assert.equal(phone.optional, true);

    const id = user.properties.find((p) => p.name === 'id');
    assert.ok(id, 'id property should exist');
    assert.equal(id.optional, false);
  });

  it('captures correct types for properties', () => {
    const result = readInterfaces(fixturePath);
    const user = result.find((i) => i.name === 'User')!;

    const email = user.properties.find((p) => p.name === 'email');
    assert.equal(email?.type, 'string');

    const isActive = user.properties.find((p) => p.name === 'isActive');
    assert.equal(isActive?.type, 'boolean');
  });

  it('parses Address interface properties', () => {
    const result = readInterfaces(fixturePath);
    const address = result.find((i) => i.name === 'Address')!;
    assert.equal(address.properties.length, 4);
    const propNames = address.properties.map((p) => p.name);
    assert.deepEqual(propNames, ['street', 'city', 'zip', 'country']);
  });

  it('throws on non-existent file', () => {
    assert.throws(() => readInterfaces('/nonexistent/file.ts'));
  });
});
