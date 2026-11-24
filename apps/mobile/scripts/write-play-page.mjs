import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { expoGoUrl, playPageHtml, qrImageUrl, runtimeVersionFromApp } from './eas-update-lib.mjs';

const appPath = resolve(import.meta.dirname, '../app.json');
const app = JSON.parse(readFileSync(appPath, 'utf8'));
const projectId = app.expo?.extra?.eas?.projectId;
const channel = process.argv[2] ?? 'production';
const outDir = resolve(process.argv[3] ?? 'play-site');
if (!projectId) {
  console.error('Missing project id');
  process.exit(1);
}
const runtimeVersion = runtimeVersionFromApp(app);
const openUrl = expoGoUrl({ projectId, runtimeVersion, channel });
const qrSrc = qrImageUrl({ projectId, runtimeVersion, channel });
mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, 'index.html'), playPageHtml({ expoGoUrl: openUrl, qrSrc }));
writeFileSync(resolve(outDir, 'link.txt'), `${openUrl}\n${qrSrc}\n`);
console.log(openUrl);
