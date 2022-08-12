// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";
import { productsRouter } from "./products";
import { checkoutRouter } from "./checkout";
import { vendorRouter } from "./vendor";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge('products.', productsRouter)
  .merge('checkout.', checkoutRouter)
  .merge('vendor.', vendorRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
