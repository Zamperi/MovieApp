import { GroupJoinRequestStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";

export const groupJoinRequestRepo = {
    create: (groupId: number, requesterId: number) =>
        prisma.groupJoinRequest.create({
            data: {
                groupId,
                userId: requesterId,
                status: "pending",
            },
        }),

    updateStatus: (
        groupId: number,
        requesterId: number,
        oldStatus: GroupJoinRequestStatus,
        newStatus: GroupJoinRequestStatus
    ) =>
        prisma.groupJoinRequest.updateManyAndReturn({
            where: {
                groupId,
                userId: requesterId,
                status: oldStatus,
            },
            data: {
                status: newStatus,
            },
        }),

    findFirst: (groupId: number, requesterId: number) =>
        prisma.groupJoinRequest.findFirst({
            where: {
                groupId,
                userId: requesterId,
                status: "pending"
            }
        }),
    findById: (id: number) =>
        prisma.groupJoinRequest.findUnique({ where: { id } }),

    updateById: (id: number, status: GroupJoinRequestStatus) =>
        prisma.groupJoinRequest.update({
            where: { id },
            data: { status, decidedAt: new Date() },
        }),
};