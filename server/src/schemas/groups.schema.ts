import { z } from "zod";

export const GroupListItemDTO = z.object({
    groupId: z.number().int().min(1),
    groupName: z.string(),
}).strict();

export const GroupsResponseDTO = z.array(GroupListItemDTO);