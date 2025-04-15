import { chromium } from 'playwright';
import fs from 'fs/promises';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  try {
    const cookiesRaw = await fs.readFile('cookies.json', 'utf-8');
    const cookies = JSON.parse(cookiesRaw);
    await context.addCookies(cookies);
    console.log("✅ Cookies injetados com sucesso.");
  } catch (err) {
    console.error("❌ Erro ao ler cookies.json:", err.message);
    process.exit(1);
  }

  const page = await context.newPage();
  const urlCategoria = 'https://shopee.com.br/Roupas-Plus-Size-cat.11116689';
  console.log('🔎 Acessando categoria:', urlCategoria);

  await page.goto(urlCategoria, { timeout: 60000 });
  await page.waitForTimeout(8000);

  const links = await page.$$eval('a[href*="item"]', as =>
    Array.from(new Set(as.map(a => a.href).filter(href => href.includes('item'))))
  );

  await browser.close();

  if (links.length === 0) {
    console.log('❌ Nenhum link de produto encontrado.');
  } else {
    await fs.writeFile('links_visionpicker.json', JSON.stringify(links, null, 2));
    console.log(`✅ ${links.length} links salvos em links_visionpicker.json`);
  }
})();
