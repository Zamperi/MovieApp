import request from "supertest";
import { afterAll, describe, expect, it, beforeEach, afterEach } from "vitest";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import app from "../index";

describe("Groups routes", () => {
  beforeEach(async () => {
    await prisma.group.deleteMany();
    await prisma.user.deleteMany();
  });

  afterEach(async () => {
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

  //Group create
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

  //Group delete
  it("DELETE /api/groups/{groupId} - returns GroupDeleteDTO", async () => {
    const owner = await mkUser(999);
    const agent = await loginAgent(owner.email, "Password123!");

    // CreateGroupRequestDTO: { groupName, isPublic }
    const testData = {
      groupName: "Test Group",
      isPublic: true,
    };

    const createRes = await agent.post("/api/groups").send(testData);

    const res = await agent.delete(`/api/groups/${createRes.body.groupId}`);

    expect(res.status).toBe(200);
  });

  it("DELETE /api/groups/{groupId} - No token provided test (logout and delete)", async () => {
    const owner = await mkUser(999);
    const agent = await loginAgent(owner.email, "Password123!");

    const createRes = await agent.post("/api/groups").send({ groupName: "Test Group", isPublic: true });
    await agent.post("/api/auth/logout").expect(200);

    const res = await agent.delete(`/api/groups/${createRes.body.groupId}`);
    expect(res.status).toBe(401);
  });

  it("DELETE /api/groups/{groupId} - Invalid groupId", async () => {
    const owner = await mkUser(999);
    const agent = await loginAgent(owner.email, "Password123!");

    const res = await agent.delete(`/api/groups/failure`);
    expect(res.status).toBe(400);
  })

  it("DELETE /api/groups/{groupId} - Requester is not a group owner", async () => {
    const owner = await mkUser(999);
    const agent = await loginAgent(owner.email, "Password123!");

    const createRes = await agent.post("/api/groups").send({ groupName: "Test Group", isPublic: true });
    await agent.post("/api/auth/logout").expect(200);

    const notOwner = await mkUser(998);
    const notOwnerAgent = await loginAgent(notOwner.email, "Password123!");

    const res = await notOwnerAgent.delete(`/api/groups/${createRes.body.groupId}`);
    expect(res.status).toBe(403);
  })

  it("DELETE /api/groups/{groupId} - Group doesn't exist or is already deleted", async () => {
    const owner = await mkUser(999);
    const agent = await loginAgent(owner.email, "Password123!");

    const res = await agent.delete(`/api/groups/1234`);
    expect(res.status).toBe(404);
  })  

  afterAll(async () => {
    await prisma.$disconnect();
  });
});