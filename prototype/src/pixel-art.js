const converted = new WeakSet();

function pixelize(image) {
  if (converted.has(image) || image.dataset.pixelized || !image.src || image.src.startsWith('data:')) return;
  converted.add(image);
  const convert = async () => {
    try {
      await image.decode();
      if (!image.isConnected || image.dataset.pixelized || !image.naturalWidth) return;
      const scale = 8;
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(image.naturalWidth / scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight / scale));
      canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
      image.dataset.pixelized = 'true';
      image.src = canvas.toDataURL('image/png');
    } catch { /* Keep the original if a browser or image format cannot be decoded. */ }
  };
  if (image.complete) void convert();
  else image.addEventListener('load', convert, { once: true });
}

function scan(node) {
  if (node instanceof HTMLImageElement) pixelize(node);
  node.querySelectorAll?.('img').forEach(pixelize);
}

scan(document);
new MutationObserver(records => records.forEach(record => {
  record.addedNodes.forEach(scan);
  if (record.type === 'attributes') pixelize(record.target);
})).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
