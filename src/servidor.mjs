// Servidor estático mínimo para o navegador headless carregar módulos ES (file:// bloqueia imports).
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
};

export function iniciarServidor(raiz) {
  const base = path.resolve(raiz);
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const arquivo = path.resolve(base, '.' + url);
    if (!arquivo.startsWith(base)) {
      res.writeHead(403).end();
      return;
    }
    fs.readFile(arquivo, (err, data) => {
      if (err) {
        res.writeHead(404).end();
        return;
      }
      res.writeHead(200, { 'Content-Type': TIPOS[path.extname(arquivo)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(data);
    });
  });
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve({ server, porta: server.address().port }));
  });
}
