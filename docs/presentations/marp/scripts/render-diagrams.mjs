import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, cpSync } from 'node:fs';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer';

// Mermaid supplies every box and its text. The final pass aligns box centres
// and explicitly routes connections, avoiding tiny steps at arrowheads.
const requested = process.argv.slice(2);
const names = requested.length ? requested : ['roguelike', 'pachinko'];
for (const name of names) {
  if (!['roguelike', 'pachinko'].includes(name)) throw new Error('Unknown diagram');
  const result = spawnSync(process.execPath, [
    'node_modules/@mermaid-js/mermaid-cli/src/cli.js', '-i', `diagrams/${name}.mmd`,
    '-o', `assets/${name}.svg`, '-c', 'diagrams/mermaid.json',
    '-p', 'diagrams/puppeteer.json', '-b', 'transparent', '--size', '2400',
  ], { stdio: 'inherit' });
  if (result.status !== 0) process.exit(1);
}
const browser = await puppeteer.launch(JSON.parse(readFileSync('diagrams/puppeteer.json', 'utf8')));
try {
  for (const name of names) {
    const page = await browser.newPage();
    await page.goto(`file://${resolve(`assets/${name}.svg`)}`);
    const result = await page.evaluate((name) => {
      const original = document.querySelector('svg');
      const ns = 'http://www.w3.org/2000/svg';
      const nodes = {};
      for (const node of original.querySelectorAll('g.node')) {
        const key = node.id.match(/flowchart-([A-E])-/)?.[1];
        if (!key) continue;
        const box = node.getBBox();
        nodes[key] = { element: node.cloneNode(true), width: box.width, height: box.height, box };
      }
      if (Object.keys(nodes).length !== 5) throw new Error('Expected five Mermaid nodes');
      const svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('xmlns', ns);
      svg.id = original.id;
      for (const style of original.querySelectorAll('style')) svg.append(style.cloneNode(true));
      const defs = document.createElementNS(ns, 'defs');
      defs.innerHTML = '<marker id="aligned-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10Z" fill="#2455b8"/></marker>';
      svg.append(defs);
      const drawing = document.createElementNS(ns, 'g');
      const edges = document.createElementNS(ns, 'g');
      const labels = document.createElementNS(ns, 'g');
      drawing.append(edges);
      const y = 180;
      let left = 36;
      const gaps = name === 'pachinko' ? [80, 140, 80, 110] : [80, 80, 80, 80];
      for (const [index, key] of ['A', 'B', 'C', 'D', 'E'].entries()) {
        const node = nodes[key];
        node.x = left + node.width / 2;
        node.y = y;
        node.left = left;
        node.right = left + node.width;
        node.top = y - node.height / 2;
        node.bottom = y + node.height / 2;
        node.element.setAttribute('transform', `translate(${node.x - node.box.x - node.width / 2},${y - node.box.y - node.height / 2})`);
        drawing.append(node.element);
        left = node.right + (gaps[index] || 0);
      }
      const label = (text, x, y) => {
        const group = document.createElementNS(ns, 'g');
        const textElement = document.createElementNS(ns, 'text');
        textElement.setAttribute('x', String(x)); textElement.setAttribute('y', String(y));
        textElement.setAttribute('text-anchor', 'middle');
        textElement.setAttribute('style', 'font:24px "Hiragino Sans",sans-serif;fill:#202731');
        textElement.textContent = text;
        group.append(textElement); labels.append(group);
        return { group, textElement };
      };
      const line = (points, text, lx, ly) => {
        for (let i = 1; i < points.length; i++) {
          if (points[i][0] !== points[i - 1][0] && points[i][1] !== points[i - 1][1]) throw new Error('Diagonal edge');
        }
        const path = document.createElementNS(ns, 'path');
        path.setAttribute('d', points.map(([x, y], i) => `${i ? 'L' : 'M'}${x},${y}`).join(' '));
        path.setAttribute('style', 'fill:none;stroke:#2455b8;stroke-width:2;stroke-linejoin:miter');
        path.setAttribute('marker-end', 'url(#aligned-arrow)');
        edges.append(path);
        if (text) label(text, lx, ly);
      };
      const { A, B, C, D, E } = nodes;
      for (const [from, to, text] of [[A, B, ''], [B, C, name === 'pachinko' ? '当たり' : ''], [C, D, ''], [D, E, name === 'pachinko' ? 'はい' : '']]) {
        line([[from.right, y], [to.left, y]], text, (from.right + to.left) / 2, y - 12);
      }
      const bottom = Math.max(...Object.values(nodes).map(node => node.bottom));
      if (name === 'roguelike') {
        line([[C.x, C.bottom], [C.x, bottom + 70], [A.x + 24, bottom + 70], [A.x + 24, A.bottom]], '強くなって戦う', (C.x + A.x) / 2, bottom + 58);
        line([[E.x, E.bottom], [E.x, bottom + 155], [A.x - 24, bottom + 155], [A.x - 24, A.bottom]], '次の挑戦へ', (E.x + A.x) / 2, bottom + 143);
      } else {
        const top = Math.min(...Object.values(nodes).map(node => node.top));
        line([[B.x, B.top], [B.x, top - 65], [A.x, top - 65], [A.x, A.top]], 'ハズレ', (B.x + A.x) / 2, top - 77);
        line([[D.x, D.bottom], [D.x, bottom + 70], [A.x + 24, bottom + 70], [A.x + 24, A.bottom]], 'いいえ', (D.x + A.x) / 2, bottom + 58);
        line([[E.x, E.bottom], [E.x, bottom + 155], [A.x - 24, bottom + 155], [A.x - 24, A.bottom]], 'RUSH終了', (E.x + A.x) / 2, bottom + 143);
        line([[E.right, y], [E.right + 65, y], [E.right + 65, top - 65], [E.x, top - 65], [E.x, E.top]], '当たれば出玉を獲得', E.x, top - 77);
      }
      drawing.append(labels); svg.append(drawing);
      original.replaceWith(svg);
      for (const group of labels.children) {
        const text = group.querySelector('text');
        const box = text.getBBox();
        const rect = document.createElementNS(ns, 'rect');
        for (const [attr, value] of Object.entries({ x: box.x - 8, y: box.y - 5, width: box.width + 16, height: box.height + 10, fill: '#fafaf8' })) rect.setAttribute(attr, String(value));
        group.prepend(rect);
      }
      const bounds = drawing.getBBox();
      svg.setAttribute('viewBox', `${bounds.x - 20} ${bounds.y - 20} ${bounds.width + 40} ${bounds.height + 40}`);
      const width = 2400;
      const height = Math.ceil(width * (bounds.height + 40) / (bounds.width + 40));
      svg.setAttribute('width', String(width)); svg.setAttribute('height', String(height));
      return { svg: new XMLSerializer().serializeToString(svg), width, height, edges: edges.children.length };
    }, name);
    writeFileSync(`assets/${name}.svg`, result.svg);
    await page.setViewport({ width: result.width, height: result.height, deviceScaleFactor: 1 });
    await page.setContent(`<html><body style="margin:0">${result.svg}</body></html>`);
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: `assets/${name}.png`, omitBackground: true });
    console.log(`${name}: ${result.edges} connections; all segments horizontal or vertical; main box centres aligned.`);
    await page.close();
  }
} finally {
  await browser.close();
}
mkdirSync('dist', { recursive: true });
cpSync('assets', 'dist/assets', { recursive: true });
