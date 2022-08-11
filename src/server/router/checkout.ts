import { TRPCError } from "@trpc/server";
import { z } from "zod";
import client from "../lib/paypal";
import paypal from '@paypal/checkout-server-sdk';
import { createProtectedRouter } from "./protected-router";

export const checkoutRouter = createProtectedRouter()
    .query('getCheckout', {
        input: z.object({
            id: z.string().min(1)
        }),
        async resolve({ ctx, input }) {
            const { id } = input;

            const { session, prisma } = ctx;

            if (!session.user) {
                throw new TRPCError({
                    code: "UNAUTHORIZED"
                })
            };

            const userId = session.user.id;

            const product = await prisma.product.findUnique({
                where: {
                    id,
                },
                select: {
                    id: true,
                    price: true,
                    icon: true,
                    name: true,
                }
            });

            if (!product) {
                throw new TRPCError({
                    code: "NOT_FOUND"
                })
            }

            const purchase = await ctx.prisma.purchase.findUnique({
                where: {
                    userId_productId: {
                        userId,
                        productId: product.id,
                    }
                }
            });

            if (purchase) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "You already have this product"
                });
            }


            return {
                product,
                total: product.price,
            };
        }
    })
    .merge('paypal.',
        createProtectedRouter()
            .mutation('createOrder', {
                input: z.object({
                    productId: z.string().min(1)
                }),
                async resolve({ ctx, input }) {
                    const { productId } = input;

                    const product = await ctx.prisma.product.findUnique({
                        where: {
                            id: productId
                        }
                    });

                    if (!product) {
                        throw new TRPCError({
                            code: "NOT_FOUND"
                        })
                    }

                    const paypalClient = client();

                    const request = new paypal.orders.OrdersCreateRequest();
                    request.headers['Prefer'] = "return=representation";
                    request.requestBody({
                        intent: "CAPTURE",
                        purchase_units: [
                            {
                                amount: {
                                    currency_code: "USD",
                                    value: (product.price / 100).toFixed(2),
                                }
                            }
                        ]
                    });

                    const response = await paypalClient.execute(request);

                    if (response.statusCode !== 201) {
                        throw new TRPCError({
                            code: "BAD_REQUEST",
                            message: "Failed to create order"
                        })
                    }

                    await ctx.prisma.purchase.create({
                        data: {
                            status: "Pending",
                            productId,
                            userId: ctx.session.user.id,
                            paypalOrderId: response.result.id,
                        }
                    });

                    return {
                        orderID: response.result.id as string,
                    }
                }
            })
            .mutation('captureOrder', {
                input: z.object({
                    orderID: z.string().min(1)
                }),
                async resolve({ ctx, input }) {

                    const { orderID } = input;

                    const paypalClient = client();

                    const request = new paypal.orders.OrdersCaptureRequest(orderID);

                    // @ts-ignore
                    request.requestBody({});

                    const response = await paypalClient.execute(request);

                    if (!response) {
                        throw new TRPCError({
                            code: "BAD_REQUEST",
                            message: "Failed to capture order"
                        })
                    }

                    await ctx.prisma.purchase.updateMany({
                        where: {
                            paypalOrderId: orderID
                        },
                        data: {
                            status: "Paid"
                        }
                    });

                    return {
                        ...response.result
                    };
                }
            })
    );
