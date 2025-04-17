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
  const aspect = logoImg.width / logoImg.height;

  const SLIPPER_H = 100;
  const SLIPPER_W = Math.min(163, SLIPPER_H * aspect);

  const LABEL_H = 60;
  const LABEL_W = Math.min(64, LABEL_H * aspect);

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
    ctx.drawImage(logoImg, x - LABEL_W / 2, y - LABEL_H / 2, LABEL_W, LABEL_H);
  }

  return canvas.encode("png"); // Buffer PNG
}
