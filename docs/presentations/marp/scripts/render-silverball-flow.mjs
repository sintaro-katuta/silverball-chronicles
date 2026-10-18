import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer';

const name = 'silverball-game-flow';
const cli = spawnSync(process.execPath, ['node_modules/@mermaid-js/mermaid-cli/src/cli.js', '-i', `diagrams/${name}.mmd`, '-o', `assets/${name}.svg`, '-c', 'diagrams/mermaid.json', '-p', 'diagrams/puppeteer.json', '-b', 'transparent', '--size', '2400'], { stdio: 'inherit' });
if (cli.status !== 0) process.exit(cli.status || 1);
const browser = await puppeteer.launch(JSON.parse(readFileSync('diagrams/puppeteer.json', 'utf8')));
try {
  const page = await browser.newPage();
  await page.goto(`file://${resolve(`assets/${name}.svg`)}`);
  const svg = await page.evaluate(() => {
    const source = document.querySelector('svg');
    const ns = 'http://www.w3.org/2000/svg';
    const make = (tag, attrs = {}) => {
      const el = document.createElementNS(ns, tag);
      for (const [key, value] of Object.entries(attrs)) el.setAttribute(key, value);
      return el;
    };
    const svg = make('svg', { xmlns: ns, id: source.id, viewBox: '0 0 1320 570', width: '2640', height: '1140' });
    source.querySelectorAll('style').forEach(s => svg.append(s.cloneNode(true)));
    const defs = make('defs');
    defs.innerHTML = '<marker id="flow-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#2455b8"/></marker>';
    svg.append(defs);
    const edges = make('g'); svg.append(edges);
    const nodes = {};
    const positions = { A:[180,155], B:[500,155], C:[820,155], D:[1140,155], E:[1140,425], F:[820,425], G:[500,425], H:[180,425] };
    for (const node of source.querySelectorAll('g.node')) {
      const key = node.id.match(/flowchart-([A-H])-/)?.[1];
      if (!key) continue;
      const box = node.getBBox(); const [x,y] = positions[key];
      const copy = node.cloneNode(true);
      copy.setAttribute('transform', `translate(${x-box.x-box.width/2},${y-box.y-box.height/2})`);
      svg.append(copy);
      nodes[key] = { x,y,left:x-box.width/2,right:x+box.width/2,top:y-box.height/2,bottom:y+box.height/2 };
    }
    if (Object.keys(nodes).length !== 8) throw new Error('Expected eight Mermaid nodes');
    const line = points => {
      points.slice(1).forEach(([x,y],i) => { if(x!==points[i][0] && y!==points[i][1]) throw new Error('Diagonal edge'); });
      edges.append(make('path', { d:points.map(([x,y],i)=>`${i?'L':'M'}${x} ${y}`).join(' '), fill:'none', stroke:'#2455b8', 'stroke-width':'2.5', 'marker-end':'url(#flow-arrow)' }));
    };
    const label = (text,x,y) => {
      const el = make('text', {x,y,'text-anchor':'middle',fill:'#202731','font-size':'22','font-family':'Hiragino Sans, sans-serif'});el.textContent=text;svg.append(el);
    };
    const {A,B,C,D,E,F,G,H} = nodes;
    for (const [from,to] of [[A,B],[B,C],[C,D]]) line([[from.right,from.y],[to.left,to.y]]);
    line([[D.x,D.top],[D.x,45],[A.x,45],[A.x,A.top]]);
    label('目標が上がり、出玉・発射速度も成長',660,30);
    label('1〜9ステージ',660,85);
    line([[A.x,A.bottom],[A.x,290],[E.x,290],[E.x,E.top]]);
    label('敗北・最終ステージ突破・途中精算',660,275);
    for (const [from,to] of [[E,F],[F,G],[G,H]]) line([[from.left,from.y],[to.right,to.y]]);
    line([[H.left,H.y],[25,H.y],[25,A.y],[A.left,A.y]]);
    source.replaceWith(svg);
    return new XMLSerializer().serializeToString(svg);
  });
  writeFileSync(`assets/${name}.svg`, svg);
  await page.setViewport({ width:2640, height:1140, deviceScaleFactor:1 });
  await page.setContent(`<html><body style="margin:0">${svg}</body></html>`);
  await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:`assets/${name}.png`,omitBackground:true});
} finally { await browser.close(); }
