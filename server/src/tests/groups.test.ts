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
      owner: { id: owner.id, username: owner.username },
      members: expect.arrayContaining([
        { id: member1.id, username: member1.username },
        { id: member2.id, username: member2.username },
      ]),
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
        owner: { id: owner.id, username: owner.username },
        members: expect.arrayContaining([{ id: owner.id, username: owner.username }]),
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

  it("POST /api/groups/:groupId/join-requests -> 201 creates join request", async () => {
    const owner = await mkUser(999);
    const ownerAgent = await loginAgent(owner.email, "Password123!");

    const createRes = await ownerAgent
      .post("/api/groups")
      .send({ groupName: "Test Group", isPublic: true });

    expect(createRes.status).toBe(201);
    expect(typeof createRes.body?.groupId).toBe("number");

    const user = await mkUser(998);
    const userAgent = await loginAgent(user.email, "Password123!");

    const res = await userAgent.post(
      `/api/groups/${createRes.body.groupId}/join-requests`
    );

    expect(res.status).toBe(201);

    expect(typeof res.body?.requestId).toBe("number");
    expect(res.body?.groupId).toBe(createRes.body.groupId);
    expect(res.body?.userId).toBe(user.id);
    expect(res.body?.status).toBe("pending");
    expect(typeof res.body?.createdAt).toBe("string");
  });

  it("GET /api/groups/:groupId/join-requests/me -> 200 returns current status", async () => {
    const owner = await mkUser(999);
    const ownerAgent = await loginAgent(owner.email, "Password123!");

    const createRes = await ownerAgent
      .post("/api/groups")
      .send({ groupName: "Test Group", isPublic: true });

    expect(createRes.status).toBe(201);

    const requester = await mkUser(998);
    const requesterAgent = await loginAgent(requester.email, "Password123!");

    await requesterAgent.post(`/api/groups/${createRes.body.groupId}/join-requests`);

    const statusRes = await requesterAgent.get(`/api/groups/${createRes.body.groupId}/join-requests/me`);

    expect(statusRes.status).toBe(200);
    expect(statusRes.body).toEqual(
      expect.objectContaining({
        groupId: createRes.body.groupId,
        userId: requester.id,
        status: "pending",
        requestId: expect.any(Number),
      })
    );
  });

  it("POST /api/groups/:groupId/join-requests -> 400 when groupId is not a positive integer", async () => {
    const user = await mkUser(998);
    const userAgent = await loginAgent(user.email, "Password123!");

    const res = await userAgent.post("/api/groups/-1/join-requests");

    expect(res.status).toBe(400);
    expect(res.body?.error).toBe("VALIDATION_ERROR");
    expect(typeof res.body?.message).toBe("string");
  });

  it("POST /api/groups/:groupId/join-requests -> 401 missing or invalid authentication", async () => {
    const owner = await mkUser(999);
    const ownerAgent = await loginAgent(owner.email, "Password123!");

    const createRes = await ownerAgent
      .post("/api/groups")
      .send({ groupName: "Test Group", isPublic: true });

    expect(createRes.status).toBe(201);
    expect(typeof createRes.body?.groupId).toBe("number");

    const res = await request(app).post(
      `/api/groups/${createRes.body.groupId}/join-requests`
    );

    expect(res.status).toBe(401);
    expect(res.body?.error).toBe("UNAUTHORIZED");
    expect(typeof res.body?.message).toBe("string");
  });

  it("POST /api/groups/:groupId/join-requests -> 403 requester is a group owner", async () => {
    const owner = await mkUser(999);
    const ownerAgent = await loginAgent(owner.email, "Password123!");

    const createRes = await ownerAgent
      .post("/api/groups")
      .send({ groupName: "Test Group", isPublic: true });

    expect(createRes.status).toBe(201);
    expect(typeof createRes.body?.groupId).toBe("number");

    const res = await ownerAgent.post(
      `/api/groups/${createRes.body.groupId}/join-requests`
    );

    expect(res.status).toBe(403);
    expect(res.body?.error).toBe("FORBIDDEN");
    expect(typeof res.body?.message).toBe("string");
  });

  it("POST /api/groups/:groupId/join-requests -> Group not found", async () => {
    const owner = await mkUser(999);
    const ownerAgent = await loginAgent(owner.email, "Password123!");

    const res = await ownerAgent.post(
      `/api/groups/99999999/join-requests`
    );

    expect(res.status).toBe(404);
    expect(res.body?.error).toBe("NOT_FOUND");
    expect(typeof res.body?.message).toBe("string");
  });

  it("POST /api/groups/:groupId/join-requests -> Join request already pending", async () => {
    const owner = await mkUser(999);
    const ownerAgent = await loginAgent(owner.email, "Password123!");

    const createRes = await ownerAgent
      .post("/api/groups")
      .send({ groupName: "Test Group", isPublic: true });

    expect(createRes.status).toBe(201);
    expect(typeof createRes.body?.groupId).toBe("number");

    const user = await mkUser(998);
    const userAgent = await loginAgent(user.email, "Password123!");

    const firstRes = await userAgent.post(
      `/api/groups/${createRes.body.groupId}/join-requests`
    );
    expect(firstRes.status).toBe(201);

    const res = await userAgent.post(
      `/api/groups/${createRes.body.groupId}/join-requests`
    );

    expect(res.status).toBe(409);
    expect(res.body?.error).toBe("CONFLICT");
    expect(typeof res.body?.message).toBe("string");
  });

  it("POST /api/groups/:groupId/join-requests/:requestId/approve -> 200 approves pending join request (owner only)", async () => {
    const owner = await mkUser(999);
    const ownerAgent = await loginAgent(owner.email, "Password123!");

    const createRes = await ownerAgent
      .post("/api/groups")
      .send({ groupName: "Test Group", isPublic: true });

    expect(createRes.status).toBe(201);
    expect(typeof createRes.body?.groupId).toBe("number");

    const user = await mkUser(998);
    const userAgent = await loginAgent(user.email, "Password123!");

    const joinRes = await userAgent.post(
      `/api/groups/${createRes.body.groupId}/join-requests`
    );
    expect(joinRes.status).toBe(201);
    expect(typeof joinRes.body?.requestId).toBe("number");

    const res = await ownerAgent.post(
      `/api/groups/${createRes.body.groupId}/join-requests/${joinRes.body.requestId}/approve`
    );

    expect(res.status).toBe(200);

    // JoinRequestDTO assertions
    expect(res.body?.requestId).toBe(joinRes.body.requestId);
    expect(res.body?.groupId).toBe(createRes.body.groupId);
    expect(res.body?.userId).toBe(user.id);
    expect(res.body?.status).toBe("approved");
    expect(typeof res.body?.createdAt).toBe("string");
    expect(typeof res.body?.decidedAt).toBe("string");
  });

  it("POST /api/groups/:groupId/join-requests/:requestId/decline -> 200 declines pending join request (owner only)", async () => {
    const owner = await mkUser(999);
    const ownerAgent = await loginAgent(owner.email, "Password123!");

    const createRes = await ownerAgent
      .post("/api/groups")
      .send({ groupName: "Test Group", isPublic: true });

    expect(createRes.status).toBe(201);
    expect(typeof createRes.body?.groupId).toBe("number");

    const user = await mkUser(998);
    const userAgent = await loginAgent(user.email, "Password123!");

    const joinRes = await userAgent.post(
      `/api/groups/${createRes.body.groupId}/join-requests`
    );
    expect(joinRes.status).toBe(201);
    expect(typeof joinRes.body?.requestId).toBe("number");

    const res = await ownerAgent.post(
      `/api/groups/${createRes.body.groupId}/join-requests/${joinRes.body.requestId}/decline`
    );

    expect(res.status).toBe(200);

    // JoinRequestDTO assertions
    expect(res.body?.requestId).toBe(joinRes.body.requestId);
    expect(res.body?.groupId).toBe(createRes.body.groupId);
    expect(res.body?.userId).toBe(user.id);
    expect(res.body?.status).toBe("rejected");
    expect(typeof res.body?.createdAt).toBe("string");
    expect(typeof res.body?.decidedAt).toBe("string");
  });

  it("POST /api/groups/:groupId/join-requests/:requestId/approve -> 400 invalid groupId or requestId", async () => {
    const owner = await mkUser(999);
    const ownerAgent = await loginAgent(owner.email, "Password123!");

    const res = await ownerAgent.post(
      `/api/groups/-1/join-requests/0/approve`
    );

    expect(res.status).toBe(400);
    expect(res.body?.error).toBe("VALIDATION_ERROR");
    expect(typeof res.body?.message).toBe("string");
  });

  it("POST /api/groups/:groupId/join-requests/:requestId/decline -> 400 invalid groupId or requestId", async () => {
    const owner = await mkUser(999);
    const ownerAgent = await loginAgent(owner.email, "Password123!");

    const res = await ownerAgent.post(
      `/api/groups/-1/join-requests/0/decline`
    );

    expect(res.status).toBe(400);
    expect(res.body?.error).toBe("VALIDATION_ERROR");
    expect(typeof res.body?.message).toBe("string");
  });

  it("POST /api/groups/:groupId/join-requests/:requestId/approve -> 401 missing or invalid authentication", async () => {
    const res = await request(app).post(`/api/groups/1/join-requests/1/approve`);

    expect(res.status).toBe(401);
    expect(res.body?.error).toBe("UNAUTHORIZED");
    expect(typeof res.body?.message).toBe("string");
  });

  it("POST /api/groups/:groupId/join-requests/:requestId/decline -> 401 missing or invalid authentication", async () => {
    const res = await request(app).post(`/api/groups/1/join-requests/1/decline`);

    expect(res.status).toBe(401);
    expect(res.body?.error).toBe("UNAUTHORIZED");
    expect(typeof res.body?.message).toBe("string");
  });

  it("POST /api/groups/:groupId/join-requests/:requestId/approve -> 403 requester is not group owner", async () => {
    const owner = await mkUser(999);
    const ownerAgent = await loginAgent(owner.email, "Password123!");

    const createRes = await ownerAgent
      .post("/api/groups")
      .send({ groupName: "Test Group", isPublic: true });

    expect(createRes.status).toBe(201);

    const user = await mkUser(998);
    const userAgent = await loginAgent(user.email, "Password123!");

    const joinRes = await userAgent.post(
      `/api/groups/${createRes.body.groupId}/join-requests`
    );
    expect(joinRes.status).toBe(201);

    const notOwner = await mkUser(997);
    const notOwnerAgent = await loginAgent(notOwner.email, "Password123!");

    const res = await notOwnerAgent.post(
      `/api/groups/${createRes.body.groupId}/join-requests/${joinRes.body.requestId}/approve`
    );

    expect(res.status).toBe(403);
    expect(res.body?.error).toBe("FORBIDDEN");
    expect(typeof res.body?.message).toBe("string");
  });

  it("POST /api/groups/:groupId/join-requests/:requestId/decline -> 403 requester is not group owner", async () => {
    const owner = await mkUser(999);
    const ownerAgent = await loginAgent(owner.email, "Password123!");

    const createRes = await ownerAgent
      .post("/api/groups")
      .send({ groupName: "Test Group", isPublic: true });

    expect(createRes.status).toBe(201);

    const user = await mkUser(998);
    const userAgent = await loginAgent(user.email, "Password123!");

    const joinRes = await userAgent.post(
      `/api/groups/${createRes.body.groupId}/join-requests`
    );
    expect(joinRes.status).toBe(201);

    const notOwner = await mkUser(997);
    const notOwnerAgent = await loginAgent(notOwner.email, "Password123!");

    const res = await notOwnerAgent.post(
      `/api/groups/${createRes.body.groupId}/join-requests/${joinRes.body.requestId}/decline`
    );

    expect(res.status).toBe(403);
    expect(res.body?.error).toBe("FORBIDDEN");
    expect(typeof res.body?.message).toBe("string");
  });

  it("POST /api/groups/:groupId/join-requests/:requestId/approve -> 404 group not found", async () => {
    const owner = await mkUser(999);
    const ownerAgent = await loginAgent(owner.email, "Password123!");

    const res = await ownerAgent.post(
      `/api/groups/99999999/join-requests/1/approve`
    );

    expect(res.status).toBe(404);
    expect(res.body?.error).toBe("NOT_FOUND");
    expect(typeof res.body?.message).toBe("string");
  });

  it("POST /api/groups/:groupId/join-requests/:requestId/decline -> 404 group not found", async () => {
    const owner = await mkUser(999);
    const ownerAgent = await loginAgent(owner.email, "Password123!");

    const res = await ownerAgent.post(
      `/api/groups/99999999/join-requests/1/decline`
    );

    expect(res.status).toBe(404);
    expect(res.body?.error).toBe("NOT_FOUND");
    expect(typeof res.body?.message).toBe("string");
  });

  it("POST /api/groups/:groupId/join-requests/:requestId/approve -> 404 join request not found", async () => {
    const owner = await mkUser(999);
    const ownerAgent = await loginAgent(owner.email, "Password123!");

    const createRes = await ownerAgent
      .post("/api/groups")
      .send({ groupName: "Test Group", isPublic: true });

    expect(createRes.status).toBe(201);

    const res = await ownerAgent.post(
      `/api/groups/${createRes.body.groupId}/join-requests/99999999/approve`
    );

    expect(res.status).toBe(404);
    expect(res.body?.error).toBe("NOT_FOUND");
    expect(typeof res.body?.message).toBe("string");
  });

  it("POST /api/groups/:groupId/join-requests/:requestId/decline -> 404 join request not found", async () => {
    const owner = await mkUser(999);
    const ownerAgent = await loginAgent(owner.email, "Password123!");

    const createRes = await ownerAgent
      .post("/api/groups")
      .send({ groupName: "Test Group", isPublic: true });

    expect(createRes.status).toBe(201);

    const res = await ownerAgent.post(
      `/api/groups/${createRes.body.groupId}/join-requests/99999999/decline`
    );

    expect(res.status).toBe(404);
    expect(res.body?.error).toBe("NOT_FOUND");
    expect(typeof res.body?.message).toBe("string");
  });

  it("POST /api/groups/:groupId/join-requests/:requestId/approve -> 409 request not pending", async () => {
    const owner = await mkUser(999);
    const ownerAgent = await loginAgent(owner.email, "Password123!");

    const createRes = await ownerAgent
      .post("/api/groups")
      .send({ groupName: "Test Group", isPublic: true });

    expect(createRes.status).toBe(201);

    const user = await mkUser(998);
    const userAgent = await loginAgent(user.email, "Password123!");

    const joinRes = await userAgent.post(
      `/api/groups/${createRes.body.groupId}/join-requests`
    );
    expect(joinRes.status).toBe(201);

    const firstApprove = await ownerAgent.post(
      `/api/groups/${createRes.body.groupId}/join-requests/${joinRes.body.requestId}/approve`
    );
    expect(firstApprove.status).toBe(200);

    const res = await ownerAgent.post(
      `/api/groups/${createRes.body.groupId}/join-requests/${joinRes.body.requestId}/approve`
    );

    expect(res.status).toBe(409);
    expect(res.body?.error).toBe("CONFLICT");
    expect(typeof res.body?.message).toBe("string");
  });

  it("POST /api/groups/:groupId/join-requests/:requestId/decline -> 409 request not pending", async () => {
    const owner = await mkUser(999);
    const ownerAgent = await loginAgent(owner.email, "Password123!");

    const createRes = await ownerAgent
      .post("/api/groups")
      .send({ groupName: "Test Group", isPublic: true });

    expect(createRes.status).toBe(201);

    const user = await mkUser(998);
    const userAgent = await loginAgent(user.email, "Password123!");

    const joinRes = await userAgent.post(
      `/api/groups/${createRes.body.groupId}/join-requests`
    );
    expect(joinRes.status).toBe(201);

    const firstDecline = await ownerAgent.post(
      `/api/groups/${createRes.body.groupId}/join-requests/${joinRes.body.requestId}/decline`
    );
    expect(firstDecline.status).toBe(200);

    const res = await ownerAgent.post(
      `/api/groups/${createRes.body.groupId}/join-requests/${joinRes.body.requestId}/decline`
    );

    expect(res.status).toBe(409);
    expect(res.body?.error).toBe("CONFLICT");
    expect(typeof res.body?.message).toBe("string");
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });
});