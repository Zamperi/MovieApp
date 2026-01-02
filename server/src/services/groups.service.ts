import { groupRepo } from "../repositories/group.repo";

export const groupService = {
    list: async () => {
        const groups = await groupRepo.list();
        return groups.map((g) => ({
            groupId: g.id,
            groupName: g.name,
        }));
    },

    getById: async (groupId: number) => {
        const group = await groupRepo.getById(groupId);
        if (!group) return null;

        return {
            groupId: group.id,
            groupName: group.name,
            isPublic: group.isPublic,
            owner: {
                id: group.owner.id,
                username: group.owner.username,
            },
            members: group.members.map((m) => ({
                id: m.id,
                username: m.username,
            })),
            createdAt: group.createdAt.toISOString(),
        };
    },

    createGroup: async (ownerId: number, groupName: string, isPublic: boolean) => {
        const created = await groupRepo.create({
            name: groupName,
            ownerId,
            isPublic,
        });

        return {
            groupId: created.id,
            groupName: created.name,
            isPublic: created.isPublic,
            owner: {
                id: created.owner.id,
                username: created.owner.username,
            },
            members: created.members.map((m) => ({
                id: m.id,
                username: m.username,
            })),
            createdAt: created.createdAt.toISOString(),
        };
    },

    softDeleteGroup: async (requesterId: number, groupId: number) => {
        const g = await groupRepo.getByIdForDelete(groupId);

        if (!g) {
            return { status: 404 as const };
        }

        if (g.ownerId !== requesterId) {
            return { status: 403 as const };
        }

        const deleted = await groupRepo.softDelete(groupId);

        return {
            status: 200 as const,
            dto: {
                groupId: deleted.id,
                deletedAt: deleted.deletedAt!.toISOString(),
            },
        };
    },


    hardDeleteGroup: async (groupId: number) => {
        const deleted = await groupRepo.hardDelete(groupId);

        return {
            groupId: deleted.id,
            deletedat: deleted.deletedAt!.toISOString(),
        }
    }
};
