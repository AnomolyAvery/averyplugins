import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createProtectedRouter } from "../protected-router";
import * as Showdown from 'showdown';
import { s3Client } from "../../lib/s3";
import { env } from "../../../env/server.mjs";
import { DeleteObjectCommand, PutObjectAclCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { vendorProducsRouter } from "./products";
import { vendorPurchasesRouter } from "./purchases";
import { vendorSettingsRouter } from "./settings";

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
                    status: "Paid",
                    vendorPaidOn: {
                        equals: null,
                    }
                },
                select: {
                    amount: true,
                }
            });

            const amounts = purchases.map(p => (p.amount / 100));

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
    .merge('products.', vendorProducsRouter)
    .merge('purchases.', vendorPurchasesRouter)
    .merge('settings.', vendorSettingsRouter)