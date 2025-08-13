import "dotenv/config";
import express from "express";
import cors from "cors";
import { appRouter } from "./routers/index.js";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { uploadRouter, uploadMiddleware } from "./upload.js";
import { inferAsyncReturnType } from "@trpc/server";

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

const app = express();
app.use(cors());
app.use(express.json());

// Health
app.get("/health", (_req, res) => res.json({ ok: true }));

// File uploads
app.post("/upload", uploadMiddleware.single("file"), uploadRouter);

// tRPC
export const createContext = ({ req, res }: { req: any; res: any }) => ({ req, res });
type Context = inferAsyncReturnType<typeof createContext>;

app.use(
  "/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

app.listen(PORT, () => {
  console.log(`Backend listening on http://0.0.0.0:${PORT}`);
});
