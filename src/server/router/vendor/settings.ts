import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createProtectedRouter } from "../protected-router";

export const vendorSettingsRouter = createProtectedRouter()
    .query('get', {
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
    .mutation('create', {
        input: z.object({
            paypalEmail: z.string().min(1),
            discordWebhook: z.string().min(1).nullish(),
        }),
        async resolve({ ctx, input }) {
            const userId = ctx.session.user.id;

            const { paypalEmail, discordWebhook } = input;

            const settings = await ctx.prisma.vendor.create({
                data: {
                    user: {
                        connect: {
                            id: userId,
                        }
                    },
                    paypalEmail: paypalEmail,
                    discordWebhook: discordWebhook ? discordWebhook : undefined,
                },
                select: {
                    id: true,
                }
            });

            return settings;
        }
    })
    .mutation('update', {
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