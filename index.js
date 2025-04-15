import express from "express";
import { exec } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = process.env.PORT || 3000;

// necessário para __dirname funcionar com ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get("/", (req, res) => {
  res.send("✅ VisionPicker API está online!");
});

app.get("/visionpicker", (req, res) => {
  const scriptPath = path.join(__dirname, "visionpicker_raspagemlinks.js");

  exec(`node ${scriptPath}`, (err, stdout, stderr) => {
    if (err) {
      console.error("Erro:", stderr);
      return res.status(500).send("Erro ao executar o script.");
    }
    return res.send("✅ Script executado com sucesso:\n\n" + stdout);
  });
});

app.listen(process.env.PORT || 3000, () => {
    console.log(`Servidor rodando na porta ${process.env.PORT}`);
  });  