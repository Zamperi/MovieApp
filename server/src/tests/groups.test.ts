import request from "supertest";
import { afterAll, describe, expect, it, beforeEach } from "vitest";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import app from "../index";

describe("Groups routes", () => {
  beforeEach(async () => {
    await prisma.group.deleteMany();
    await prisma.user.deleteMany();
  });

  const mkUser = (i: number) =>
    prisma.user.create({
      data: {
        email: `u${i}@test.com`,
        username: `user${i}`,
        firstname: `First${i}`,
        lastname: `Last${i}`,
        passwordHash: bcrypt.hashSync("Password123!", 10),
      },
    });

  it("GET /api/groups/all returns array of groups", async () => {
    const owner = await mkUser(10);

    const group = await prisma.group.create({
      data: {
        name: "List Test Group",
        public: true,
        ownerId: owner.id,
      },
    });

    const res = await request(app).get("/api/groups/all");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          groupId: group.id,
          groupName: "List Test Group",
        }),
      ])
    );
  });

  it("GET /api/groups/:groupId returns a single group", async () => {
    const owner = await mkUser(1);
    const member1 = await mkUser(2);
    const member2 = await mkUser(3);

    const group = await prisma.group.create({
      data: {
        name: "Test Group",
        public: true,
        ownerId: owner.id,
        members: { connect: [{ id: member1.id }, { id: member2.id }] },
      },
    });

    const res = await request(app).get(`/api/groups/${group.id}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      groupId: group.id,
      groupName: "Test Group",
      public: true,
      members: expect.arrayContaining([member1.id, member2.id]),
      createdAt: expect.any(String),
    });
  });

  it("GET /api/groups/:groupId returns 400 for invalid groupId", async () => {
    const res = await request(app).get("/api/groups/failure");

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      error: "BAD_REQUEST",
      message: "Invalid group id",
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
