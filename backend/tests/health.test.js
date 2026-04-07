import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

process.env.PORT = process.env.PORT || '5000';
process.env.MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/swm_test';
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test-access-secret';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test-refresh-secret';

test('GET /api/v1/health returns success', async () => {
  const { default: app } = await import('../src/app.js');
  const res = await request(app).get('/api/v1/health');

  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'success');
  assert.ok(res.body.timestamp);
});
