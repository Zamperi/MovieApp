import request from 'supertest';
import { beforeEach, afterAll, describe, expect, it } from 'vitest';
import app from '../index';
import { prisma } from '../lib/prisma';

describe('Movies routes', () => {
  beforeEach(async () => {
    await prisma.movie.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('GET /health → 200', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('GET /api/movies → [] aluksi', async () => {
    const res = await request(app).get('/api/movies');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(0);
  });

  it('POST /api/movies ja GET/:id', async () => {
    const created = await request(app)
      .post('/api/movies')
      .send({ title: 'Inception', overview: 'Mind-bender' });
    expect(created.status).toBe(201);
    const id = created.body.id;

    const got = await request(app).get(`/api/movies/${id}`);
    expect(got.status).toBe(200);
    expect(got.body.id).toBe(id);
  });

  it('DELETE /api/movies/:id → 204 ja sen jälkeen 404', async () => {
    const created = await request(app).post('/api/movies').send({ title: 'Heat' });
    const id = created.body.id;

    const del = await request(app).delete(`/api/movies/${id}`);
    expect(del.status).toBe(204);

    const after = await request(app).get(`/api/movies/${id}`);
    expect(after.status).toBe(404);
  });

  it('POST /api/movies palauttaa 400, jos validointi epäonnistuu', async () => {
    const res = await request(app).post('/api/movies').send({ title: '' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBeTruthy();
  });
});
