# Crossings

by Vervia. 用 iPhone 相机扫一个二维码，就能在 Expo Go 里玩。Mac 上什么都不用装。

## 玩

iPhone 先从 App Store 安装 **Expo Go**，并更新到最新版。

二维码在这里（第一次发布成功后才会出现）：

**https://jeffwjwang.github.io/crossings/**

用相机对准页面上的二维码，点 **Open in Expo Go**。这个码一直打开最新版本。家人用同一个码。

## 只做一次

1. 打开 [expo.dev/signup](https://expo.dev/signup)，用免费账号登录。项目属于团队 **jeffwjwangs-team**。
2. 打开 [团队的 Access tokens 页面](https://expo.dev/accounts/jeffwjwangs-team/settings/access-tokens)，点 **Create token**，名字随便写，复制那一串字符。它只显示一次。
3. 打开 [GitHub 的添加密钥页面](https://github.com/jeffwjwang/crossings/settings/secrets/actions/new)。Name 填 `EXPO_TOKEN`，Secret 粘贴刚才的字符，点 **Add secret**。不要把这串字符发给别人，也不要写进仓库。
4. 打开 [GitHub Pages 设置](https://github.com/jeffwjwang/crossings/settings/pages)。**Source** 选 **GitHub Actions**，保存。
5. 把这个 pull request 合并进 `main`。GitHub 会自己发布。大约几分钟后，上面的网址就会出现二维码。

如果合并时密钥还没加好，发布会失败。密钥加好后，打开 [Actions 里的 Publish to Expo Go](https://github.com/jeffwjwang/crossings/actions/workflows/eas-update.yml)，点 **Re-run** 或 **Run workflow**。同一次运行的摘要里也有这个二维码。

## Play (English)

Install **Expo Go** from the App Store and update it. After the first publish, scan the QR code at **https://jeffwjwang.github.io/crossings/** with the iPhone camera and tap **Open in Expo Go**. That same code always opens the latest version.

One time only:

1. Sign in at [expo.dev/signup](https://expo.dev/signup). The project owner is the team **jeffwjwangs-team**.
2. Create a token at [the team's Access tokens page](https://expo.dev/accounts/jeffwjwangs-team/settings/access-tokens). Copy it. It is shown once.
3. Add it at [New repository secret](https://github.com/jeffwjwang/crossings/settings/secrets/actions/new). Name: `EXPO_TOKEN`. Do not commit the token.
4. At [GitHub Pages](https://github.com/jeffwjwang/crossings/settings/pages), set Source to **GitHub Actions**.
5. Merge to `main`. The QR appears at the link above when the publish finishes. If it failed because the secret was missing, add the secret and re-run [Publish to Expo Go](https://github.com/jeffwjwang/crossings/actions/workflows/eas-update.yml).

## 这一版能玩什么

Today 里选 **Medium**（完整的 7 条街）或 **Easy**（5 条街）。街道是填字，路口共用字母。迷雾会散开，地名做完才揭晓。地图上有 OpenStreetMap 署名。

## 给开发的人

Mac 上的本地运行不是给试玩用的。需要的话：`pnpm install`，然后 `cd apps/mobile && pnpm start`。

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm sample
```

推到 `main` 会发到 Expo Go 的正式二维码。Pull request 会另发一个预览，不换掉正式二维码。
