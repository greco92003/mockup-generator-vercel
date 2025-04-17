import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";
import Busboy from "busboy";

import { createMockup } from "../utils/mockup.js";
import { pdfPageToPNG } from "../utils/pdf2png.js";

const unlink = promisify(fs.unlink);

/**
 * Vercel serverless function – recebe um arquivo ‘logo’ (pdf|png|jpg),
 * gera a composição e devolve o PNG final.
 */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).send("Método não permitido");
    return;
  }

  try {
    const { buffer, filename, mime } = await receiveFile(req);

    // --- converte para PNG se for PDF ---------------------------------------
    let logoPngBuffer = buffer;
    if (mime === "application/pdf") {
      // Converte apenas a primeira página; ajuste se quiser todas
      logoPngBuffer = await pdfPageToPNG(buffer, 0);
    }

    // ------------------------------------------------------------------------
    const finalPng = await createMockup(logoPngBuffer);

    res.setHeader("Content-Type", "image/png");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="resultado_${Date.now()}.png"`
    );
    res.send(finalPng);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erro ao processar mockup");
  }
}

/* -------------------------------------------------------------------------- */

function receiveFile(req) {
  return new Promise((resolve, reject) => {
    const bb = Busboy({
      headers: req.headers,
      limits: { files: 1, fileSize: 5e6 },
    });

    let fileBuffer = Buffer.alloc(0);
    let fileName = "";
    let mimeType = "";

    bb.on("file", (_, stream, info) => {
      fileName = info.filename;
      mimeType = info.mimeType;

      stream.on("data", (d) => (fileBuffer = Buffer.concat([fileBuffer, d])));
    });

    bb.on("finish", () => {
      if (!fileBuffer.length)
        return reject(new Error("Nenhum arquivo enviado"));
      resolve({ buffer: fileBuffer, filename: fileName, mime: mimeType });
    });

    bb.on("error", reject);
    req.pipe(bb);
  });
}
