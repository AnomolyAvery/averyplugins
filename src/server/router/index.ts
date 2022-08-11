// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";
import { productsRouter } from "./products";
import { checkoutRouter } from "./checkout";

export const appRouter = createRouter()
  .transformer(superjson)
  .merge('products.', productsRouter)
  .merge('checkout.', checkoutRouter);

// export type definition of API
export type AppRouter = typeof appRouter;
