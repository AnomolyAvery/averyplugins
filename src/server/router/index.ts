// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";
import { productsRouter } from "./products";
import { checkoutRouter } from "./checkout";
import { vendorRouter } from "./vendor";
import { accountRouter } from "./account";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge('products.', productsRouter)
  .merge('checkout.', checkoutRouter)
  .merge('vendor.', vendorRouter)
  .merge('account.', accountRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
