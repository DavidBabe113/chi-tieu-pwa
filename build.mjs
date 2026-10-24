// Dựng bản chạy từ src/: node build.mjs (cần esbuild: npx esbuild)
import { execSync } from 'node:child_process';
const run = c => execSync(c, { stdio: 'inherit' });
run('npx --yes esbuild src/app.js --minify --target=safari15 --outfile=app.js --legal-comments=none');
run('npx --yes esbuild src/style.css --minify --target=safari15 --outfile=style.css');
