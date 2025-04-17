// utils/mockup.js   (ESM)
// -----------------------------------------------------------
import path from "node:path";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const BG_PATH = path.join(process.cwd(), "assets", "background.png");

// coordenadas centrais já medidas no Photoshop
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

/**  Ajusta um tamanho original (w,h) para caber em (maxW,maxH) mantendo a proporção */
function fitBox(w, h, maxW, maxH) {
  const scale = Math.min(maxW / w, maxH / h);
  return { w: w * scale, h: h * scale };
}

export async function createMockup(logoBuffer) {
  // carrega imagens
  const [bgImg, logoImg] = await Promise.all([
    loadImage(BG_PATH),
    loadImage(logoBuffer),
  ]);

  // canvas base 1920 × 1080
  const W = 1920,
    H = 1080;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(bgImg, 0, 0, W, H);

  /* ------------------------------------------------------------------ */
  /* 1. calcula tamanhos finais                                          */
  /*    - chinelos: máx 163 × 100                                        */
  /*    - etiquetas: máx 64 × 60                                         */
  const { w: SLIPPER_W, h: SLIPPER_H } = fitBox(
    logoImg.width,
    logoImg.height,
    163,
    100
  );

  const { w: LABEL_W, h: LABEL_H } = fitBox(
    logoImg.width,
    logoImg.height,
    64,
    60
  );

  /* ------------------------------------------------------------------ */
  /* 2. desenha logos dos chinelos e etiquetas                           */
  for (const { x, y } of SLIPPER_CENTERS) {
    ctx.drawImage(
      logoImg,
      x - SLIPPER_W / 2,
      y - SLIPPER_H / 2,
      SLIPPER_W,
      SLIPPER_H
    );
  }

  for (const { x, y } of LABEL_CENTERS) {
    ctx.drawImage(logoImg, x - LABEL_W / 2, y - LABEL_H / 2, LABEL_W, LABEL_H);
  }

  return canvas.encode("png"); // retorna Buffer PNG
}
