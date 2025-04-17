import path from "node:path";
import { createCanvas, loadImage } from "@napi-rs/canvas";

const BG_PATH = path.join(process.cwd(), "assets", "background.png");

// posições centrais já definidas
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

export async function createMockup(logoBuf) {
  // carrega o background e o logo
  const [bgImg, logoImg] = await Promise.all([
    loadImage(BG_PATH),
    loadImage(logoBuf),
  ]);

  const W = 1920,
    H = 1080;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d");

  // desenha o fundo
  ctx.drawImage(bgImg, 0, 0, W, H);

  // tamanhos máximos
  /* -------------------------------------------------------------------- */
  /* 1. calcula proporção                                                 */
  const aspect = logoImg.width / logoImg.height; // >1 => landscape

  /* 2. logos dos chinelos ------------------------------------------------ */
  const SLIPPER_H_MAX = 100;
  const SLIPPER_W_MAX = 163;

  let slipperW = SLIPPER_H_MAX * aspect;
  let slipperH = SLIPPER_H_MAX;

  if (slipperW > SLIPPER_W_MAX) {
    slipperW = SLIPPER_W_MAX;
    slipperH = slipperW / aspect; // ajusta altura
  }

  /* 3. logos das etiquetas ---------------------------------------------- */
  const LABEL_H_MAX = 60;
  const LABEL_W_MAX = 64;

  let labelW = LABEL_H_MAX * aspect;
  let labelH = LABEL_H_MAX;

  if (labelW > LABEL_W_MAX) {
    labelW = LABEL_W_MAX;
    labelH = labelW / aspect; // ajusta altura
  }

  // logos centrais dos chinelos
  for (const { x, y } of SLIPPER_CENTERS) {
    ctx.drawImage(
      logoImg,
      x - SLIPPER_W / 2,
      y - SLIPPER_H / 2,
      SLIPPER_W,
      SLIPPER_H
    );
  }

  // logos centrais das etiquetas
  for (const { x, y } of LABEL_CENTERS) {
    ctx.drawImage(
      logoImg,
      x - slipperW / 2,
      y - slipperH / 2,
      slipperW,
      slipperH
    );
  }

  return canvas.encode("png"); // Buffer PNG
}
