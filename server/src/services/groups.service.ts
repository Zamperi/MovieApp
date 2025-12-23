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
            public: group.public,
            members: group.members.map((m) => m.id),
            createdAt: group.createdAt.toISOString(),
        };
    },
};
