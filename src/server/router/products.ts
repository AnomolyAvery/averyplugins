import { z } from "zod";
import { createRouter } from "./context";

export const productsRouter = createRouter()
    .query('getProducts', {
        input: z.object({
            limit: z.number().min(1).max(100).nullish(),
            cursor: z.string().nullish(),
        }),
        async resolve({ ctx, input }) {

            const { cursor, limit: rawLimit } = input;

            const limit = rawLimit || 10;


            const products = await ctx.prisma.product.findMany({
                take: limit + 1,
                where: {
                    status: {
                        equals: "Published"
                    }
                },
                cursor: cursor ? {
                    id: cursor
                } : undefined,
                select: {
                    id: true,
                    name: true,
                    overview: true,
                    price: true,
                    icon: true,
                    owner: {
                        select: {
                            name: true,
                            image: true,
                            verified: true,
                        }
                    }
                }
            });

            let nextCursor: typeof cursor | null = null;

            if (products.length > limit) {
                const nextProduct = products.pop();
                nextCursor = nextProduct?.id;
            }



            return {
                products,
                nextCursor,
            }
        }
    })
    .query('getProduct', {
        input: z.object({
            id: z.string().min(1)
        }),
        async resolve({ ctx, input }) {
            const { id } = input;
            const product = await ctx.prisma.product.findUnique({
                where: {
                    id,
                },
                select: {
                    icon: true,
                    name: true,
                    price: true,
                    images: {
                        select: {
                            url: true,
                            id: true,
                        }
                    },
                    owner: {
                        select: {
                            name: true,
                            image: true,
                        }
                    },
                    description: true,
                }
            });

            return product;
        }
    });