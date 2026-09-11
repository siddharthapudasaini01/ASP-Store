import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from './server.js';

const app = createApp();

test('POST /api/people stores person details', async () => {
  const response = await app.request('/api/people', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Ankit',
      place: 'Kathmandu',
      email: 'ankit@example.com',
      phone: '9800000000',
      details: 'Interested in the product catalog' 
    })
  });

  assert.equal(response.status, 201);
  const body = await response.json();
  assert.equal(body.success, true);
  assert.equal(body.data.name, 'Ankit');
  assert.equal(body.data.place, 'Kathmandu');
});

test('GET /api/people returns list of saved people', async () => {
  const response = await app.request('/api/people');
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.ok(Array.isArray(body.data));
});
