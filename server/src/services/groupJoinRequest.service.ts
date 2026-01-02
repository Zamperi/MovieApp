import { prisma } from "../lib/prisma";
import { groupJoinRequestRepo } from "../repositories/groupJoinRequest.repo";
import { groupRepo } from "../repositories/group.repo";

export const groupJoinRequestService = {
    create: async (groupId: number, requesterId: number) => {
        const group = await groupRepo.getById(groupId);
        if (!group) return { status: 404 as const };
        if (group.ownerId === requesterId) return { status: 403 as const };

        const existing = await groupJoinRequestRepo.findFirst(groupId, requesterId);
        if (existing) return { status: 409 as const };

        const g = await groupJoinRequestRepo.create(groupId, requesterId);

        return {
            status: 201 as const,
            dto: {
                requestId: g.id,
                groupId: g.groupId,
                userId: g.userId,
                status: g.status,
                createdAt: g.createdAt.toISOString(),
                decidedAt: g.decidedAt ? g.decidedAt.toISOString() : undefined,
            },
        };
    },

    approve: async (ownerId: number, groupId: number, requestId: number) => {
        const group = await groupRepo.getById(groupId);
        if (!group) return { status: 404 as const };
        if (group.ownerId !== ownerId) return { status: 403 as const };

        const jr = await groupJoinRequestRepo.findById(requestId);
        if (!jr || jr.groupId !== groupId) return { status: 404 as const };

        if (jr.status !== "pending") return { status: 409 as const };

        const updated = await groupJoinRequestRepo.updateById(requestId, "approved");

        return {
            status: 200 as const,
            dto: {
                requestId: updated.id,
                groupId: updated.groupId,
                userId: updated.userId,
                status: updated.status,
                createdAt: updated.createdAt.toISOString(),
                decidedAt: updated.decidedAt ? updated.decidedAt.toISOString() : undefined,
            },
        };
    },

    decline: async (ownerId: number, groupId: number, requestId: number) => {
        const group = await groupRepo.getById(groupId);
        if (!group) return { status: 404 as const };
        if (group.ownerId !== ownerId) return { status: 403 as const };

        const jr = await groupJoinRequestRepo.findById(requestId);
        if (!jr || jr.groupId !== groupId) return { status: 404 as const };

        if (jr.status !== "pending") return { status: 409 as const };

        const updated = await groupJoinRequestRepo.updateById(requestId, "rejected");

        return {
            status: 200 as const,
            dto: {
                requestId: updated.id,
                groupId: updated.groupId,
                userId: updated.userId,
                status: updated.status,
                createdAt: updated.createdAt.toISOString(),
                decidedAt: updated.decidedAt ? updated.decidedAt.toISOString() : undefined,
            },
        };
    },

    findForUser: async (groupId: number, requesterId: number) => {
        const group = await groupRepo.getById(groupId);
        if (!group) return { status: 404 as const };

        const jr = await groupJoinRequestRepo.findFirst(groupId, requesterId);
        if (!jr) return { status: 404 as const };

        return {
            status: 200 as const,
            dto: {
                requestId: jr.id,
                groupId: jr.groupId,
                userId: jr.userId,
                status: jr.status,
                createdAt: jr.createdAt.toISOString(),
                decidedAt: jr.decidedAt ? jr.decidedAt.toISOString() : undefined,
            },
        };
    },
};
