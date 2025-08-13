import { router } from "../trpc.js";
import { cvRouter } from "./cv.js";

export const appRouter = router({
  cv: cvRouter,
});

export type AppRouter = typeof appRouter;
