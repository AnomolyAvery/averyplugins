import { createProtectedRouter } from "./protected-router";

export const accountRouter = createProtectedRouter()
    .query('getPurchases', {
        async resolve({ ctx }) {
            const userId = ctx.session.user.id;

            const purchases = await ctx.prisma.purchase.findMany({
                where: {
                    userId,
                    status: "Paid"
                },
                select: {
                    id: true,
                    product: {
                        select: {
                            id: true,
                            name: true,
                            icon: true,
                            owner: {
                                select: {
                                    name: true,
                                }
                            }
                        }
                    },
                    status: true,
                    createdAt: true,
                }
            });

            return purchases;
        }
    });