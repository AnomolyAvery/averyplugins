import { z } from "zod";
import { createProtectedRouter } from "../protected-router";

export const vendorPurchasesRouter = createProtectedRouter().query('getAll', {
    input: z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish()
    }),
    async resolve({ ctx, input }) {
        const limit = input.limit || 10;
        const { cursor } = input;

        const purchases = await ctx.prisma.purchase.findMany({
            take: limit + 1,
            where: {
                product: {
                    ownerId: {
                        equals: ctx.session.user.id,
                    }
                },
            },
            cursor: cursor ? {
                id: cursor
            } : undefined,
            orderBy: {
                createdAt: "desc"
            },
            select: {
                id: true,
                product: {
                    select: {
                        id: true,
                        name: true,
                        icon: true,
                        price: true,
                    }
                },
                user: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                    }
                },
                status: true,
                paypalOrderId: true,
            }
        });

        let nextCursor: typeof cursor | null = null;

        if (purchases.length > limit) {
            const nextItem = purchases.pop();

            nextCursor = nextItem!.id;
        }

        return {
            purchases,
            nextCursor,
        }
    }
});