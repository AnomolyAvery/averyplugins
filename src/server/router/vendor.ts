import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createProtectedRouter } from "./protected-router";
import * as Showdown from 'showdown';
import { s3Client } from "../lib/s3";
import { env } from "../../env/server.mjs";
import { PutObjectAclCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const converter = new Showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true
});

export const vendorRouter = createProtectedRouter()
    .middleware(({ ctx, next }) => {
        if (!ctx.session || !ctx.session.user) {
            throw new TRPCError({ code: "UNAUTHORIZED" });
        }

        if (ctx.session.user.role !== "vendor") {
            throw new TRPCError({ code: "UNAUTHORIZED" });
        }

        return next({
            ctx: {
                ...ctx,
                // infers that `session` is non-nullable to downstream resolvers
                session: { ...ctx.session, user: ctx.session.user },
            },
        });
    })
    .query('dashboard', {
        async resolve({ ctx }) {

            const productCount = await ctx.prisma.product.count({
                where: {
                    ownerId: ctx.session.user.id,
                }
            });

            return {
                productCount,
            }
        }
    })
    .query('getProducts', {
        input: z.object({
            limit: z.number().min(1).max(100).nullish(),
            cursor: z.string().nullish()
        }),
        async resolve({ ctx, input }) {
            const limit = input.limit || 10;

            const { cursor } = input;

            const products = await ctx.prisma.product.findMany({
                take: limit + 1,
                where: {
                    ownerId: {
                        equals: ctx.session.user.id,
                    }
                },
                cursor: cursor ? {
                    id: cursor
                } : undefined,
                orderBy: {
                    createdAt: "desc"
                }
            });


            let nextCursor: typeof cursor | null = null;

            if (products.length > limit) {
                const nextItem = products.pop();

                nextCursor = nextItem!.id;
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

            const userId = ctx.session.user.id;

            const product = await ctx.prisma.product.findFirst({
                where: {
                    id: id,
                    ownerId: {
                        equals: userId
                    }
                },
            });

            if (!product) {
                throw new TRPCError({
                    code: "NOT_FOUND"
                });
            }

            return product;
        }
    })
    .mutation('createProduct', {
        input: z.object({
            name: z.string().min(3),
            description: z.string().min(1),
            price: z.number().min(0),
            overview: z.string().min(4),
        }),
        async resolve({ ctx, input }) {
            const { name, description, price, overview } = input;

            let newPrice = price * 100;

            const descHtml = converter.makeHtml(overview);


            const product = await ctx.prisma.product.create({
                data: {
                    name,
                    description: descHtml,
                    price: newPrice,
                    overview,
                    owner: {
                        connect: {
                            id: ctx.session.user.id,
                        }
                    },
                    status: "Draft",
                    icon: "http://via.placeholder.com/640x360",
                },
                select: {
                    id: true,
                }
            });

            return product;
        }
    })
    .mutation('updateProduct', {
        input: z.object({
            id: z.string().min(1),
            name: z.string().min(3),
            description: z.string().min(1),
            price: z.number().min(0),
            overview: z.string().min(4),
        }),
        async resolve({ ctx, input }) {
            const { id } = input;
            const userId = ctx.session.user.id;

            const product = await ctx.prisma.product.findFirst({
                where: {
                    id: id,
                }
            });

            if (!product) {
                throw new TRPCError({
                    code: "NOT_FOUND"
                });
            }

            if (product.ownerId !== userId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED"
                });
            }

            const { name, description, price, overview } = input;

            let newPrice = price * 100;

            const descHtml = converter.makeHtml(description);

            const updatedProduct = await ctx.prisma.product.update({
                where: {
                    id: id,
                },
                data: {
                    name,
                    description: descHtml,
                    price: newPrice,
                    overview,
                },
                select: {
                    id: true,

                },
            });

            return updatedProduct;
        }
    });