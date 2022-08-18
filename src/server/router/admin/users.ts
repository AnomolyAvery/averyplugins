import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createProtectedRouter } from "../protected-router";

export const adminUsersRouter = createProtectedRouter()
    .query('getAll', {
        input: z.object({
            limit: z.number().min(1).max(100).nullish(),
            cursor: z.string().nullish()
        }),
        async resolve({ ctx, input }) {
            const limit = input.limit || 10;
            const { cursor } = input;

            const users = await ctx.prisma.user.findMany({
                take: limit + 1,
                cursor: cursor ? {
                    id: cursor
                } : undefined,
                orderBy: {
                    joinedAt: 'desc'
                },
                select: {
                    id: true,
                    name: true,
                    image: true,
                    role: true,
                    joinedAt: true,
                },
            });

            let nextCursor: typeof cursor | null = null;

            if (users.length > limit) {
                const nextItem = users.pop();

                nextCursor = nextItem!.id;
            }

            return {
                users,
                nextCursor,
            };
        }
    })
    .query('get', {
        input: z.object({
            id: z.string().min(1)
        }),
        async resolve({ ctx, input }) {
            const user = await ctx.prisma.user.findUnique({
                where: {
                    id: input.id,
                },
                select: {
                    name: true,
                    image: true,
                    products: {
                        select: {
                            id: true,
                            name: true,
                            icon: true,
                            overview: true,
                            status: true,
                            price: true,
                        }
                    }
                }
            });


            const discordId = await ctx.prisma.account.findFirst({
                where: {
                    userId: input.id,
                    provider: "discord"
                },
                take: 1,
                select: {
                    providerAccountId: true
                }
            });

            if (!discordId) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User has no discord account"
                });
            }

            if (!user) {
                throw new TRPCError({
                    code: "NOT_FOUND"
                });
            }

            return {
                user,
                discordId: discordId.providerAccountId,
            }
        }
    })