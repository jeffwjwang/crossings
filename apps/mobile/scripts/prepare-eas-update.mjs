import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { withProject } from './eas-update-lib.mjs';

const appPath = resolve(import.meta.dirname, '../app.json');
const app = JSON.parse(readFileSync(appPath, 'utf8'));
const projectId = app.expo?.extra?.eas?.projectId;
if (!projectId) {
  console.error('eas init did not write a project id into app.json');
  process.exit(1);
}
const next = withProject(app, projectId);
writeFileSync(appPath, `${JSON.stringify(next, null, 2)}\n`);
console.log(projectId);
