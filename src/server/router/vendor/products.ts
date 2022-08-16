import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { TRPCError } from "@trpc/server";
import Showdown from "showdown";
import { z } from "zod";
import { env } from "../../../env/server.mjs";
import { s3Client } from "../../lib/s3";
import { createRouter } from "../context";
import { createProtectedRouter } from "../protected-router";


const converter = new Showdown.Converter({
    tables: true,
    simplifiedAutoLink: true,
    strikethrough: true,
    tasklists: true
});

export const vendorProducsRouter = createProtectedRouter()
    .query('getAll', {
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
    .query('get', {
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
    .mutation('create', {
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
                },
                select: {
                    id: true,
                }
            });

            return product;
        }
    })
    .mutation('update', {
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
    })
    .merge('files.', createProtectedRouter()
        .query('getAll', {
            input: z.object({
                id: z.string().min(1),
            }),
            async resolve({ ctx, input }) {
                const { id } = input;

                const versions = await ctx.prisma.productFile.findMany({
                    where: {
                        productId: id,
                    },
                    select: {
                        id: true,
                        name: true,
                        version: true,
                        downloads: true,
                        createdAt: true,
                        status: true,
                        message: true,
                    }
                });

                return versions;
            }
        })
        .mutation('update', {
            input: z.object({
                id: z.string().min(1),
                name: z.string().min(3),
                version: z.string().min(1),
                message: z.string().min(10),
            }),
            async resolve({ ctx, input }) {
                const { id } = input;

                const userId = ctx.session.user.id;

                const product = await ctx.prisma.product.findFirst({
                    where: {
                        files: {
                            some: {
                                id,
                            }
                        }
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

                const { name, version, message } = input;

                const updatedFile = await ctx.prisma.productFile.update({
                    where: {
                        id: id,
                    },
                    data: {
                        name,
                        version,
                        message,
                    },
                    select: {
                        id: true,
                    }
                });

                return updatedFile;
            }
        })
    )
    .merge('images.', createProtectedRouter()
        .mutation('delete', {
            input: z.object({
                id: z.string().min(1),
            }),
            async resolve({ ctx, input }) {
                const userId = ctx.session.user.id;

                const { id } = input;

                const image = await ctx.prisma.productImage.findFirst({
                    where: {
                        id: id,
                    },
                    select: {
                        product: {
                            select: {
                                ownerId: true,
                            }
                        },
                        url: true,
                    }
                });

                if (!image) {
                    throw new TRPCError({
                        code: "NOT_FOUND"
                    });
                }

                if (image.product.ownerId !== userId) {
                    throw new TRPCError({
                        code: "UNAUTHORIZED"
                    });
                }

                const fileKey = image?.url.replace('https://averyplugins.us-southeast-1.linodeobjects.com/', '').trim();
                console.log(fileKey);
                try {
                    const deleteObjCmd = new DeleteObjectCommand({
                        Bucket: env.S3_PLUGIN_BUCKET,
                        Key: fileKey,
                    });

                    await s3Client.send(deleteObjCmd);

                    const deletedFile = await ctx.prisma.productFile.delete({
                        where: {
                            id,
                        },
                        select: {
                            id: true,
                        }
                    });

                    return deletedFile;
                }
                catch (err) {
                    throw new TRPCError({
                        code: "INTERNAL_SERVER_ERROR"
                    });
                }
            }
        }))