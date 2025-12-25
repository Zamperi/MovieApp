import { prisma } from "../lib/prisma";

export const groupRepo = {
    list: () =>
        prisma.group.findMany({
            where: { deletedAt: null, isPublic: true },
            orderBy: { id: "desc" },
            take: 50,
            select: {
                id: true,
                name: true,
            },
        }),

    getById: (groupId: number) =>
        prisma.group.findFirst({
            where: { id: groupId, deletedAt: null },
            select: {
                id: true,
                name: true,
                isPublic: true,
                createdAt: true,
                members: { select: { id: true } },
            },
        }),

    create: (args: { name: string; ownerId: number; isPublic: boolean }) =>
        prisma.group.create({
            data: {
                name: args.name,
                ownerId: args.ownerId,
                isPublic: args.isPublic,
                members: { connect: [{ id: args.ownerId }] },
            },
            select: {
                id: true,
                name: true,
                isPublic: true,
                createdAt: true,
                members: { select: { id: true } },
            },
        }),

    getByIdForDelete: (groupId: number) =>
        prisma.group.findFirst({
            where: { id: groupId, deletedAt: null },
            select: { id: true, ownerId: true },
        }),

    softDelete: (groupId: number) =>
        prisma.group.update({
            where: { id: groupId },
            data: { deletedAt: new Date() },
            select: { id: true, deletedAt: true },
        }),

    hardDelete: (groupId: number) =>
        prisma.group.delete({
            where: { id: groupId }
        }),
};
