import { publicProcedure, router } from "../trpc.js";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";
// @ts-ignore
import pdfPkg from "pdf-parse-fixed";
import { validateWithAI } from "../ai/validate.js";
import { prisma } from "../db.js";

// normalize default/namespace export
const pdfParse: (data: Buffer | Uint8Array, opts?: any) => Promise<{ text: string }> =
  (pdfPkg as any).default ?? (pdfPkg as any);

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
    .mutation(async ({ input }) => {
      // Resolve uploaded file path
      const dir = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");
      const filePath = path.join(dir, input.fileToken);

      // Load PDF as a Buffer and parse
      let pdfText = "";
      try {
        const buff = await fs.readFile(filePath);
        const parsed = await pdfParse(buff);
        pdfText = (parsed?.text || "").toString();
      } catch (err: any) {
        // Provide clearer errors to the UI
        return {
          ok: false as const,
          errors: {
            file:
              err?.code === "ENOENT"
                ? "Uploaded file not found on server."
                : `Failed to parse PDF: ${err?.message || "Unknown error"}`,
          },
        };
      }

      const fields = {
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        skills: input.skills || "",
        experience: input.experience || "",
      };

      const result = await validateWithAI(fields, pdfText);
      // console.log("--Result--")
      // console.log(result)
      // console.log(fields)
      // console.log(pdfText)
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
