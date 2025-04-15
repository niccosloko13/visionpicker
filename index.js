import express from "express";
import { writeFile } from "fs/promises";
import { exec } from "child_process";

const app = express();
app.use(express.json());

app.post("/visionpicker", async (req, res) => {
  const { cookies } = req.body;

  if (!cookies) return res.status(400).send("❌ Nenhum cookie recebido.");

  try {
    await writeFile("cookies.json", cookies);
    console.log("✅ Cookies recebidos e salvos.");

    exec("node visionpicker_raspagemlinks.js", (err, stdout, stderr) => {
      if (err) {
        console.error(stderr);
        return res.status(500).send("❌ Erro ao executar o VisionPicker.");
      }
      return res.send("✅ Raspagem concluída com sucesso.\n\n" + stdout);
    });
  } catch (err) {
    return res.status(500).send("❌ Falha ao salvar os cookies.");
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log("🔌 API VisionPicker rodando...");
});
