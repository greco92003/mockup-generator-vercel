import { createCanvas } from "@napi-rs/canvas";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.js";

export async function pdfPageToPNG(pdfBuffer, pageIndex = 0, dpi = 144) {
  // carrega documento
  const doc = await pdfjs.getDocument({ data: pdfBuffer }).promise;
  const page = await doc.getPage(pageIndex + 1);

  // dimensões em pixels
  const viewport = page.getViewport({ scale: dpi / 72 });
  const canvas = createCanvas(viewport.width, viewport.height);
  const ctx = canvas.getContext("2d");

  await page.render({ canvasContext: ctx, viewport }).promise;
  const pngBuf = canvas.encode("png");

  await doc.destroy();
  return pngBuf;
}
