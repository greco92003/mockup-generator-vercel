// api/upload.js -------------------------------------------------------------
// Rota Serverless da Vercel para receber um arquivo `logo` (pdf/png/jpg),
// converter PDF → PNG em memória e gerar o(s) mock‑up(s).

import Busboy from "busboy";
import { createMockup } from "../utils/mockup.js";
import { pdfToPngBuffers } from "../utils/pdf.js";

/* ------------------------------------------------------------------------ */
/* Helper: lê multipart/form‑data e devolve { buffer, mime }                */
function receiveFile(req) {
  return new Promise((resolve, reject) => {
    const bb = Busboy({
      headers: req.headers,
      limits: { files: 1, fileSize: 8e6 },
    });

    let fileBuf = Buffer.alloc(0);
    let mime = "";

    bb.on("file", (_, stream, info) => {
      mime = info.mimeType;
      stream.on("data", (d) => (fileBuf = Buffer.concat([fileBuf, d])));
    });

    bb.on("finish", () => resolve({ buffer: fileBuf, mime }));
    bb.on("error", reject);

    req.pipe(bb);
  });
}

/* ------------------------------------------------------------------------ */
/* Handler principal                                                        */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).send("Método não permitido");
    return;
  }

  try {
    // 1. recebe arquivo
    const { buffer: fileBuffer, mime } = await receiveFile(req);

    // 2. se PDF → gera array de PNGs; se imagem → único PNG
    const pageBuffers =
      mime === "application/pdf"
        ? await pdfToPngBuffers(fileBuffer) // [bufPage1, bufPage2, …]
        : [fileBuffer];

    // 3. cria mock‑ups para cada página
    const mockups = await Promise.all(pageBuffers.map(createMockup));

    // 4. devolve o primeiro mock‑up (ou zip, se quiser todos)
    res.setHeader("Content-Type", "image/png");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="mockup_${Date.now()}.png"`
    );
    res.send(mockups[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao processar mockup" });
  }
}
