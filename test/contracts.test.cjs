const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  healthResponseSchema,
  healthResponseSchemaFor,
  apiServiceSchema,
} = require('../.test-build/lib/contracts');
test('health contract rejects false readiness and live integration claims', () => {
  const valid = {
    status: 'ok',
    service: 'trusted-assistance-admin-api',
    version: '0.1.0',
    phase: 0,
    integrations: 'mock',
    timestamp: new Date().toISOString(),
  };
  assert.equal(healthResponseSchema.safeParse(valid).success, true);
  for (const change of [
    { status: 'ready-for-launch' },
    { integrations: 'live' },
    { timestamp: 'today' },
  ])
    assert.equal(healthResponseSchema.safeParse({ ...valid, ...change }).success, false);
});
test('each frontend health contract rejects responses from another backend', () => {
  for (const expected of apiServiceSchema.options) {
    const schema = healthResponseSchemaFor(expected);
    for (const actual of apiServiceSchema.options) {
      const response = {
        status: 'ok',
        service: actual,
        version: '0.1.0',
        phase: 0,
        integrations: 'mock',
        timestamp: new Date().toISOString(),
      };
      assert.equal(schema.safeParse(response).success, expected === actual);
    }
  }
});
