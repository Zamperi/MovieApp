import { prisma } from "../lib/prisma";

export const groupRepo = {
    list: () =>
        prisma.group.findMany({
            where: { deletedAt: null },
            orderBy: { id: "desc" },
            take: 50,
            select: {
                id: true,
                name: true,
            },
        }),

    getById: (groupId: number) =>
        prisma.group.findUnique({
            where: { id: groupId },
            select: {
                id: true,
                name: true,
                public: true,
                createdAt: true,
                members: {
                    select: { id: true },
                },
            },
        }),
};
