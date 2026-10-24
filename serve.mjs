// Chạy app trên máy tính: node serve.mjs  (mở http://localhost:8080). Không cần cài thêm gì ngoài Node.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';
const root = fileURLToPath(new URL('.', import.meta.url)), port = Number(process.env.PORT) || 8080;
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png' };
createServer(async (q, s) => {
  let p = decodeURIComponent(new URL(q.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html';
  const f = join(root, normalize(p).replace(/^[\/]+/, ''));
  if (!f.startsWith(root)) { s.writeHead(403).end(); return; }
  try { s.writeHead(200, { 'content-type': types[extname(f)] || 'application/octet-stream', 'cache-control': 'no-store' }).end(await readFile(f)); }
  catch { s.writeHead(404).end('Not found'); }
}).listen(port, () => { const u = `http://localhost:${port}/`; console.log('Financial Tracking chạy tại ' + u); exec(`start "" "${u}"`); });
