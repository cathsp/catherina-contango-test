import { publicProcedure, router } from "../trpc.js";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
import pdfParse from "pdf-parse";
import { validateWithAIOrLocal } from "../ai/validate.js";
import { prisma } from "../db.js";

const inputSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(6),
  skills: z.string().optional().default(""),
  experience: z.string().optional().default(""),
  fileToken: z.string().min(1),
});

export const cvRouter = router({
  validateAndSave: publicProcedure
    .input(inputSchema)
    .mutation( async ({ input }) => {
      // Load uploaded PDF by token
      const dir = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
      const filePath = path.join(dir, input.fileToken);
      const buff = await fs.readFile(filePath);
      const pdfData = await pdfParse(buff);
      const pdfText = pdfData.text || "";

      const fields = {
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        skills: input.skills || "",
        experience: input.experience || "",
      };

      const result = await validateWithAIOrLocal(fields, pdfText);

      if (!result.ok) {
        return { ok: false as const, errors: result.errors };
      }

      const saved = await prisma.userCV.create({
        data: {
          fullName: input.fullName,
          email: input.email,
          phone: input.phone,
          skills: input.skills || "",
          experience: input.experience || "",
          filePath,
          valid: true,
        },
        select: { id: true },
      });

      return { ok: true as const, id: saved.id };
    }),
});
