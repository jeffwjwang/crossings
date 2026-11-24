import assert from 'node:assert/strict';
import test from 'node:test';

import { expoGoUrl, qrImageUrl, runtimeVersionFromApp, withProject } from './eas-update-lib.mjs';

test('runtime version follows the app version', () => {
  assert.equal(
    runtimeVersionFromApp({ expo: { version: '0.1.0', runtimeVersion: { policy: 'appVersion' } } }),
    '0.1.0',
  );
});

test('Expo Go link matches qr.expo.dev', () => {
  const projectId = '00000000-0000-4000-8000-000000000000';
  assert.equal(
    expoGoUrl({ projectId, runtimeVersion: '0.1.0', channel: 'production' }),
    'exp://u.expo.dev/00000000-0000-4000-8000-000000000000?runtime-version=0.1.0&channel-name=production',
  );
  assert.equal(
    qrImageUrl({ projectId, runtimeVersion: '0.1.0', channel: 'production' }),
    'https://qr.expo.dev/eas-update?projectId=00000000-0000-4000-8000-000000000000&runtimeVersion=0.1.0&channel=production&slug=exp',
  );
});

test('project id is written into the update URL', () => {
  const next = withProject({ expo: { name: 'Crossings', slug: 'crossings' } }, 'abc');
  assert.equal(next.expo.updates.url, 'https://u.expo.dev/abc');
  assert.equal(next.expo.extra.eas.projectId, 'abc');
});
