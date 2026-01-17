
import express from "express";
import qr from "qr-image";
import fs from "fs";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors());
app.use(express.json());

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));


app.post("/generate", (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  const qr_png = qr.image(url, { type: "png" });
  const fileName = `qr_${Date.now()}.png`;
  const filePath = `./${fileName}`;

  const stream = fs.createWriteStream(filePath);
  qr_png.pipe(stream);

  stream.on("finish", () => {
    res.download(filePath, () => {
      fs.unlinkSync(filePath); // delete after download
    });
  });
});

app.listen(PORT, () => {
  console.log(`✅ QR Server running at http://localhost:${PORT}`);
});
