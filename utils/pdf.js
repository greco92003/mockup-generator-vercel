// utils/pdf.js --------------------------------------------------------------
// Converte cada página do PDF em Buffer PNG sem GhostScript / ImageMagick.
// Funciona em Vercel Functions porque usa apenas JS + @napi-rs/canvas.

import * as pdfjs from "pdfjs-dist/legacy/build/pdf.js"; // importa CJS como namespace
import { createCanvas } from "@napi-rs/canvas";

// evita a busca automática de worker externo (não é necessária em Node)
pdfjs.GlobalWorkerOptions.workerSrc = undefined;

/**
 * @param {Buffer} pdfBuffer  Arquivo PDF
 * @param {number} dpi        Resolução de saída (padrão 150)
 * @return {Promise<Buffer[]>} Array de buffers PNG (uma por página)
 */
export async function pdfToPngBuffers(pdfBuffer, dpi = 150) {
  const doc = await pdfjs.getDocument({ data: pdfBuffer }).promise;

  const pages = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);

    const viewport = page.getViewport({ scale: dpi / 72 });
    const canvas = createCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext("2d");

    await page.render({ canvasContext: ctx, viewport }).promise;
    pages.push(canvas.encode("png"));
  }

  await doc.destroy();
  return pages;
}
