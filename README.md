# Crossings

by Vervia. 一个用真实新西兰街区地图来玩的填字游戏。每条街是一个词，路口共用同一个字母。迷雾会随着答对的街道散开，地名要全部做完才揭晓。

这是给 Jeff 在自己 iPhone 上用 **Expo Go** 试玩的第一版。没有账号、没有付款、没有上架。

## 在 Mac 上跑起来，再用 iPhone 打开

1. 安装 [Node.js 22](https://nodejs.org/)（或更新的 22）。
2. 打开终端，启用 pnpm：

   ```bash
   corepack enable
   corepack prepare pnpm@10.33.4 --activate
   ```

3. 进入这个项目，安装依赖：

   ```bash
   pnpm install
   ```

4. 启动 App：

   ```bash
   cd apps/mobile
   pnpm start
   ```

5. iPhone 上从 App Store 安装 **Expo Go**，并更新到最新版（这一版用的是 Expo SDK 58）。Mac 和 iPhone 连同一个 Wi-Fi。
6. 用 iPhone 相机扫描终端里的二维码，在 Expo Go 里打开。
7. 如果手机连不上，回到 `apps/mobile` 再运行：

   ```bash
   pnpm start -- --tunnel
   ```

   隧道会慢一些，但不用同一 Wi-Fi。

打开后先看到 **Crossings / by Vervia**。Today 里有四张难度卡。**Medium** 是完整的 7 条街样题，**Easy** 是其中 5 条街。Hard 和 Super Hard 先占着位置，这一版还没有题。

## 这一版能玩什么

- 战争迷雾、点格子选词、双指缩放和拖动、大键盘、Hint、Check、朗读线索。
- 答对一条街会散开迷雾，并弹出一张发现卡。
- 做完才显示地名，并给出不剧透的分享文字。
- 地图上一直有 OpenStreetMap 署名。
- 进度存在手机里（SQLite）。杀掉 App 再开，字母还在。
- About 里可以放大字号、打开高对比。List 按钮给不方便看地图的人用。

## 还没做的

- 服务器算分、账号、好友、排行榜、订阅、通知。
- Hard / Super Hard 的题目，以及每天自动换街区。
- `apps/web` 只是 API 骨架，没有部署，也没有密钥。`.env.example` 里列出了以后要用的变量名。
- 进度用的是 `expo-sqlite`（Expo Go 里自带）。MMKV 要单独的开发版 App，现在装不进 Expo Go。

## 给开发的命令

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm sample   # 用原型数据重新生成 Ponsonby 样题
```

样题在 `docs/sample-ponsonby.json`（Medium）和 `docs/sample-ponsonby-easy.json`。开发计划在 `docs/DEV-PLAN.md`。

## Run it (English)

```bash
corepack enable && corepack prepare pnpm@10.33.4 --activate
pnpm install
cd apps/mobile && pnpm start
```

Install Expo Go on the iPhone, join the same Wi-Fi as the Mac, and scan the QR code. Use `pnpm start -- --tunnel` if the phone cannot see the Mac. Play **Medium** for the full 7-street sample.
