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
            members: group.members.map((m) => m.id),
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
            members: created.members.map((m) => m.id),
            createdAt: created.createdAt.toISOString(),
        };
    },
};
