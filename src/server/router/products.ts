import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { env } from "../../env/server.mjs";
import { s3Client } from "../lib/s3";
import { getSignedUrl, S3RequestPresigner } from '@aws-sdk/s3-request-presigner';
import { createRouter } from "./context";
import { createProtectedRouter } from "./protected-router";
import { GetObjectCommand, GetObjectCommandInput } from "@aws-sdk/client-s3";

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
    .merge('user.', createProtectedRouter()
        .mutation('download', {
            input: z.object({
                productId: z.string().min(1),
            }),
            async resolve({ ctx, input }) {
                const { productId } = input;

                const userId = ctx.session.user.id;

                const purchase = await ctx.prisma.purchase.findUnique({
                    where: {
                        userId_productId: {
                            productId: productId,
                            userId: userId,
                        }
                    }
                });

                if (!purchase) {
                    throw new TRPCError({
                        code: "BAD_REQUEST"
                    })
                }

                const file = await ctx.prisma.productFile.findFirst({
                    where: {
                        productId: productId,
                    },
                    orderBy: {
                        createdAt: 'desc'
                    },
                    take: 1,
                });

                if (!file) {
                    throw new TRPCError({
                        code: "BAD_REQUEST"
                    });
                }

                const bucket = env.S3_PLUGIN_BUCKET;

                const key = file.fileUrl;


                const getObjectParams: GetObjectCommandInput = {
                    Bucket: bucket,
                    Key: key,
                };

                const command = new GetObjectCommand(getObjectParams);

                const url = await getSignedUrl(s3Client, command, {
                    expiresIn: 3600,
                })

                return {
                    url,
                }
            }
        }))
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
                    purchases: {
                        where: {
                            userId: {
                                equals: ctx.session?.user?.id,
                            }
                        },
                        select: {
                            status: true,
                        }
                    }
                }
            });

            return product;
        }
    })
    .query('getProductGallery', {
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
                    images: {
                        select: {
                            id: true,
                            url: true,
                        }
                    }
                }
            });

            if (!product) {
                throw new TRPCError({
                    code: "BAD_REQUEST"
                })
            }

            return product.images;
        }
    })