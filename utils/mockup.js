import path from "node:path";
import { createCanvas, loadImage } from "canvas";

/* ------------------------------------------------------------------ */
/* Caminho para o background (mock‑up base)                           */
const BG_PATH = path.join(process.cwd(), "assets", "background.png");

/* Posições centrais (X,Y) medidas no Photoshop                      */
const SLIPPER_CENTERS = [
  { x: 306, y: 330 },
  { x: 487, y: 330 },
  { x: 897, y: 330 },
  { x: 1077, y: 330 },
  { x: 1533, y: 330 },
  { x: 1716, y: 330 },
  { x: 307, y: 789 },
  { x: 487, y: 789 },
  { x: 895, y: 789 },
  { x: 1077, y: 789 },
  { x: 1533, y: 789 },
  { x: 1713, y: 789 },
];

const LABEL_CENTERS = [
  { x: 154, y: 367 },
  { x: 738, y: 367 },
  { x: 1377, y: 367 },
  { x: 154, y: 825 },
  { x: 738, y: 825 },
  { x: 1377, y: 825 },
];

/* Ajusta (w,h) para caber em (maxW,maxH) mantendo a proporção       */
function fitBox(w, h, maxW, maxH) {
  const scale = Math.min(maxW / w, maxH / h);
  return { w: w * scale, h: h * scale };
}

/* ------------------------------------------------------------------ */
/* Cria o mock‑up: recebe buffer PNG do logo, devolve buffer PNG      */
export async function createMockup(logoBuf) {
  // Carrega imagens
  const [bg, logo] = await Promise.all([
    loadImage(BG_PATH),
    loadImage(logoBuf),
  ]);

  /* Canvas base 1920×1080 ----------------------------------------- */
  const W = 1920,
    H = 1080;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(bg, 0, 0, W, H);

  /* Tamanhos máximos ---------------------------------------------- */
  const { w: SLIPPER_W, h: SLIPPER_H } = fitBox(
    logo.width,
    logo.height,
    163,
    100 // limites para o chinelo
  );

  const { w: LABEL_W, h: LABEL_H } = fitBox(
    logo.width,
    logo.height,
    64,
    60 // limites para a etiqueta
  );

  /* Desenha logos dos chinelos ------------------------------------ */
  for (const { x, y } of SLIPPER_CENTERS) {
    ctx.drawImage(
      logo,
      x - SLIPPER_W / 2,
      y - SLIPPER_H / 2,
      SLIPPER_W,
      SLIPPER_H
    );
  }

  /* Desenha logos das etiquetas ----------------------------------- */
  for (const { x, y } of LABEL_CENTERS) {
    ctx.drawImage(logo, x - LABEL_W / 2, y - LABEL_H / 2, LABEL_W, LABEL_H);
  }

  /* Retorna buffer PNG -------------------------------------------- */
  return canvas.encode("png");
}
