import request from "supertest";
import { beforeEach, afterAll, describe, expect, it } from 'vitest';
import app from '../index';
import { prisma } from '../lib/prisma';

describe('Users routes', () => {
    beforeEach(async () => {
        await prisma.user.deleteMany();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it('GET /api/users palauttaa listan', async () => {
        const res = await request(app).get('/api/users');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

});