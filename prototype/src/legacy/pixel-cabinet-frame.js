import { Application, Assets, Sprite } from 'pixi.js';

let frameTexture;

async function loadFrameTexture() {
  if (!frameTexture) {
    frameTexture = Assets.load('/machines/moonlit-pachinko-frame.png').then(texture => {
      texture.source.scaleMode = 'nearest';
      return texture;
    });
  }
  return frameTexture;
}

export async function mountPixelCabinetFrame(host) {
  const app = new Application();
  await app.init({
    backgroundAlpha: 0,
    antialias: false,
    autoDensity: false,
    resolution: 1,
    preference: 'webgl',
    hello: false
  });

  const texture = await loadFrameTexture();
  const frame = new Sprite(texture);
  app.stage.addChild(frame);
  app.canvas.className = 'pixel-cabinet-frame';
  app.canvas.setAttribute('aria-hidden', 'true');
  host.append(app.canvas);

  const paint = () => {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    app.renderer.resize(Math.floor(width), Math.floor(height));
    frame.width = Math.floor(width);
    frame.height = Math.floor(height);
  };
  const observer = new ResizeObserver(paint);
  observer.observe(host);
  requestAnimationFrame(paint);

  return {
    destroy() {
      observer.disconnect();
      app.destroy(true, { children: true });
    }
  };
}
