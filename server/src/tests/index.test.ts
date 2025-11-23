import request from 'supertest';
import { afterAll, it, expect } from 'vitest';
import { prisma } from '../lib/prisma';
import app from '../index';  // nyt löytyy

it('GET /health', async () => {
  const res = await request(app).get('/health');
  expect(res.status).toBe(200);
  expect(res.body.ok).toBe(true);
});

afterAll(async () => {
  await prisma.$disconnect();
});
