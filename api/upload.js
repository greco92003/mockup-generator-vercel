// api/upload.js -------------------------------------------------------------
import fs from "node:fs/promises";
import path from "node:path";
import multer from "multer";
import { createMockup } from "../utils/mockup.js";
import { pdfToPngBuffers } from "../utils/pdf.js";

const upload = multer({ dest: "/tmp" }); // disco tmp da Vercel

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  await new Promise((ok, err) =>
    upload.single("logo")(req, res, (e) => (e ? err(e) : ok()))
  );

  try {
    const filePath = req.file.path;
    const mime = req.file.mimetype;

    const buffers =
      mime === "application/pdf"
        ? await pdfToPngBuffers(await fs.readFile(filePath))
        : [await fs.readFile(filePath)]; // png/jpg já prontos

    const results = await Promise.all(buffers.map(createMockup));

    // devolve o(s) mockup(s) como ZIP ou apenas o primeiro, escolha:
    res.setHeader("Content-Type", "image/png");
    res.send(results[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erro ao processar mockup" });
  } finally {
    fs.unlink(req.file.path).catch(() => {}); // limpa /tmp
  }
}
