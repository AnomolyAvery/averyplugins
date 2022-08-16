import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createProtectedRouter } from "./protected-router";
import * as Showdown from 'showdown';
import { s3Client } from "../lib/s3";
import { env } from "../../env/server.mjs";
import { DeleteObjectCommand, PutObjectAclCommand, PutObjectCommand } from "@aws-sdk/client-s3";
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

            const customerCount = await ctx.prisma.user.count({
                where: {
                    role: {
                        equals: "member"
                    }
                }
            });


            const purchases = await ctx.prisma.purchase.findMany({
                where: {
                    userId: ctx.session.user.id,
                    vendorPaidOn: {
                        equals: null,
                    }
                },
                select: {
                    product: {
                        select: {
                            price: true,
                        }
                    },
                }
            });

            const amounts = purchases.map(p => (p.product.price / 100));

            const total = amounts.reduce((a, b) => a + b, 0);

            const fees = amounts.reduce((a, b) => a + (b * 0.029), 0);
            const net = (total - fees).toFixed(2);


            return {
                productCount,
                customerCount,
                balance: net,
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
    })
    .query('getProductVersions', {
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
    .mutation('updateProductVersion', {
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
    .mutation('deleteProductImage', {
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
    })
    .query('getPurchases', {
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
    })
    .query('getSettings', {
        async resolve({ ctx }) {
            const userId = ctx.session.user.id;

            const settings = await ctx.prisma.vendor.findFirst({
                where: {
                    userId,
                },
                select: {
                    paypalEmail: true,
                    discordWebhook: true,
                    user: {
                        select: {
                            joinedAt: true,
                        }
                    }
                }
            });

            if (!settings) {
                throw new TRPCError({
                    code: "NOT_FOUND"
                });
            }

            return settings;
        }
    })
    .mutation('updateSettings', {
        input: z.object({
            paypalEmail: z.string().min(1),
            discordWebhook: z.string().min(1).nullish(),
        }),
        async resolve({ ctx, input }) {
            const userId = ctx.session.user.id;

            const { paypalEmail, discordWebhook } = input;

            const settings = await ctx.prisma.vendor.findFirst({
                where: {
                    userId,
                },
                select: {
                    id: true,
                }
            });

            if (!settings) {
                throw new TRPCError({
                    code: "NOT_FOUND"
                });
            }

            const updatedSettings = await ctx.prisma.vendor.update({
                where: {
                    id: settings.id,
                },
                data: {
                    paypalEmail,
                    discordWebhook: discordWebhook ?? undefined
                },
                select: {
                    id: true,
                }
            });

            return updatedSettings;
        }
    })