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

            if (!product) {
                throw new TRPCError({
                    code: "NOT_FOUND"
                });
            }

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
    .query('getProductVersions', {
        input: z.object({
            id: z.string().min(1)
        }),
        async resolve({ ctx, input }) {
            const { id } = input;

            const files = await ctx.prisma.productFile.findMany({
                where: {
                    productId: {
                        equals: id,
                    },
                },
                select: {
                    id: true,
                    name: true,
                    version: true,
                    createdAt: true,
                }
            });

            return files;
        }
    })
    .mutation('getDownloadUrl', {
        input: z.object({
            id: z.string().min(1)
        }),
        async resolve({ ctx, input }) {
            const { id } = input;

            if (!ctx.session?.user) {
                throw new TRPCError({
                    code: "UNAUTHORIZED"
                });
            }

            const userId = ctx.session.user.id;

            const purchase = await ctx.prisma.purchase.findUnique({
                where: {
                    userId_productId: {
                        productId: id,
                        userId,
                    }
                },
                select: {
                    status: true,
                }
            });

            if (!purchase) {
                throw new TRPCError({
                    code: "BAD_REQUEST"
                });
            }

            if (purchase.status !== "Paid") {
                throw new TRPCError({
                    code: "BAD_REQUEST"
                });
            }

            const file = await ctx.prisma.productFile.findFirst({
                where: {
                    productId: id,
                },
                orderBy: {
                    createdAt: "desc"
                },
                take: 1,
                select: {
                    fileKey: true,
                    id: true,
                    downloads: true,
                }
            });

            if (!file) {
                throw new TRPCError({
                    code: "BAD_REQUEST"
                });
            }

            const { fileKey } = file;

            const getObjectCmd = new GetObjectCommand({
                Bucket: env.S3_PLUGIN_BUCKET,
                Key: fileKey,
            });

            const url = await getSignedUrl(s3Client, getObjectCmd, {
                expiresIn: 15 * 60,
            });

            await ctx.prisma.productFile.update({
                where: {
                    id: file.id,
                },
                data: {
                    downloads: {
                        set: file.downloads + 1,
                    }
                }
            });

            return {
                url,
            }
        }
    })