/**
 * Pure helpers for the Expo Go publish link.
 * The QR always points at a channel, so it opens the newest update on that channel.
 */

export function runtimeVersionFromApp(app) {
  const runtime = app?.expo?.runtimeVersion;
  if (runtime?.policy === 'appVersion') {
    if (!app.expo.version) throw new Error('app.json is missing expo.version');
    return app.expo.version;
  }
  if (typeof runtime === 'string' && runtime.length > 0) return runtime;
  throw new Error('Set runtimeVersion in app.json so Expo Go can load the update');
}

export function withProject(app, projectId) {
  if (!projectId) throw new Error('Missing EAS project id');
  return {
    ...app,
    expo: {
      ...app.expo,
      updates: {
        ...(app.expo.updates ?? {}),
        url: `https://u.expo.dev/${projectId}`,
      },
      extra: {
        ...(app.expo.extra ?? {}),
        eas: {
          ...(app.expo.extra?.eas ?? {}),
          projectId,
        },
      },
    },
  };
}

export function expoGoUrl({ projectId, runtimeVersion, channel }) {
  const params = new URLSearchParams({
    'runtime-version': runtimeVersion,
    'channel-name': channel,
  });
  return `exp://u.expo.dev/${projectId}?${params.toString()}`;
}

export function qrImageUrl({ projectId, runtimeVersion, channel }) {
  const params = new URLSearchParams({
    projectId,
    runtimeVersion,
    channel,
    slug: 'exp',
  });
  return `https://qr.expo.dev/eas-update?${params.toString()}`;
}

function escapeAttr(value) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

export function playPageHtml({ expoGoUrl: openUrl, qrSrc }) {
  const openHref = escapeAttr(openUrl);
  const imageSrc = escapeAttr(qrSrc);
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Crossings</title>
  <style>
    body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #1b1822; color: #16130f; }
    main { max-width: 420px; margin: 32px auto; background: #fffaf0; border-radius: 20px; padding: 28px 22px 32px; text-align: center; }
    h1 { margin: 0; font-size: 36px; }
    .by { color: #6b4e12; margin: 4px 0 16px; }
    img { width: min(280px, 80vw); height: auto; background: #fff; border-radius: 12px; }
    a.button { display: inline-block; margin-top: 18px; background: #ffcf33; color: #16130f; text-decoration: none; font-weight: 700; padding: 14px 18px; border-radius: 12px; }
    p { line-height: 1.45; }
  </style>
</head>
<body>
  <main>
    <h1>Crossings</h1>
    <p class="by">by Vervia</p>
    <p>用 iPhone 相机扫描这个二维码，然后点 <b>Open in Expo Go</b>。</p>
    <p>Scan this with the iPhone camera, then tap <b>Open in Expo Go</b>.</p>
    <img alt="QR code that opens Crossings in Expo Go" src="${imageSrc}">
    <p><a class="button" href="${openHref}">Open in Expo Go</a></p>
    <p>需要先从 App Store 安装并更新 Expo Go。这个码一直打开最新版本。</p>
  </main>
</body>
</html>
`;
}
