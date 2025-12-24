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

  // cookie-login agent
  const loginAgent = async (email: string, password: string) => {
    const agent = request.agent(app);

    const res = await agent.post("/api/auth/login").send({ email, password });

    expect(res.status).toBe(200);
    expect(res.headers["set-cookie"]).toBeTruthy();

    return agent;
  };

  it("GET /api/groups/all returns GroupsResponseDTO (Array<GroupListItemDTO>)", async () => {
    const owner = await mkUser(10);

    const group = await prisma.group.create({
      data: {
        name: "List Test Group",
        isPublic: true,
        ownerId: owner.id,
      },
    });

    const res = await request(app).get("/api/groups/all");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    // GroupListItemDTO: { groupId, groupName }
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          groupId: group.id,
          groupName: "List Test Group",
        }),
      ])
    );
  });

  it("GET /api/groups/:groupId returns GroupWithMembersDTO", async () => {
    const owner = await mkUser(1);
    const member1 = await mkUser(2);
    const member2 = await mkUser(3);

    const group = await prisma.group.create({
      data: {
        name: "Test Group",
        isPublic: true,
        ownerId: owner.id,
        members: { connect: [{ id: member1.id }, { id: member2.id }] },
      },
    });

    const res = await request(app).get(`/api/groups/${group.id}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      groupId: group.id,
      groupName: "Test Group",
      isPublic: true,
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

  it("POST /api/groups 201 Created - returns GroupWithMembersDTO", async () => {
    const owner = await mkUser(999);
    const agent = await loginAgent(owner.email, "Password123!");

    // CreateGroupRequestDTO: { groupName, isPublic }
    const testData = {
      groupName: "Test Group",
      isPublic: true,
    };

    const res = await agent.post("/api/groups").send(testData);

    expect(res.status).toBe(201);
    expect(res.body).toEqual(
      expect.objectContaining({
        groupId: expect.any(Number),
        groupName: "Test Group",
        isPublic: true,
        members: expect.arrayContaining([owner.id]),
        createdAt: expect.any(String),
      })
    );
  });

  it("POST /api/groups 401 Unauthorized - Missing token", async () => {
    const testData = {
      groupName: "Test Group",
      isPublic: true,
    };

    const res = await request(app).post("/api/groups").send(testData);

    expect(res.status).toBe(401);
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});
