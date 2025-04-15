
const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const urlCategoria = 'https://shopee.com.br/Roupas-Plus-Size-cat.11116689';
  console.log('🔎 Acessando categoria:', urlCategoria);
  await page.goto(urlCategoria, { timeout: 60000 });
  await page.waitForTimeout(8000);

  const links = await page.$$eval('a[href*="item"]', as =>
    Array.from(new Set(as.map(a => a.href).filter(href => href.includes('item'))))
  );

  if (links.length === 0) {
    console.log('❌ Nenhum link de produto encontrado.');
    await browser.close();
    return;
  }

  const primeiroProduto = links[0];
  console.log('➡️ Acessando produto:', primeiroProduto);

  const prodPage = await context.newPage();
  await prodPage.goto(primeiroProduto, { timeout: 60000 });
  await prodPage.waitForTimeout(5000);

  const resultado = await prodPage.evaluate(() => {
    const getMaiorTexto = () => {
      return Array.from(document.querySelectorAll('div, p'))
        .map(el => el.innerText.trim())
        .filter(text => text.length > 50)
        .sort((a, b) => b.length - a.length)[0] || '';
    };

    const getPreco = () => {
      return Array.from(document.querySelectorAll('*'))
        .map(el => el.innerText.trim())
        .filter(text => text.includes('R$') && !text.includes('de') && text.length < 20)[0] || '';
    };

    const getVariacoes = () => {
      return Array.from(document.querySelectorAll('button, li'))
        .filter(el => el.innerText.trim().length > 1)
        .map(el => el.innerText.trim())
        .filter((v, i, a) => a.indexOf(v) === i);
    };

    const getImagens = () => {
      return Array.from(document.querySelectorAll('img'))
        .map(img => img.src)
        .filter(src => src.startsWith('https') && !src.includes('sprite') && !src.includes('data:image'))
        .filter((v, i, a) => a.indexOf(v) === i);
    };

    const titulo = document.querySelector('h1')?.innerText.trim() || '';
    const preco = getPreco();
    const descricao = getMaiorTexto();
    const variacoes = getVariacoes();
    const imagens = getImagens();

    return {
      titulo,
      preco,
      descricao,
      variacoes,
      imagens
    };
  });

  await browser.close();
  fs.writeFileSync('produto_visionpicker.json', JSON.stringify(resultado, null, 2));
  console.log('✅ Produto analisado e salvo em produto_visionpicker.json');
})();
