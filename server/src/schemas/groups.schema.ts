import { z } from "zod";

const ISODateTimeString = z.string().refine(
    (v) => !Number.isNaN(Date.parse(v)),
    { message: "Invalid ISO date-time string" }
);

export const GroupListItemDTO = z
    .object({
        groupId: z.number().int().min(1),
        groupName: z.string().min(1),
    })
    .strict();

export const GroupsResponseDTO = z.array(GroupListItemDTO);

export const CreateGroupRequestDTO = z
    .object({
        groupName: z.string().min(1),
        isPublic: z.boolean(),
    })
    .strict();

export const GroupDTO = z
    .object({
        groupId: z.number().int().min(1),
        groupName: z.string().min(1),
        isPublic: z.boolean(),
        createdAt: ISODateTimeString,
    })
    .strict();

export const GroupWithMembersDTO = z
    .object({
        groupId: z.number().int().min(1),
        groupName: z.string().min(1),
        isPublic: z.boolean(),
        members: z.array(z.number().int().min(1)),
        createdAt: ISODateTimeString,
    })
    .strict();

export const JoinRequestDTO = z
    .object({
        requestId: z.number().int().min(1),
        groupId: z.number().int().min(1),
        userId: z.number().int().min(1),
        status: z.enum(["pending", "approved", "rejected"]),
        createdAt: ISODateTimeString,
        decidedAt: ISODateTimeString.optional(),
    })
    .strict();

export const LeaveGroupResponseDTO = z
    .object({
        groupId: z.number().int().min(1),
        userId: z.number().int().min(1),
        leftAt: ISODateTimeString,
    })
    .strict();

export const DeleteGroupResponseDTO = z
    .object({
        groupId: z.number().int().min(1),
        deletedAt: ISODateTimeString,
    })
    .strict();
