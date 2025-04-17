// utils/pdf.js --------------------------------------------------------------
import {
  getDocument,
  GlobalWorkerOptions,
} from "pdfjs-dist/legacy/build/pdf.js";
import { createCanvas } from "@napi-rs/canvas";

// evita busca de worker externo
GlobalWorkerOptions.workerSrc = false;

/** Converte cada página do PDF (buffer) em um Buffer PNG
 *  @return  Array<Buffer>
 */
export async function pdfToPngBuffers(pdfBuffer) {
  const doc = await getDocument({ data: pdfBuffer }).promise;

  const pngBuffers = [];
  for (let p = 1; p <= doc.numPages; ++p) {
    const page = await doc.getPage(p);

    // resolução (~150 dpi) —  em pixels:  8.5in *150 ≈ 1275
    const scale = 150 / 72; // PDF user‑space = 72 dpi
    const viewport = page.getViewport({ scale });

    const canvas = createCanvas(viewport.width, viewport.height);
    const ctx = canvas.getContext("2d");

    await page.render({ canvasContext: ctx, viewport }).promise;
    pngBuffers.push(canvas.encode("png"));
  }

  await doc.destroy();
  return pngBuffers;
}
