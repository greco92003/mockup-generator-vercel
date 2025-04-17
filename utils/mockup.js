import path from "path";
import { createCanvas, loadImage } from "canvas";
import { v4 as uuid } from "uuid";
import fs from "fs/promises";

export async function createCompositeImage(logoPath, outDir) {
  // Dimensões do mock‑up base
  const CANVAS_W = 1920;
  const CANVAS_H = 1080;

  const canvas = createCanvas(CANVAS_W, CANVAS_H);
  const ctx = canvas.getContext("2d");

  // Imagens base
  const bg = await loadImage(
    path.join(process.cwd(), "public", "background.png")
  );
  const logo = await loadImage(logoPath);

  ctx.drawImage(bg, 0, 0, CANVAS_W, CANVAS_H);

  /* ===========================================================================
     1. Cálculo de tamanhos preservando proporção
  ============================================================================*/
  const aspect = logo.width / logo.height;

  // — Logos do chinelo —
  const SLIPPER_H_MAX = 100;
  const SLIPPER_W_MAX = 163;

  let slipperW = SLIPPER_H_MAX * aspect;
  let slipperH = SLIPPER_H_MAX;

  if (slipperW > SLIPPER_W_MAX) {
    slipperW = SLIPPER_W_MAX;
    slipperH = slipperW / aspect;
  }

  // — Logos da etiqueta —
  const LABEL_H_MAX = 60;
  const LABEL_W_MAX = 64;

  let labelW = LABEL_H_MAX * aspect;
  let labelH = LABEL_H_MAX;

  if (labelW > LABEL_W_MAX) {
    labelW = LABEL_W_MAX;
    labelH = labelW / aspect;
  }

  /* ===========================================================================
     2. Posições (centro) — chinelos & etiquetas
  ============================================================================*/
  const slippersCenters = [
    { x: 306, y: 330 },
    { x: 487, y: 330 }, // par 1
    { x: 897, y: 330 },
    { x: 1077, y: 330 }, // par 2
    { x: 1533, y: 330 },
    { x: 1716, y: 330 }, // par 3
    { x: 307, y: 789 },
    { x: 487, y: 789 }, // par 4
    { x: 895, y: 789 },
    { x: 1077, y: 789 }, // par 5
    { x: 1533, y: 789 },
    { x: 1713, y: 789 }, // par 6
  ];

  const labelCenters = [
    { x: 154, y: 367 },
    { x: 738, y: 367 },
    { x: 1377, y: 367 },
    { x: 154, y: 825 },
    { x: 738, y: 825 },
    { x: 1377, y: 825 },
  ];

  /* ===========================================================================
     3. Desenho
  ============================================================================*/
  slippersCenters.forEach(({ x, y }) => {
    ctx.drawImage(logo, x - slipperW / 2, y - slipperH / 2, slipperW, slipperH);
  });

  labelCenters.forEach(({ x, y }) => {
    ctx.drawImage(logo, x - labelW / 2, y - labelH / 2, labelW, labelH);
  });

  /* ===========================================================================
     4. Salvar arquivo
  ============================================================================*/
  await fs.mkdir(outDir, { recursive: true });
  const filename = `resultado_${Date.now()}.png`;
  const outPath = path.join(outDir, filename);

  await fs.writeFile(outPath, canvas.toBuffer("image/png"));
  return outPath;
}
