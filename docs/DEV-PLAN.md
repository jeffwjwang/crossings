# Crossings — 开发计划 v1.1

> 产品名：**Crossings**（Jeff 已决定）。开发者 / 卖家名称：**VERVIA LIMITED**（公司），App 内显示 “by Vervia”。App Store 显示名：**Crossings: NZ Street Crossword**；主屏幕图标下的名字：**Crossings**。原型旧名 “Kiwi Streets Crossword”。详见第 0.1 节。

> 用途：交给 Cursor 分阶段开发 iPhone App。**v1 只做 iPhone**（不做 iPad 专门适配，不上安卓）。
> 编写：Grok Bot，2026-11-24（NZDT）。v1.1 更新：并入 Jeff 2026-11-24 的决定（见第 20 节）。依据：`/workspace/nz-crossword-proto/` 里已经能玩的 Ponsonby 网页原型。
> 文中的工期、价格、用户行为都是**估计或假设**，已逐处标注。外部事实都附了来源链接；拿不准的写成“需核实”。

---

## 0. 结论先行

1. **产品定位**：每天一个真实的新西兰街区。街道就是填字的“格子路线”，路口就是共用字母。开局是战争迷雾，每答对一条街，迷雾就散开一段，还会弹出一张知识卡。全部答完才揭晓“今天在哪”。核心受众是新西兰老年人，但界面和内容对所有人友好（包括 13 岁以下的孩子，见第 12.1 节）。**v1 只做英文、只做 iPhone、只上新西兰区 App Store。**
2. **每天 4 道题，用户自己选难度**：同一个街区出 Easy / Medium / Hard / Super Hard 四个版本（街道数和词不同）。不再按星期轮换。
3. **三块分工**：
   - **App**（Cursor 开发）：Expo + React Native + TypeScript，地图和格子用 `react-native-skia` 画。
   - **后端**（Cursor 开发，部署在 Vercel）：Next.js API + Neon Postgres + Vercel Blob。另含一个受保护的 `/admin` 管理页。
   - **内容端（全部在 Grok Bot 这里）**：线索挖掘不再单独建 bot，由 Grok Bot 每天 09:00（NZ 时间）的 routine 完成：写候选清单，在 Grok Bot 聊天里和 Jeff 讨论；Jeff 批准后，Grok Bot 运行 Python 流水线生成谜题，再用带密钥的 Admin API 发布。
4. **谜题全部离线预生成**，手机上不出题。每道题一个 JSON 文件（街道几何、格子、答案哈希、提示、知识卡、图片和授权信息、难度）。第 4 节有精确的 schema。
5. **MVP 分两步**：
   - **M1 试玩版**（TestFlight）：先给亲友试玩，同时寻找退休村、图书馆等试点机构。范围：核心玩法、每天 4 个难度、迷雾、知识卡、连续打卡、离线、大字号和无障碍。不做账号和社交。
   - **M2 v1.0 上架版**：账号（匿名 + Sign in with Apple）、积分、好友（需对方确认）、好友和全体排行榜（显示用户自选昵称，带审核）、挑战好友、订阅、“点亮新西兰”全国地图、每日提醒、儿童保护措施。
6. **其余特色功能**（家庭合作、退休村联赛、周末公路旅行、老照片今昔对比、用户自制谜题等）放到 v1.1 及以后；**多语言（含 te reo Māori）放到以后的版本**。第 7 节有优先级表。
7. **反作弊靠服务器**：手机端只能做方便用户的本地校验；分数由服务器根据提交的答案和时间重新计算，并做合理性检查。
8. **收费**（价格为提议，待 Jeff 最终确认）：**当天 4 道题和最近 3 天全部免费**。订阅 Crossings Plus 月付 NZ$4.99、年付 NZ$39.99，首次订阅 7 天免费试用，解锁 3 天以前的往期和额外内容。另卖一次性内购：主题题包（例 NZ$2.99 / 10 道）和提示包（例 NZ$1.99）。全部由 RevenueCat 处理。**不放打扰式广告，不放行为定向广告。**
9. **分析用 PostHog**；13 岁以下用户不带任何个人标识。
10. **工期估计**（Jeff 一人 + Cursor，业余时间投入，纯属估计）：M1 约 6–9 周，M2 再加约 8–10 周。每天 4 道题让内容量变成原来的 4 倍，主要压力在内容端，由 Grok Bot 承担。

### 0.1 命名与品牌（Jeff 2026-11-24 决定）

| 位置 | 用什么 |
|---|---|
| 产品名 / 主屏幕名（`expo.name`，即 `CFBundleDisplayName`） | **Crossings** |
| App Store 显示名（App Store Connect 的 App Name，最多 30 个字符） | **Crossings: NZ Street Crossword**（30 个字符，正好在上限内） |
| App Store 副标题（Subtitle，最多 30 个字符） | 待定，例如 “Explore a real NZ street daily”（草稿，需 Jeff 确认） |
| 开发者 / 卖家名称 | **VERVIA LIMITED**（Jeff 已决定）。Apple Developer Program 以**组织（Organization）**身份注册，需要公司的 D-U-N-S 编号（需核实：是否已有、申请要多久）；App Store 上的卖家名以 Apple 验证的公司法定名称为准 |
| 上架地区 | v1 **只上新西兰区**（App Store Connect → Pricing and Availability 只勾 New Zealand） |
| “by Vervia” 出现的位置 | 启动画面（splash）、设置里的 About 页、分享图片的页脚 |
| Bundle ID（建议） | `nz.vervia.crossings` 或 `com.vervia.crossings`（取决于域名，待定） |

- **待办**：在 App Store Connect 里新建 App 记录，确认 “Crossings: NZ Street Crossword” 这个名字可用；不可用时的备选：“Crossings – NZ Street Puzzle”“Crossings NZ: Daily Crossword”（均为草稿）。
- 单独的 “Crossings” 很可能已被其他 App 占用（未核实），所以商店名带上描述词，主屏幕名仍然只显示 Crossings。
- 字符上限以 [App Store Connect 帮助](https://developer.apple.com/help/app-store-connect/reference/app-information/) 当前说明为准（需核实）。

---

## 1. 原型现状（已验证可用的部分）

原型文件在 `/workspace/nz-crossword-proto/`：

| 文件 | 作用 | 迁移到正式项目 |
|---|---|---|
| `osm.json` | Overpass 抽取的 Ponsonby 一带 OSM 数据 | 流水线第 1 步 `fetch_osm` |
| `geo.py` / `prep.py` | 经纬度投影成本地米制坐标；算街道长度和交叉点 | `pipeline/kiwi_pipeline/geo.py` |
| `solve.py` / `solve2.py` | 先按几何找“词槽”（每条街一段，字母间距 `D=20m`），再用回溯法填词，保证交叉字母一致 | `pipeline/kiwi_pipeline/slots.py`、`fill.py` |
| `bank.py` | 手写词库：`BANK`（词 → 提示）、`STREETBANK`（街名当答案） | 改成读取 Grok Bot 线索挖掘流程产出的批准词库 JSON |
| `build.py` | 生成 `cells`、`words`、背景 `roads`/`parks`、`facts`；断言交叉字母一致、格子不重叠 | `pipeline/kiwi_pipeline/build.py` + `validate.py` |
| `template.html` → `ponsonby.html` | SVG 渲染、迷雾、选词高亮、大按钮键盘、Hint、Check、发现卡片、地名遮罩、Wordle 式分享文字、`localStorage` 存档 | App 的玩法规格参考 |
| `test.py` | Playwright 在桌面和手机尺寸各自动解一遍并截图 | 端到端测试思路参考 |

原型的数据结构（`build.py` 输出）：

```text
bbox: [minx,miny,maxx,maxy]                      // 本地米制坐标
roads: [{n: 街名, c: 等级0-3, p: [[x,y],...]}]     // 背景道路
parks: [{n, p}]
cells: [{x, y, a: 字母}]                          // 共用格子只出现一次
words: [{street, answer, clue, cells:[cellIdx], path:[[x,y]], isStreet}]
facts: {街名: {len: 长度米, meets: [相交街名]}}
D: 20                                             // 格子间距（米）
```

原型的已知不足：答案还没用街名；发现卡片只有长度和相交街道，没有历史；只有一题；答案明文写在 HTML 里；SVG 不适合 VoiceOver。正式版都要解决。

---

## 2. 系统架构：什么跑在哪里

```text
┌──────────────────────── Grok Bot 的 box（Linux，持久） ─────────────────────────┐
│  09:00 线索挖掘 routine ──► clue-mining/YYYY-MM-DD-线索清单.md ──(Jeff 在聊天里批准)──► wordbank/approved/*.json │
│                                                     │                           │
│  pipeline/（Python）: fetch_osm → slots → fill → enrich → validate → render_preview  │
│                                                     │                           │
│  review/：预览 PNG + 校验报告 ──(Jeff/Grok Bot 审核)──► publish.py                  │
└───────────────────────────────────────────────────────┼────────────────────────┘
                                                        │ HTTPS + Bearer ADMIN_API_TOKEN
                                                        ▼
┌──────────────────────────── Vercel（apps/web，Next.js） ─────────────────────────┐
│  /api/admin/*  收谜题、排期、上传图片、看统计、处理举报                              │
│  /admin        受保护的管理网页（Jeff 用）                                          │
│  /api/v1/*     App 用的公开 API（需用户 token）                                     │
│  Neon Postgres：用户、成绩、好友、排期……   Vercel Blob/CDN：谜题 JSON、图片、音频       │
└───────────────────────────────────────────────────────┼────────────────────────┘
                                                        ▼
┌──────────────────────────── iPhone（apps/mobile，Expo） ───────────────────┐
│  下载当天谜题 JSON → 本地缓存（离线可玩）→ Skia 渲染地图/迷雾/格子                     │
│  本地存档（MMKV）→ 联网时把成绩提交服务器 → 服务器算分、更新排行榜                      │
└────────────────────────────────────────────────────────────────────────────────┘
```

| 部分 | 运行位置 | 谁开发 | 谁维护 |
|---|---|---|---|
| `apps/mobile` | 用户手机 | Cursor | Jeff |
| `apps/web`（API + `/admin`） | Vercel | Cursor | Jeff |
| `packages/puzzle-schema` | 被 mobile、web、pipeline 共用 | Cursor | Jeff |
| `pipeline/` | Grok Bot 的 box（从同一个 Git 仓库拉代码） | Cursor 写，Grok Bot 可以改 | Grok Bot 每天运行 |
| 线索挖掘 | Grok Bot 自己（每天 09:00 NZ 的 routine），不另建 bot | Grok Bot | Grok Bot，和 Jeff 在 Grok Bot 聊天里讨论 |
| `ADMIN_API_TOKEN` | Vercel 环境变量 + box 上的 `/workspace/kiwi-crossword/.env`（权限 600） | Jeff 自己设置 | 不在聊天里传 |

---

## 3. 推荐仓库结构（monorepo）

使用 pnpm workspaces + Turborepo。

```text
kiwi-streets/
├── apps/
│   ├── mobile/                     # Expo (SDK 最新稳定版) + Expo Router；v1 只出 iPhone（ios.supportsTablet=false）
│   │   ├── app/                    # 路由：(tabs)/today, map, friends, profile; puzzle/[id]; settings; parental-gate
│   │   ├── src/
│   │   │   ├── game/               # 纯逻辑：state reducer、选词、输入、hint、check（无 UI，可单测）
│   │   │   ├── render/             # Skia：BackgroundLayer, FogLayer, CellsLayer, PathHighlight
│   │   │   ├── a11y/               # 无障碍列表模式（VoiceOver 用）
│   │   │   ├── api/                # 类型安全的 API client（用 puzzle-schema 的类型）
│   │   │   ├── storage/            # MMKV 封装：存档、缓存谜题、设置
│   │   │   ├── features/           # friends, leaderboard, challenges, collection, subscription
│   │   │   └── ui/                 # 大按钮键盘、卡片、主题（高对比/大字）
│   │   ├── assets/fonts/           # Atkinson Hyperlegible、OpenDyslexic（均为 SIL OFL，需核实版本）
│   │   └── app.config.ts
│   └── web/                        # Next.js（App Router）
│       ├── app/api/v1/...          # 公开 API
│       ├── app/api/admin/...       # Admin API（Bearer token）
│       ├── app/api/webhooks/revenuecat/route.ts
│       ├── app/admin/...           # 管理网页（受保护）
│       ├── app/i/[code]/page.tsx   # 好友邀请落地页（Universal Link）
│       ├── app/privacy, app/terms, app/attributions
│       ├── src/db/                 # Drizzle ORM schema + migrations
│       └── src/lib/                # auth, scoring 调用, rate limit, moderation
├── packages/
│   ├── puzzle-schema/              # TS 类型 + zod 校验 + 导出 JSON Schema（给 Python 用）
│   ├── scoring/                    # 计分函数（服务器权威；App 只做预览）
│   └── config/                     # eslint, tsconfig 共享
├── pipeline/                       # Python 3.11+
│   ├── kiwi_pipeline/              # geo, osm, slots, fill, enrich, validate, render_preview, publish
│   ├── schemas/                    # 从 packages/puzzle-schema 生成的 puzzle.schema.json
│   ├── tests/
│   └── pyproject.toml
├── docs/                           # 本计划、ADR、内容规范
└── .github/workflows/              # CI：lint、类型检查、单测、schema 一致性检查
```

内容数据（线索、批准词库、生成的谜题草稿）**不进代码仓库**，放在 box 的 `/workspace/kiwi-crossword/`，每天备份到 Google Drive。

---

## 4. 谜题 JSON Schema（核心契约）

### 4.1 设计原则

- 坐标沿用原型：以街区中心为原点的**本地米制平面坐标**（x 向东，y 向南，单位米），同时记录投影原点经纬度，方便以后叠真实地图。
- **剧透信息加密**：街名、地名、答案在 JSON 里不出现明文，放进 `secret` 字段（用每题的 `puzzleKey` 做 AES-GCM 加密）。`puzzleKey` 由 API 在当天才下发。这只能挡住随手偷看，不能挡住决心作弊的人，真正的反作弊在服务器（第 6.4 节）。
- 每个词有 `answerHash`，App 可以离线判断整词对错；服务器用明文答案复核。
- 所有媒体、知识卡都带**来源和授权字段**，缺了就不能通过校验。
- `schemaVersion` 必填；App 遇到不认识的大版本要提示升级。

### 4.2 TypeScript 类型（`packages/puzzle-schema/src/puzzle.ts`）

```ts
export type Difficulty = 'easy' | 'medium' | 'hard' | 'super_hard';
export type WordSource =
  | 'common' | 'news' | 'nz_slang' | 'place' | 'history' | 'street_name' | 'nature';
// v1 只用英文答案（含 NZ English 允许表里的毛利语来源专有名词和动植物名，见 9.6）；
// 一般 te reo 词汇和 'te_reo' 类别留给以后的多语言版本（届时 schemaVersion 升级）
export type ClueStyle = 'straight' | 'fill_blank' | 'cryptic_lite' | 'cryptic';

export interface Puzzle {
  schemaVersion: '1.0';
  id: string;                    // 例 "2026-12-01-ponsonby-medium"
  kind: 'daily' | 'pack' | 'expedition_leg' | 'seasonal' | 'challenge_custom';
  packId?: string | null;        // kind = 'pack' 时必填
  dailySetId: string | null;     // 同一天同一街区的 4 个难度共用，例 "2026-12-01-ponsonby"
  date: string | null;           // NZ 日期 YYYY-MM-DD；非每日题为 null
  difficulty: Difficulty;
  theme: { id: string; title: string; season?: 'matariki' | 'waitangi' | 'christmas' | 'anzac' | 'rugby' | null };
  region: { island: 'north' | 'south' | 'other'; regionCode: string };   // 例 "AUK"，粗粒度，不剧透
  locationHint: { maskedName: string; letterCount: number };            // 例 "P•••••••", 8
  projection: { originLat: number; originLon: number; unit: 'm' };
  bbox: [number, number, number, number];
  cellSpacing: number;           // 原型 D=20
  background: {
    roads: { id: string; cls: 0 | 1 | 2 | 3; pts: [number, number][]; nameRef?: string }[];
    parks: { id: string; pts: [number, number][] }[];
    water?: { id: string; pts: [number, number][] }[];
    landmarks?: { id: string; x: number; y: number; icon: string; revealAfterWordId?: string }[];
  };
  cells: Cell[];
  words: Word[];
  startWordId: string;           // 开局唯一亮着的词
  rules: DifficultyRules;        // 由难度推导，但写进 JSON，方便单题调整
  knowledgeCards: KnowledgeCard[];
  media: MediaAsset[];
  finale: { cardId: string; whereAmI?: WhereAmIQuestion };
  attribution: { osm: true; text: string };   // 固定 "© OpenStreetMap contributors"
  secret: EncryptedBlob;         // 解密后为 PuzzleSecret
  contentHash: string;           // 除 secret 外全文的 sha256，用于去重和缓存
  generator: { pipelineVersion: string; wordbankDate: string; seed: number };
}

export interface Cell {
  id: number;
  x: number; y: number;
  wordIds: string[];             // 共用格子有 2 个以上
  preRevealed: boolean;          // 难度规则决定的预填字母
}

export interface Word {
  id: string;                    // "w1"…
  cellIds: number[];             // 按字母顺序
  path: [number, number][];      // 高亮用的街道折线（原型里的 path）
  length: number;
  enumeration?: string;          // 例 "4,5"（FLAT WHITE）；单词则省略
  clue: { text: string; style: ClueStyle };
  source: WordSource;
  answerHash: string;            // sha256(`${puzzle.id}:${word.id}:${ANSWER}`) 的 hex
  revealOrder: number;           // 1 = startWord；迷雾揭开顺序参考
  cardId: string;                // 答对后弹出的知识卡
  maskedStreet: string;          // 例 "P•••••• Road"，地图标签用
}

export interface PuzzleSecret {
  locationName: string;          // "Ponsonby, Auckland"
  answers: Record<string, string>;            // wordId → ANSWER（A–Z）
  streets: Record<string, string>;            // wordId → 真实街名
  roadNames: Record<string, string>;          // background.roads[].nameRef → 街名
}

export interface EncryptedBlob { alg: 'A256GCM'; iv: string; data: string }   // base64

export interface DifficultyRules {
  maxHints: number | null;       // null = 不限
  preRevealRatio: number;        // 0–1
  checkMode: 'per_letter' | 'per_word' | 'end_only';
  showWordLengthOnMap: boolean;
  targetSeconds: number;         // 计时奖励的参考时间
}

export interface WhereAmIQuestion {
  askAfterSolvedCount: number;   // 例：解出 50% 后可以猜
  options: string[];             // 4 个选项（明文无妨，正确项在 secret 外用哈希）
  answerHash: string;            // sha256(`${puzzle.id}:where:${option}`)
}

export interface KnowledgeCard {
  id: string;
  kind: 'street' | 'word' | 'news' | 'wiki' | 'history' | 'photo' | 'finale';
  title: string;                 // 例 "Pavlova"
  body: string;                  // 自己改写的 1–3 句话，≤ 280 字符，不照抄来源
  mediaIds: string[];
  links: { label: string; url: string }[];       // 例 Wikipedia 原文、新闻原文
  sources: SourceRef[];          // 至少 1 条
  freshness?: { publishedAt: string; expiresAt?: string };   // 新闻卡必填
  sensitivity: 'none' | 'review';                // 'review' 不能发布
}

export interface SourceRef {
  url: string;
  title: string;
  publisher: string;             // 例 "RNZ" / "Wikipedia"
  accessedAt: string;            // ISO 日期
  licence?: string;              // 例 "CC BY-SA 4.0"，事实性引用可省略
}

export interface MediaAsset {
  id: string;
  type: 'image' | 'audio';
  url: string;                   // Vercel Blob / CDN 上的副本
  width?: number; height?: number; durationSec?: number;
  alt: string;                   // 无障碍描述，必填
  creator: string;
  sourceUrl: string;             // 原始页面（Commons 文件页 / DigitalNZ 条目页）
  licence: string;               // 例 "CC BY 4.0" / "Public domain" / "No known copyright restrictions"
  licenceUrl?: string;
  attributionText: string;       // App 里原样显示
  commercialUseOk: boolean;      // 必须 true 才能发布（订阅 App 属于商业用途）
  modified: boolean;             // 裁剪/调色算修改，需要授权允许
  thenAndNow?: { pairedMediaId: string; year?: number };
}
```

### 4.3 示例（节选，基于原型的 Ponsonby 数据）

```json
{
  "schemaVersion": "1.0",
  "id": "2026-12-01-ponsonby-medium",
  "kind": "daily",
  "dailySetId": "2026-12-01-ponsonby",
  "date": "2026-12-01",
  "difficulty": "medium",
  "theme": { "id": "kiwi-classics", "title": "Kiwi classics", "season": null },
  "region": { "island": "north", "regionCode": "AUK" },
  "locationHint": { "maskedName": "P•••••••", "letterCount": 8 },
  "projection": { "originLat": -36.857, "originLon": 174.745, "unit": "m" },
  "bbox": [-220, -220, 1180, 1050],
  "cellSpacing": 20,
  "background": {
    "roads": [{ "id": "r12", "cls": 3, "pts": [[313.4, 203.4], [324.8, 233.5]], "nameRef": "n3" }],
    "parks": [{ "id": "p1", "pts": [[100, 100], [140, 100], [140, 150]] }]
  },
  "cells": [
    { "id": 0, "x": 313.4, "y": 203.4, "wordIds": ["w1", "w5"], "preRevealed": false },
    { "id": 1, "x": 324.8, "y": 233.5, "wordIds": ["w1"], "preRevealed": true }
  ],
  "words": [
    {
      "id": "w1",
      "cellIds": [0, 1, 2, 3, 4, 5, 6, 7],
      "path": [[310.0, 195.0], [360.2, 330.1]],
      "length": 8,
      "clue": { "text": "This is the Kiwi word for hiking.", "style": "straight" },
      "source": "nz_slang",
      "answerHash": "9f2c…(sha256 hex)",
      "revealOrder": 1,
      "cardId": "k-w1",
      "maskedStreet": "P••••••• Road"
    }
  ],
  "startWordId": "w1",
  "rules": { "maxHints": 5, "preRevealRatio": 0.1, "checkMode": "per_word", "showWordLengthOnMap": true, "targetSeconds": 600 },
  "knowledgeCards": [
    {
      "id": "k-w1",
      "kind": "word",
      "title": "Tramping",
      "body": "（由 Grok Bot 线索挖掘时根据来源改写的 1–3 句话）",
      "mediaIds": ["m-commons-123"],
      "links": [{ "label": "Read more on Wikipedia", "url": "https://en.wikipedia.org/wiki/Tramping_in_New_Zealand" }],
      "sources": [{ "url": "https://en.wikipedia.org/wiki/Tramping_in_New_Zealand", "title": "Tramping in New Zealand", "publisher": "Wikipedia", "accessedAt": "2026-11-30", "licence": "CC BY-SA 4.0" }],
      "sensitivity": "none"
    }
  ],
  "media": [
    {
      "id": "m-commons-123",
      "type": "image",
      "url": "https://<blob-host>/media/m-commons-123.webp",
      "alt": "（图片描述）",
      "creator": "（以 Commons 文件页为准）",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:（文件名）",
      "licence": "CC BY-SA 4.0",
      "licenceUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
      "attributionText": "Photo: （作者）, CC BY-SA 4.0, via Wikimedia Commons",
      "commercialUseOk": true,
      "modified": false
    }
  ],
  "finale": { "cardId": "k-finale", "whereAmI": { "askAfterSolvedCount": 4, "options": ["Ponsonby", "Parnell", "Devonport", "Mt Eden"], "answerHash": "…" } },
  "attribution": { "osm": true, "text": "© OpenStreetMap contributors" },
  "secret": { "alg": "A256GCM", "iv": "…", "data": "…" },
  "contentHash": "…",
  "generator": { "pipelineVersion": "0.1.0", "wordbankDate": "2026-11-30", "seed": 27 }
}
```

注：示例中的坐标、哈希、图片都是占位，不是真实数据。

### 4.4 校验规则（`validate.py` 和 zod 都要实现）

| 规则 | 失败时 |
|---|---|
| 每个共用格子在所有所属词里字母一致（原型 `build.py` 已有） | 拒绝 |
| 不同格子间距 ≥ `1.15 × cellSpacing`（原型已有） | 拒绝 |
| 所有词从 `startWordId` 出发能通过交叉连通（否则迷雾揭不开） | 拒绝 |
| 每个 `answerHash` 和 secret 里的答案对得上 | 拒绝 |
| 每张知识卡 ≥ 1 条 `sources`；新闻卡有 `publishedAt` | 拒绝 |
| 每个媒体 `commercialUseOk === true`，`attributionText`、`alt` 非空 | 拒绝 |
| 有 `sensitivity: 'review'` 的卡 | 拒绝 |
| 提示文字和知识卡（解开前可见的部分）不出现地名、街名明文 | 拒绝 |
| 难度指标落在第 5 节对应区间 | 警告，人工确认 |
| 答案不在允许范围：必须是英文词典词，或在 `nz_english_allowlist` 里（见第 9.6 节）；且不在脏话/敏感词黑名单 | 拒绝 |
| 同一 `dailySetId` 的 4 个难度齐全，且地点相同 | 拒绝（每日题） |
| JSON gzip 后 ≤ 250 KB（估计值，保证弱网下载快） | 警告 |

---

## 5. 难度分级规则

难度由流水线根据下表**自动计算并校验**，审核时可以手动改。词频用 Python 库 [`wordfreq`](https://pypi.org/project/wordfreq/) 的 Zipf 值（越大越常见；新西兰俚语和 te reo 词在它的语料里可能偏低，需要人工标“常见度”覆盖）。

| 指标 | Easy | Medium | Hard | Super Hard |
|---|---|---|---|---|
| 词数（街道数） | 4–5 | 6–7 | 8–10 | 10–14 |
| 词长 | 3–7 | 4–8 | 5–10 | 5–12 |
| 词频（Zipf，或人工常见度） | ≥ 4.0 | ≥ 3.3 | ≥ 2.5 | 不限 |
| 每词至少交叉数 | 1 | 1–2 | 2 | 2+，含多处连续交叉 |
| 提示风格 | `straight`、`fill_blank` | `straight` 为主，少量 `cryptic_lite` | 一半 `cryptic_lite` | `cryptic` 为主 |
| 新闻词 | 不用 | 最多 1 个 | 最多 2 个 | 最多 3 个 |
| 预填字母比例 `preRevealRatio` | 20% | 10% | 0 | 0 |
| Hint 上限 `maxHints` | 不限 | 5 | 3 | 1 |
| 对错检查 `checkMode` | 每个字母 | 每个词 | 每个词 | 全部填完才检查 |
| 地图上显示词长 | 是 | 是 | 是 | 否 |
| 计时参考 `targetSeconds`（估计，试点后调） | 480 | 720 | 1080 | 1500 |
| 地图范围（估计） | ≈ 0.6 km² | ≈ 1 km² | ≈ 1.5 km² | ≈ 2.5 km² |

**每日题安排（Jeff 已决定：每天 4 道，用户自选难度）**：

- 每天选 **1 个街区**，出 **4 个难度版本**：Easy、Medium、Hard、Super Hard。四个版本共用同一个 `dailySetId` 和地点，但街道数量、词、提示风格按上表不同。Easy 通常只用街区中心的几条街，Super Hard 用整个街区。
- 同一个街区的四个版本**尽量不重复答案**（重复率目标 ≤ 30%，估计值），这样玩完 Easy 再玩 Hard 还是新鲜的。
- 已知取舍：玩完任何一个版本就会知道今天的地点，“今天我在哪”的猜测奖励只在当天第一个完成的版本有效。
- 用户可以一天玩 1 道，也可以 4 道全玩。Today 页面并排显示 4 张难度卡片，记住用户上次选的难度。
- **内容量**：每天 4 道 → 每周 28 道 → 14 天缓冲需要 56 道已排期的题。这是原来单题方案的 4 倍，主要靠 Grok Bot 的流水线批量生产（第 8、9 节）。
- **免费 / 订阅**：当天 4 道题全部免费（Jeff 已决定），最近 3 天的往期也免费；更早的往期、周末公路旅行（v1.1）等是订阅内容；主题题包和提示包单独购买（第 10.5、14 节）。
- 设置里有“**轻松辅助**”开关：任何难度都可以多预填字母、不限 Hint，但分数乘 0.5，并在成绩上标“assisted”。这样老人不会被难题挡住。

---

## 6. 积分、连续打卡、排行榜、反作弊

### 6.1 计分公式（`packages/scoring`，服务器权威）

```text
wordBase(w)   = 10 × 该词非预填字母数
wordScore(w)  = wordBase(w) − 10 × 该词被 Hint 揭开的字母数 − 5 × 该词错误 Check 次数（最低 0）
raw           = Σ wordScore
difficultyMul = { easy: 1.0, medium: 1.5, hard: 2.0, super_hard: 3.0 }
timeBonus     = raw × 0.3 × clamp((targetSeconds − activeSeconds) / targetSeconds, 0, 1)
noHintBonus   = 全程未用 Hint ? raw × 0.2 : 0
whereAmIBonus = 在揭晓前猜对地名 ? 50 : 0（只有一次机会）
streakMul     = 1 + min(streak, 10) × 0.05          // 最多 +50%
assistMul     = 轻松辅助 ? 0.5 : 1
score = round((raw × difficultyMul + timeBonus + noHintBonus + whereAmIBonus) × streakMul × assistMul)
```

- `activeSeconds` 只算 App 在前台的时间，暂停（看知识卡、切出 App）不计时。老年人常常边玩边停，不应该被罚。
- 所有系数写在一个配置表里，试点后再调。以上数值是起点估计。

### 6.2 连续打卡（streak）

- 按 **NZ 日期**（`Pacific/Auckland`）计算：当天完成当天 4 道题中的**任意一道**，streak +1（一天最多 +1）。
- **打卡保护**：每周自动送 1 次（订阅用户 2 次），漏一天时自动消耗。对老人更友好，也减少挫败感。
- 往期补玩不算 streak。

### 6.3 排行榜

| 维度 | 范围 | 计算 |
|---|---|---|
| Daily（分难度） | 好友 / 全体 | 当天某个难度的分数，每个难度一张榜，只算当天（NZ 时间）第一次完成 |
| Daily（合计） | 好友 / 全体 | 当天 4 个难度分数之和（难度系数已经让难题分更高） |
| Weekly | 好友 / 全体 | 周一到周日所有每日题分数之和 |
| All-time | 好友 / 全体 | 累计分；另显示“点亮街区数”和最长 streak |
| Club（v1.1） | 退休村 / 俱乐部 | 成员平均分（不是总分，避免人多的赢） |

- 全体榜只显示前 100 名和“我的名次”。
- **显示用户自选的昵称**（Jeff 已决定）。昵称规则：3–20 个字符，只允许字母、数字、空格和少量符号；保存时过脏话和敏感词过滤（例如 npm 库 `obscenity`，加自己的新西兰俚语黑名单）；不能冒充官方（禁用 “admin”、“Vervia”、“Crossings” 等保留词）；可被举报，后台可以强制改名。13 岁以下用户的昵称规则见第 12.1 节。
- 带 “assisted” 标记的成绩单独显示，不和普通成绩混排（可选：只在好友榜显示）。
- 实现：Postgres 表 `plays` 存每次成绩；日榜和周榜用 SQL 窗口函数查询，加 60 秒 CDN 缓存。用户量小的阶段不需要 Redis。

### 6.4 反作弊（基础版）

1. **答案只在服务器算分**：App 提交 `{playId, entries: {wordId: 填入的字母}, hintsUsed, wrongChecks, activeSeconds, solveEvents[]}`；服务器用数据库里的明文答案核对，重新计算分数。App 上显示的分数只是预览。
2. **开局登记**：`POST /plays/{puzzleId}/start` 记录服务器时间。完成时，服务器时间差必须 ≥ `activeSeconds`；`activeSeconds` 低于“每个字母 1.5 秒”（估计阈值）的成绩标记为可疑，不进全体榜。
3. **每题每用户只有第一次完成进 Daily 榜**；重装 App 或换设备在登录账号后共享同一个记录。
4. **puzzleKey 当天才下发**：明天的题可以提前下载（为了离线），但钥匙要到 NZ 当天 00:00 才发；离线状态下用前一天已下发的钥匙（只提前 1 天）。
5. **限流**：每个用户每分钟最多 30 次写请求（Vercel 上用 Upstash Ratelimit 或简单的 Postgres 计数）。
6. 后台 `/admin` 有“可疑成绩”列表，可以一键移出排行榜。

---

## 7. 功能清单与优先级

### 7.1 Jeff 明确要的功能

| 功能 | 设计要点 | 阶段 |
|---|---|---|
| **加好友** | **需要对方确认**（Jeff 已决定）：输入好友码或打开邀请链接后发出好友请求，对方在 Friends 页接受或拒绝；请求 14 天过期；被拒或被拉黑不通知发起人。每个用户一个 6 位好友码（去掉易混字符 0/O/1/I）；分享邀请链接 `https://<域名>/i/<code>`（Universal Link，没装 App 先进落地页）；**通讯录匹配暂不做**（隐私负担重，审核问题多），列为以后可选 | M2 |
| **看好友的地图和题** | 好友主页显示他点亮的全国地图、streak、最近完成的街区；可以点开他玩过的题去玩 | 地图 M2，题目入口 M2 |
| **挑战好友** | 选一道自己已完成的题 → 发给好友 → 对方完成后双方看对比（分数、用时、Hint 数）。推送通知对方。挑战 7 天过期 | M2 |
| **积分系统** | 见 6.1 | M2（M1 只在本地显示分数） |
| **好友榜、全体榜** | 见 6.3 | M2 |
| **四级难度** | 每天 4 道，用户自选，见第 5 节 | M1 起就做 4 个难度（内容端从 P1 开始按 4 道/天生产） |
| **词汇来源丰富** | 普通英文词、新闻热词（约 70% 新西兰、30% 国际）、Kiwi 俚语（英文）、地名、历史、自然、街名本身；**v1 不用一般 te reo Māori 词汇做答案**，但日常 NZ English 里的毛利语来源地名和动植物名（例如 ROTORUA、TUI、KIWI）可以；由 Grok Bot 每天的线索挖掘供给 | M1 起逐步增加 |
| **答对后的拓展知识** | 知识卡：自己改写的短介绍 + 新闻或 Wikipedia 原文链接 + 授权照片和署名。卡片可收藏，进“收藏册” | M1（基础卡），M2（新闻卡 + 收藏册） |

### 7.2 让产品与众不同的功能（Grok Bot 的建议）

| # | 功能 | 为什么有特色 | 阶段 | 工作量估计 |
|---|---|---|---|---|
| 1 | **点亮新西兰**全国地图：每完成一个街区，在全国地图上点亮一个点；按大区统计进度 | 最强的长期回访动力；分享好看 | M2 | 中 |
| 2 | **今天我在哪**：揭晓前可以猜一次地名（四选一），猜对有奖励 | 原型已有悬念，再加互动 | M1（只显示）/ M2（计分） | 小 |
| 3 | **提名我的街区**：用户提名自己熟悉的街区和一句回忆；被选中当天推送“今天是你提名的街区！” | 情感连接，老年人特别受用；也给线索挖掘员提供素材 | v1.1 | 小–中 |
| 4 | **今昔对比（Memory Lane）**：同一地点的老照片和现在的照片，左右滑动对比 | 老人懂、年轻人没见过；DigitalNZ 有大量老照片（授权逐张核） | v1.1 | 中（主要是内容） |
| 5 | **家庭合作模式**：一部 iPhone 上两人轮流，或两部设备同玩一题（共享进度） | 祖孙一起玩；非实时版本容易做 | 同设备 v1.1；跨设备 Later | 小 / 大 |
| 6 | **退休村 / 俱乐部联赛**：机构码加入，看本机构周榜；给活动协调员一页打印版说明 | 线下推广渠道 | v1.1 | 中 |
| 7 | **周末公路旅行（Expedition）**：周日连续 3–5 个小街区，沿一条路线（例如 SH1 从北到南分几周走完） | 有“旅程感”，适合订阅内容 | v1.1 | 中–大（内容多） |
| 8 | **节日主题题**：Matariki、Waitangi Day、ANZAC Day、圣诞、橄榄球赛事 | 和时事同步，易传播 | v1.1 起按日历 | 小（内容为主） |
| 9 | **多语言版本**（含 te reo Māori 学习模式：发音音频、长元音写法、词表复习；以及其他语言） | Jeff 已决定 v1 主打英文，多语言以后再做 | Later（多语言） | 大；需要语言顾问和音频授权 |
| 10 | **无障碍全套**：大字号（跟随 Dynamic Type）、高对比主题、Atkinson Hyperlegible / OpenDyslexic 字体、TTS 朗读提示（`expo-speech`）、VoiceOver 列表模式 | 老年人刚需，也是审核加分 | M1 | 中 |
| 11 | **离线玩**：提前缓存今天和明天的题 | 乡村信号差、老人流量少 | M1 | 小 |
| 12 | **明信片收藏**：每个街区完成后得到一张插画明信片，可分享到家庭群 | 收集欲 + 社交传播 | M2（简单版：地图截图 + 地名） / v1.1（插画） | 小 / 中 |
| 13 | **天气和时间的地图风格**：惠灵顿刮风、罗托鲁瓦冒热气等氛围动画 | 记忆点 | Later | 中 |
| 14 | **用户自制谜题**：用户选自己的街道，流水线生成后**人工审核**再开放给好友 | 强社交，但审核负担和 1.2 合规成本大 | Later | 大 |
| 15 | **打印版**：每周导出 PDF，退休村可以打印纸质版 | 照顾不用手机的老人，也是推广物料 | v1.1 | 小 |
| 16 | **新闻词“本周热词”合集**：一周的新闻词汇成一个小测验 | 知识性、时效性 | Later | 小 |

### 7.3 版本范围汇总

- **M1 试玩版（TestFlight，先亲友，后试点机构）**：每天 4 道题（Easy/Medium/Hard/Super Hard，用户自选）、Skia 地图 + 迷雾 + 格子、大按钮键盘、Hint/Check、知识卡（街道卡 + 词卡 + Wikipedia 卡）、地名揭晓、分享文字、本地 streak、本地存档、离线、无障碍全套、每日提醒、OSM 署名页。无账号，用匿名设备 ID 上传匿名统计。
- **M2 v1.0（App Store）**：M1 全部 + 匿名账号和 Sign in with Apple + 删除账号、服务器计分、好友请求（需确认）和邀请链接、昵称审核、儿童保护措施（第 12.1 节）、好友主页和地图、挑战、好友榜和全体榜、点亮新西兰、新闻卡、收藏册、举报和拉黑、订阅（RevenueCat）、往期题库。
- **v1.1**：提名街区、今昔对比、同设备家庭模式、俱乐部联赛、周末公路旅行、节日题、打印版、插画明信片。
- **Later**：多语言版本（含 te reo Māori）、iPad 适配、安卓、用户自制谜题、跨设备实时合作、天气风格。

---

## 8. 内容端（放在 Grok Bot 这里）

### 8.1 目录（box）

```text
/workspace/kiwi-crossword/
├── repo/                    # git clone 的 monorepo（只用 pipeline/ 和 schemas/）
├── clue-mining/             # 每天 09:00 的候选清单 YYYY-MM-DD-线索清单.md（第 9 节）
├── content/
│   ├── wordbank/
│   │   ├── approved/        # Jeff 批准后的词库 YYYY-MM-DD.json
│   │   └── master.jsonl     # 累积词库（去重，带过期时间）
│   ├── neighbourhoods/      # 候选街区：osm 抽取缓存 + 评估结果
│   ├── media/               # 下载的图片（含授权元数据 sidecar .json）
│   ├── drafts/              # 生成的谜题草稿 *.json + 预览 *.png + 校验报告 *.md
│   ├── published/           # 已发布的谜题（与后端一致的副本）
│   └── nominations/         # 从后端拉下来的用户提名（v1.1）
├── .env                     # ADMIN_API_TOKEN、API_BASE、DIGITALNZ_API_KEY（chmod 600，Jeff 设置）
└── logs/
```

每天把 `clue-mining/` 和 `content/` 同步备份到 Google Drive（不含 `.env`）。注意：box 偶尔会被替换，`/workspace` 下名为 `dist`、`build`、`out`、`coverage`、`target`、`.cache` 等的文件夹会丢，所以内容目录不要用这些名字。

### 8.2 流水线步骤（`pipeline/kiwi_pipeline`）

| 步骤 | 命令 | 输入 → 输出 | 说明 |
|---|---|---|---|
| 1 | `kiwi fetch-osm --suburb "Ponsonby" --city Auckland` | Overpass → `neighbourhoods/<slug>/osm.json` | 原型用过 Overpass 镜像（`overpass-api.de` 当时返回 406）；要设置 User-Agent、缓存、限速 |
| 2 | `kiwi score-area <slug>` | osm → 适合度报告 | 交叉点数量、街道长度分布、能放多少词槽；太乱或太稀疏的街区淘汰 |
| 3 | `kiwi slots <slug> --difficulty all` | → 4 个难度各自的几何词槽候选 | 来自 `solve.py`/`solve2.py`；街道按 `cellSpacing` 采样；Easy 取街区中心的子集 |
| 4 | `kiwi fill <slug> --wordbank approved/2026-11-30.json --seed N` | 词槽 + 词库 → 4 个填好的网格（同一 `dailySetId`） | 回溯填词（原型 `fill()`），评分函数按难度规则；街名答案优先；4 个版本之间尽量少重复答案；过禁用词表（不用 te reo） |
| 5 | `kiwi enrich <draft>` | 网格 + 词库里的卡片 → 完整 `Puzzle` | 挂知识卡、媒体（下载到 `media/` 再上传 Blob）、四选一选项 |
| 6 | `kiwi validate <draft>` | → 校验报告 | 第 4.4 节全部规则 + JSON Schema 校验 |
| 7 | `kiwi preview <draft>` | → PNG（开局、中盘、终局三张） | 给 Jeff 在聊天里看；可复用原型的 Playwright 自动解题截图 |
| 8 | `kiwi publish <dailySet> --date 2026-12-01` | → 4 次 `POST /api/admin/puzzles` + 4 个难度排期 | 只发布 `validate` 通过且已标记 `approved` 的草稿 |

`secret` 加密：流水线生成随机 `puzzleKey`，加密后把密钥连同明文答案一起只发给 Admin API（存在数据库），不写进 Blob 上的公开 JSON。

### 8.3 审核与发布流程

1. Jeff 批准当天的线索清单后，Grok Bot 生成 4 个难度的草稿，运行 `validate` 和 `preview`。
2. Grok Bot 在聊天里把预览图和一段摘要（街区、4 个难度的答案列表、知识卡标题和来源）发给 Jeff，一天一次打包确认，不逐题打扰。
3. Jeff 回复“通过”或指出要改的地方。**只有 Jeff 明确通过的草稿才发布。**
4. 发布后，后端返回 `puzzleId` 和排期；Grok Bot 记到 `published/` 并核对 `contentHash`。
5. **排期缓冲**：始终保持未来 ≥ 14 天（= 14 套 × 4 难度 = 56 道）已排期的题。含新闻词的题只能排在未来 3 天以内（新闻会过时），所以新闻题和常规题分开生产：常规题提前做，新闻题每天补。
6. 每天 21:00（NZ 时间）Grok Bot 检查：明天 4 个难度的题都已就位、钥匙已入库、图片 URL 可访问。不满足就提醒 Jeff。

### 8.4 管理网页 `/admin`（Next.js，受保护）

| 页面 | 功能 |
|---|---|
| Schedule | 日历视图：每天一行、4 个难度四列，状态（draft / scheduled / live / retired）、预览、替换、撤下 |
| Puzzle detail | 渲染地图预览（复用 App 的渲染逻辑的 web 版，或直接显示流水线 PNG）、答案、知识卡、媒体署名 |
| Stats | DAU、完成率、平均用时和 Hint（按难度）、D1/D7/D30 留存、streak 分布、订阅数（来自 RevenueCat webhook） |
| Reports | 用户举报（昵称、挑战消息、以后的自制题）；处理：隐藏、强制改名、封禁、忽略 |
| Nicknames | 新昵称和被过滤命中的昵称列表，可人工放行或驳回 |
| Suspicious | 可疑成绩列表，一键移出排行榜 |
| Nominations（v1.1） | 用户提名的街区列表，Grok Bot 线索挖掘时读取 |

保护方式：MVP 用 Next.js middleware + HTTP Basic Auth（`ADMIN_USER`/`ADMIN_PASSWORD` 环境变量，只走 HTTPS）；v1.1 改成 Auth.js + 邮箱白名单。Admin API 用另一个 `ADMIN_API_TOKEN`（Bearer），两者分开。

---

## 9. 线索挖掘（由 Grok Bot 完成，不另建 bot）

> Jeff 已决定：线索挖掘放在 Grok Bot 这里，每天早上 09:00（NZ 时间）给他候选清单，在 Grok Bot 聊天里讨论；批准后由 Grok Bot 生成谜题数据。

### 9.1 职责

Grok Bot 用一个每日 routine 挖掘以下素材，整理成候选清单，跟 Jeff 讨论；Jeff 批准后生成批准词库 JSON，运行流水线生成 4 个难度的草稿，再按第 8.3 节发布：

- 候选新西兰街区（含用户提名，v1.1 起）
- 新闻热词：**约 70% 新西兰、30% 国际**（例如英伟达、黄仁勋这类科技新闻）。优先**经济、科技、体育、文化、历史**；**国内和国际政治类新闻都不用**；灾难、悲剧、敏感新闻不用
- 普通英文词（按难度和词频挑）
- Kiwi 英文俚语和本地英文用语（例如 jandal、chilly bin 这类英文词）
- 本地历史小知识、街名由来
- Wikipedia 摘要（用 [Wikipedia REST API](https://en.wikipedia.org/api/rest_v1/) 的 `page/summary/{title}`）
- 开放授权照片：[DigitalNZ](https://digitalnz.org/developers)（需要 API key；每条记录的使用权限不同，以 API 返回的权限字段为准）、[Wikimedia Commons](https://commons.wikimedia.org/)（用 `imageinfo` + `extmetadata` 读作者和授权）
- **v1 不收集一般 te reo Māori 词汇作答案**（多语言以后再做）；日常 NZ English 里的毛利语来源地名和动植物名可以用，按第 9.6 节允许表处理。新闻源可参考 [RNZ](https://www.rnz.co.nz/) 等新西兰媒体和国际通讯社，只取词和链接，不转载。

### 9.2 每日配额（每天 1 套 = 4 个难度）

| 项目 | 每天需要（估计） | 说明 |
|---|---|---|
| 街区 | 1 个主选 + 1 个备选 | 主选不合适时用备选 |
| 词槽总数 | 约 36 个（Easy 5 + Medium 7 + Hard 10 + Super Hard 14，取第 5 节区间中值） | 4 个版本之间答案重复率 ≤ 30% |
| 候选词 | 约 50–60 个 | 比词槽多，给填字算法留选择余地；常规词可以进 `master.jsonl` 以后复用 |
| 其中新闻词 | 最多 6 个（Medium 1 + Hard 2 + Super Hard 3；Easy 不用），按 70/30 分配，例如 4 个新西兰 + 2 个国际 | 有效期默认 3 天 |
| 街名事实 | 每条入选街道 1 条（带来源） | 用于街道知识卡 |
| 图片 | 每套 3–6 张（授权合格） | 不够就只放文字卡 |

**审批节奏（Jeff 已同意）**：常规词（非新闻）**可以一次批几天的量**，进 `master.jsonl` 备用；每天的审核只重点看**新闻词和当天街区**。

### 9.3 每日流程（NZ 时间）

| 时间 | 动作 |
|---|---|
| 08:00–09:00 | Grok Bot routine 自动运行：抓新闻源和数据源，评估候选街区，查 `master.jsonl` 里的可复用词 |
| **09:00** | 写好 `/workspace/kiwi-crossword/clue-mining/YYYY-MM-DD-线索清单.md`，在 Grok Bot 聊天里发给 Jeff：结论、候选街区、候选词表（标出新闻词和 70/30 比例）、不建议使用的词及原因、需要 Jeff 决定的事 |
| Jeff 有空时 | 在聊天里讨论：Jeff 划掉、修改、补充。Grok Bot 只按 Jeff 的回复改，不自作主张加词 |
| Jeff 说“批准” | Grok Bot 写 `content/wordbank/approved/YYYY-MM-DD.json`，追加 `master.jsonl`；运行流水线第 1–7 步生成 4 个难度草稿；把预览打包发给 Jeff 确认（第 8.3 节） |
| Jeff 确认预览 | Grok Bot 运行 `kiwi publish`，并回报 4 个 `puzzleId` 和排期日期 |
| Jeff 当天没回复 | 不发布任何东西；第二天的清单合并未处理的候选。14 天缓冲保证不断题 |

routine 状态：**已于 2026-11-24 建好**，每天 09:00 `Pacific/Auckland` 触发，结果发到 Grok Bot 和 Jeff 的聊天。流水线（P1）做好之前，它先积累候选街区和词库。

### 9.4 线索清单格式（`clue-mining/YYYY-MM-DD-线索清单.md`）

```markdown
# 线索清单 2026-11-30

## 结论
- 推荐街区：Napier 市中心（装饰艺术区）。理由：交叉点 14 个，4 个难度都能排下。
- 候选词 56 个，其中新闻词 6 个（新西兰 4、国际 2；经济 2、科技 2、体育 1、文化 1），有效期至 12-03。

## 候选街区
| 街区 | 城市 | 交叉点 | Easy/Medium/Hard/SH 可排词槽数 | OSM 抽取 | 备注 |
|---|---|---|---|---|---|

## 新闻词（重点审）
| # | 答案 | 新西兰/国际 | 类别 | 难度 | 提示草稿 | 知识卡要点 | 来源（链接 + 发布和访问日期） | 风险 |
|---|---|---|---|---|---|---|---|---|
| 1 | NVIDIA | 国际 | 科技 | hard | ... | ... | [媒体 2026-11-29](https://...) | 无 |

## 常规词
| # | 答案 | 类别 | 难度 | 提示草稿 | 知识卡要点 | 来源 | 图片（授权） |
|---|---|---|---|---|---|---|---|

## 不建议使用（附原因）
- （例：某词来自政治新闻 / 灾难新闻 / 一般 te reo 词汇，v1 不用）

## 需要 Jeff 决定
- ...
```

### 9.5 批准词库 JSON（`content/wordbank/approved/YYYY-MM-DD.json`）

```ts
export interface WordbankFile {
  date: string;                       // 批准日期
  approvedBy: 'jeff';
  approvedAt: string;                 // ISO
  neighbourhoods: {
    slug: string; suburb: string; city: string;
    plannedDate?: string;             // 计划排期日
    streetFacts: { street: string; fact: string; sources: SourceRef[] }[];   // 街名由来等
  }[];
  entries: WordbankEntry[];
}

export interface WordbankEntry {
  id: string;                         // "wb-2026-11-30-007"
  answer: string;                     // A–Z 大写；去掉空格和连字符
  display: string;                    // 显示形式，例 "Flat white"
  enumeration?: string;               // "4,5"
  language: 'en';                     // v1 只允许 'en'
  origin?: 'english' | 'maori_origin_nz_english';   // 后者必须在 nz_english_allowlist 里
  category: WordSource;
  news?: { scope: 'nz' | 'world'; topic: 'economy' | 'technology' | 'sport' | 'culture' | 'history' | 'other' };
  difficulty: Difficulty[];           // 可用的难度
  commonness: number;                 // wordfreq Zipf，或人工 1–7 覆盖
  clues: { style: ClueStyle; text: string; difficulty: Difficulty }[];
  card: Omit<KnowledgeCard, 'id' | 'mediaIds'> & { media: MediaCandidate[] };
  validFrom?: string; expiresAt?: string;          // 新闻词必填 expiresAt
  tags: string[];                     // "season:christmas"、"region:HKB"
  sensitivity: 'none' | 'review';
}

export interface MediaCandidate {
  sourceUrl: string; downloadUrl: string;
  creator: string; licence: string; licenceUrl?: string;
  commercialUseOk: boolean; attributionText: string; alt: string;
}
```

### 9.6 取材规则（Grok Bot 线索挖掘必须遵守）

1. **每条事实都要有来源 URL 和访问日期**；找不到来源就不写。不编造事实、数字、引语。
2. **知识卡正文自己改写**，1–3 句，不照抄。Wikipedia 文字是 CC BY-SA，照抄就要署名并相同方式共享，所以只写自己的话并附原文链接。新闻只写一句自己的概括 + 原文链接，不转载正文和图片。
3. **图片只用明确允许商业使用的授权**（例如 CC0、公有领域、CC BY、CC BY-SA；**不要 NC/ND**），并完整记录作者、授权、原始页面。授权不清楚的不要。新闻图片一律不用。
4. **新闻选题**：约 70% 新西兰、30% 国际；优先经济、科技、体育、文化、历史。**国内外政治类一律不用**（选举、政党、政客、政策争议、外交冲突等）。灾难、死亡、犯罪、战争、疾病、个人隐私等敏感或悲剧新闻不用。人物新闻只用中性、正面的商业、科技、体育、文化事件，提示里不评价人物。
5. **儿童友好**：因为允许 13 岁以下用户，词和卡片内容按全年龄标准把关（无脏话、无成人内容、无暴力细节）。
6. **不剧透地点**：解开前能看到的提示和卡片里不能出现当天的街区名、街名。
7. **v1 只用英文答案，用允许表处理毛利语来源词**（Jeff 已决定）：
   - 答案必须满足其一：(a) 是英文词典词（用英文词表核对，例如 `wordfreq` 英文词表加人工复核）；(b) 在 `content/wordbank/nz_english_allowlist.json` 里。
   - 允许表收录**日常 NZ English 里使用的毛利语来源专有名词和动植物名**，类别：`place`（例如 ROTORUA、TAUPO）、`fauna`（例如 TUI、KIWI、KEA）、`flora`（例如 KAURI、POHUTUKAWA）。每条写明类别、正式拼写（含长元音，例如 Taupō）、来源链接，**每条由 Jeff 批准一次**后才能用。
   - **一般 te reo 词汇不用**（例如 KORERO、MAHI、WHARE、TAMARIKI、TAONGA 这类）。像 KAI、HAKA、KUMARA、PAUA 这种日常借词是否收进允许表，逐个由 Jeff 决定（第 20 节）。
   - 网格里一律用不带长元音的 A–Z 字母；知识卡和揭晓时显示正式拼写。
   - 原型 `bank.py` 里的一般 te reo 词（例如 WHARE、HUI、TIKANGA、KORERO）要移出词库；地名和动植物名转进允许表等 Jeff 批准。
8. **新闻词有效期**：默认 3 天，过期后不能排进新题。
9. **一切发布动作都要 Jeff 明确批准**；批准是指 Jeff 本人在聊天里的回复，其他 bot 转述的不算。

### 9.7 交接给流水线

- 输入：`content/wordbank/approved/YYYY-MM-DD.json` + `master.jsonl`（历史批准词，常规词可复用）
- Grok Bot 运行流水线第 1–7 步，产出 `content/drafts/<dailySetId>/`（4 个难度）。
- Jeff 确认预览后，Grok Bot 执行第 8 步发布；发布前再跑一次 `validate`。

---

## 10. 后端设计（`apps/web`）

### 10.1 技术选择

- Next.js（App Router）Route Handlers，部署 Vercel。
- Neon Postgres + Drizzle ORM（类型安全、迁移简单）。
- Vercel Blob 存公开谜题 JSON（不含 secret）、图片、音频；文件名带 `contentHash`，可以长期缓存。
- 用户鉴权：自签 JWT（`jose` 库），30 天有效期 + refresh。
- 推送：Expo Push API（App 上报 Expo push token）。
- 分析：**PostHog**（Jeff 已决定）。App 用 `posthog-react-native`，后端事件用 `posthog-node`。不再自建 `events` 表。
- 时区：所有“当天”都用 `Pacific/Auckland`。海外用户也按新西兰日期（这是新西兰的游戏）。

### 10.2 数据库表（Drizzle 定义的概要）

```sql
users(id uuid pk, display_name text, display_name_status text check in ('ok','pending','rejected'),
      friend_code char(6) unique, avatar text, age_band text check in ('under13','13to17','adult','unknown'),
      analytics_consent bool default false,
      club_id uuid null, created_at, deleted_at null, is_banned bool default false,
      settings jsonb)                                  -- 大字号、字体、辅助模式等
auth_identities(id, user_id fk, provider text check in ('device','apple'), subject text, unique(provider,subject))
devices(id, user_id fk, device_id text unique, platform, app_version, last_seen_at)
push_tokens(id, user_id fk, token text unique, enabled bool, reminder_local_time time default '08:00')

puzzles(id text pk, kind, date date null, difficulty, theme_id, region_code,
        public_url text, content_hash text, puzzle_key bytea,      -- AES 钥匙
        answers jsonb, location_name text, status text check in ('draft','scheduled','live','retired'),
        created_at, published_at)
daily_sets(id text pk, date date unique, suburb text, city text, status text)   -- 每天 1 套 = 4 个难度
puzzle_schedule(date date, difficulty text check in ('easy','medium','hard','super_hard'),
      puzzle_id fk, daily_set_id fk, primary key(date, difficulty))

plays(id uuid pk, user_id fk, puzzle_id fk, started_at, completed_at null,
      active_seconds int, hints_used int, wrong_checks int, assisted bool,
      where_am_i_correct bool null, score int null, is_first bool, is_daily_on_day bool,
      suspicious bool default false, challenge_id null, payload jsonb)
streaks(user_id pk, current int, best int, last_day date, freezes_left int, freezes_reset_on date)
collection(user_id, puzzle_id, completed_on date, region_code, primary key(user_id,puzzle_id))
saved_cards(user_id, card_id text, puzzle_id, saved_at)

friendships(user_a uuid, user_b uuid, created_at, primary key(user_a,user_b))   -- user_a < user_b
friend_invites(code text pk, inviter_id, expires_at, used_by null)
friend_requests(id uuid pk, from_user, to_user, status text check in ('pending','accepted','declined','expired'),
      created_at, responded_at null, expires_at, unique(from_user, to_user))         -- 需要对方确认
blocks(blocker_id, blocked_id, created_at, primary key(blocker_id, blocked_id))
reports(id, reporter_id, target_type text, target_id text, reason text, note text, status, created_at)
challenges(id uuid pk, from_user, to_user, puzzle_id, message_preset text, status, created_at, expires_at)

clubs(id uuid pk, name, join_code unique, contact_email, created_at)              -- v1.1
nominations(id, user_id, suburb, city, note text, status, created_at)             -- v1.1
-- entitlements、packs、owned_packs、hint_ledger、purchases：见第 10.5 节（来自 RevenueCat webhook）
audit_log(id, actor, action, target, at, detail jsonb)
```

挑战消息只用**预设短语**（例如 “Beat my time!”），不做自由文字聊天，可以大幅减少 UGC 审核负担。

### 10.3 公开 API（`/api/v1`，除 auth 外都需要 `Authorization: Bearer <userJWT>`）

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/auth/anonymous` | `{deviceId}` → `{token, user}`；首次自动建匿名用户 |
| POST | `/auth/apple` | `{identityToken, nonce}` → 绑定到当前匿名用户，或登录已有账号 |
| POST | `/auth/refresh` | 换新 token |
| GET / PATCH | `/me` | 读取、修改昵称（过敏感词过滤，命中则 `pending` 待人工审核，期间榜上显示默认名）、头像、设置、年龄段 |
| DELETE | `/me` | **删除账号**：清空个人数据，成绩匿名化；需要 Apple 账号时同时调用 Apple 的 token revoke |
| GET | `/puzzles/daily?date=YYYY-MM-DD` | 只允许今天和明天（NZ）；返回当天 4 个难度 `[{difficulty, puzzleId, url, contentHash, key?}]`，`key` 只在当天返回 |
| GET | `/puzzles/archive?cursor=&difficulty=` | 往期列表；免费用户能看列表，可以玩最近 3 天（Jeff 已决定）；更早的需订阅 |
| GET | `/puzzles/{id}/key` | 取钥匙（有权限、且已到日期） |
| POST | `/plays` | `{puzzleId, challengeId?}` → `{playId, serverStartedAt}` |
| POST | `/plays/{playId}/complete` | `{entries, hintsUsed, wrongChecks, activeSeconds, assisted, whereAmIGuess?, solveEvents[]}` → `{score, breakdown, streak, rank}` |
| GET | `/leaderboards?scope=friends\|global\|club&period=daily\|weekly\|alltime&difficulty=easy\|medium\|hard\|super_hard\|all&date=` | 前 100 + 我的名次 |
| GET | `/me/stats` | streak、总分、点亮的街区、各难度完成数 |
| GET | `/me/collection` | 点亮新西兰地图数据 |
| GET / POST / DELETE | `/me/saved-cards` | 收藏册 |
| POST | `/friends/invites` | 生成邀请链接 |
| POST | `/friends/requests` | `{code}`（好友码或邀请码）→ 发出好友请求，等对方确认 |
| GET | `/friends/requests` | 收到和发出的待处理请求 |
| POST | `/friends/requests/{id}/accept` · `/decline` | 对方接受或拒绝；接受后写 `friendships` 并推送通知发起人 |
| GET | `/friends` | 好友列表 + 今日状态（是否完成、分数） |
| DELETE | `/friends/{userId}` | 删除好友 |
| GET | `/users/{id}/profile` | 仅好友可见：地图、streak、最近完成 |
| POST | `/blocks/{userId}` · DELETE | 拉黑 / 取消 |
| POST | `/reports` | `{targetType: 'user'\|'challenge'\|'puzzle', targetId, reason}` |
| POST | `/challenges` | `{toUserId, puzzleId, messagePreset}` |
| GET | `/challenges` | 收到和发出的挑战 |
| POST | `/challenges/{id}/decline` | 拒绝 |
| POST | `/push-tokens` | 上报 token、提醒时间 |
| POST | `/nominations` | 提名街区（v1.1） |
| POST | `/clubs/join` | `{joinCode}`（v1.1） |

### 10.4 Admin API（`/api/admin`，`Authorization: Bearer ADMIN_API_TOKEN`）

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | `/puzzles` | Body：`{puzzle: Puzzle（不含 secret 明文）, secretPlain: PuzzleSecret, puzzleKey}`；服务器用 zod 校验，把公开 JSON 上传 Blob，答案和钥匙存数据库。以 `id + contentHash` 幂等 |
| POST | `/puzzles/{id}/schedule` | `{date, difficulty, dailySetId}`；冲突返回 409；一天 4 个难度都排上才算这天就绪 |
| DELETE | `/puzzles/{id}/schedule` | 撤下（当天 live 的题需要 `force=true`） |
| GET | `/schedule?from=&to=` | 排期列表 |
| POST | `/media` | 上传图片/音频（multipart），返回 Blob URL |
| GET | `/stats?from=&to=` | 统计数据 |
| GET | `/reports?status=open` · PATCH `/reports/{id}` | 处理举报 |
| GET | `/plays/suspicious` · PATCH | 可疑成绩 |
| GET | `/nominations` | 导出提名（v1.1） |

所有 Admin 写操作写 `audit_log`。

### 10.5 订阅与应用内购买（RevenueCat）

> 价格是 Grok Bot 的**提议（proposed）**，等 Jeff 最终确认。下表价格都是 NZD、含 GST 的商店标价，以 App Store Connect 可选价位为准（需核实）。

| 产品 | 类型（Apple） | 产品 ID（建议） | 价格（proposed） | 内容 |
|---|---|---|---|---|
| Crossings Plus 月订阅 | Auto-renewable subscription | `crossings_plus_monthly` | NZ$4.99 / 月 | 3 天以前的完整往期（4 个难度）、周末公路旅行（v1.1）、今昔对比完整版（v1.1）、额外打卡保护、明信片插画 |
| Crossings Plus 年订阅 | Auto-renewable subscription（同一订阅组） | `crossings_plus_annual` | NZ$39.99 / 年 | 同上 |
| 首次订阅免费试用 | Introductory offer（free trial） | — | 7 天 | 只给第一次订阅的用户（Apple 按订阅组判断资格） |
| 主题题包 | **Non-consumable**（一次买断、永久拥有、可恢复） | `pack_<slug>`，例 `pack_wellington_10` | 例 NZ$2.99 / 10 道 | 一个城市或节日主题的 10 道题（例如 Wellington、Christmas） |
| 提示包 | **Consumable**（用完再买） | `hints_10` | 例 NZ$1.99 / 10 个 Hint | 额外 Hint（规则见下） |

**规则**

- **当天 4 道题全部免费**（Jeff 已决定）；最近 3 天的往期也免费。订阅只解锁 3 天以前的往期和额外内容。
- 订阅用户**不自动拥有**主题题包（题包单独卖）。是否让年订阅用户每季度送一个题包，见第 20 节剩余问题。
- **提示包规则**：
  - 每道题的免费 Hint 数 = 该难度的 `maxHints`（Easy 不限）。用完免费 Hint 后，可以用购买的 Hint 继续。
  - 用了购买的 Hint，这道题的成绩标为 “assisted”，不进普通排行榜（进 assisted 榜）。Hint 的扣分照常。这样不会“花钱买排名”。
  - Super Hard 题允许用购买的 Hint，但同样标 assisted。
- **恢复购买**：Profile → “Restore purchases” 调用 `Purchases.restorePurchases()`。订阅和主题题包（non-consumable）可恢复；提示包是消耗品，Apple 不恢复，所以 **Hint 余额存在服务器、跟账号走**（换设备登录后余额还在；纯匿名用户删除 App 会丢失余额，购买页要提示“登录 Apple 账号可保留余额”）。
- **13 岁以下**：进付费墙、买题包、买提示包前都要过家长验证（第 12.1 节）。
- 订阅说明页写清价格、周期、试用结束后自动扣费、如何取消（Apple 要求，3.1.2）。

**实现**

- App 端用 `react-native-purchases`。RevenueCat 里配置：entitlement `plus`（挂月、年订阅）；Offering `default`（月、年 + 试用）；题包和提示包作为单独产品。
- 服务器接收 `POST /api/webhooks/revenuecat`（校验 Authorization header），按事件类型更新数据库：
  - 订阅事件（例如 `INITIAL_PURCHASE`、`RENEWAL`、`CANCELLATION`、`EXPIRATION`）→ `entitlements`
  - 一次性购买事件（RevenueCat 的 `NON_RENEWING_PURCHASE`，事件名以 RevenueCat 文档为准，需核实）→ 按产品 ID 写 `owned_packs` 或给 `hint_ledger` 加余额
  - 用 RevenueCat 的 `transaction_id` 做幂等，同一笔交易只入账一次
- 服务器以数据库为准判断权限；App 端 SDK 状态只用于界面即时显示。

**数据模型（补充到 10.2）**

```sql
entitlements(user_id pk, is_subscriber bool, product_id, period text check in ('monthly','annual'),
      is_trial bool, expires_at, updated_at)                      -- 订阅
packs(id text pk, product_id text unique, title, theme, puzzle_ids text[], price_tier text,
      status text check in ('draft','live','retired'), created_at)  -- 主题题包（Grok Bot 生产，Admin API 上架）
owned_packs(user_id, pack_id, transaction_id text unique, purchased_at,
      primary key(user_id, pack_id))                              -- non-consumable，可恢复
hint_ledger(id bigserial pk, user_id, delta int, reason text check in ('purchase','use','refund','grant'),
      transaction_id text null unique, play_id uuid null, created_at)   -- consumable，余额 = sum(delta)
purchases(id bigserial pk, user_id, product_id, product_type text check in ('subscription','non_consumable','consumable'),
      transaction_id text unique, store text, price_local numeric, currency text, raw jsonb, created_at)  -- 审计
```

**相关接口（补充到 10.3）**

| 方法 | 路径 | 说明 |
|---|---|---|
| GET | `/me/entitlements` | `{plus: {active, period, isTrial, expiresAt}, packs: [packId], hintBalance}` |
| GET | `/packs` | 可购买的主题题包列表（含是否已拥有） |
| GET | `/packs/{id}/puzzles` | 已拥有才返回题目和钥匙 |
| POST | `/plays/{playId}/hints` | 使用 Hint：先扣免费额度，再扣 `hint_ledger`；返回剩余数和该题是否已变 assisted |
| POST | `/me/restore` | App 调完 RevenueCat restore 后通知服务器重新同步（服务器向 RevenueCat REST API 拉取该用户的购买记录） |

题包里的题 `kind` 为 `'pack'`（加入 4.2 的 `Puzzle.kind`），`date` 为 null，`packId` 指向所属题包。

---

## 11. App 设计（`apps/mobile`）

### 11.1 主要页面

| Tab / 页面 | 内容 |
|---|---|
| Today | 今天的 4 张难度卡片（Easy / Medium / Hard / Super Hard，各自显示状态、已用时间、分数），默认高亮上次选的难度；streak；“开始 / 继续”；最近 3 天入口 |
| Puzzle（全屏） | 地图（Skia）+ 当前提示条 + 大按钮键盘；顶部：Hint、Check、朗读、列表模式切换 |
| Map | 点亮新西兰全国地图；按大区进度；点一个点看街区明信片和知识卡 |
| Friends | 好友列表（今日完成情况）、好友榜/全体榜切换、挑战收件箱、加好友 |
| Profile | 统计、收藏册、昵称、设置（字号、高对比、字体、朗读、辅助模式、提醒时间）、订阅、About（显示 “Crossings by Vervia”、版本号）、署名与授权、隐私、删除账号 |
| Splash | “Crossings” 字标 + 下方小字 “by Vervia”（`expo-splash-screen` 静态图） |
| Parental gate | 13 岁以下用户打开外部链接、付费墙、分享前出现的家长验证（见第 12.1 节） |

### 11.2 渲染（Skia）

图层从下到上：
1. **Background**：羊皮纸纹理 + `background.roads`（按 `cls` 粗细）+ parks + water。
2. **Landmarks**：解开对应词后出现的小图标。
3. **Fog**：全屏深色层；用“擦除”混合模式（`BlendMode.DstOut`）沿已发现词的 `path` 画宽笔刷 + 模糊边缘，做成散雾效果。新解出一个词时，笔刷长度用 `reanimated` 共享值做 600–900ms 动画。
4. **Path highlight**：当前选中词的路线。
5. **Cells**：圆形格子 + 字母；共用格子加双圈；预填字母和 Hint 字母不同颜色（原型 `--hint` 色）。
6. **Labels**：街名遮罩标签（原型的放置算法：沿街道方向、避开格子）。

交互：
- 点格子选词（原型 `select()`）；同一格属于两个词时，再点一次切换方向。
- 双指缩放和拖动（`gesture-handler` 的 Pinch + Pan，和 Tap 同时识别）；选中词时自动缩放到能看清，保证格子在屏幕上 ≥ 44pt（参照 Apple 人机界面指南的最小点击区域）。
- 格子坐标 → 屏幕坐标用一个矩阵统一换算，点击检测在 JS 端做最近格子查找。

### 11.3 游戏逻辑（`src/game`，纯 TypeScript，可单测）

- 状态：`entries[cellId]`、`hinted[cellId]`、`solved[wordId]`、`wrongChecks`、`activeSeconds`、`currentWordId`、`cursor`（移植原型的 `st` 对象）。
- 操作：`type(letter)`、`backspace()`、`move(±1)`、`check()`、`hint()`、`select(wordId, index?)`。
- 发现规则：`discovered(word) = word === start || solved(word) || 与某个已解词共用格子`（原型逻辑）。
- 判断对错：`sha256(puzzleId:wordId:ANSWER) === answerHash`；Hint 需要字母时用解密后的 secret。
- 存档：每次操作后写 MMKV（键 `play:<puzzleId>`）；联网时把完成结果提交服务器，失败就排队重试。

### 11.4 无障碍（M1 必做）

- Skia 画布对 VoiceOver 基本不可见，所以必须提供**列表模式**：按词列出提示、长度、已填字母，用系统文本输入（支持听写）作答；迷雾进度用文字描述（“已发现 3/7 条街”）。
- 所有字号跟随 iOS Dynamic Type；提示文字最小 20pt（估计值，试点调）。
- 高对比主题；色盲友好（对错不只靠红绿，加图标）。
- 字体可选 Atkinson Hyperlegible、OpenDyslexic。
- 朗读提示和知识卡：`expo-speech`（系统 TTS，离线可用）。
- 动画可关闭（跟随“减少动态效果”设置）。
- 键盘：默认原型式大按钮键盘；可切换系统键盘。
- v1 只做 iPhone，竖屏为主（`ios.supportsTablet: false`；iPad 上会以 iPhone 兼容模式运行）。很多老年用户可能用 iPad（假设），iPad 适配放到 Later。

### 11.5 离线

- 每次打开 App 预取今天和明天的谜题 JSON 和图片（明天的钥匙第二天才拿到；离线时用缓存的今天钥匙玩今天的题）。
- 完成结果离线排队，联网后提交；streak 以服务器为准，但离线完成按完成时的本地 NZ 日期记（提交时附带，服务器做合理性检查）。

### 11.6 通知

- 每日提醒（默认 08:00 本地时间，可改或关闭）：“今天的街区已经出现”。用本地通知即可，不需要服务器。
- 服务器推送：好友挑战、挑战结果、（v1.1）提名被选中。
- 首次启动不立刻要通知权限；完成第一题后再问（提高同意率，也符合审核习惯）。

### 11.7 分享

- 完成后生成分享文字（沿用原型：🟩/🟨 每条街、Hint 数、用时、“Where were you today? 🔍”，不剧透地名）+ 可选分享图（迷雾揭开的地图，不显示地名和街名；页脚写 “Crossings · by Vervia” 和难度）。分享文字第一行改为 “Crossings #<编号> · <难度>”。
- 邀请链接附在分享文字后面，带来新用户可以直接加好友。

---

## 12. App Store 审核准备

| 条款（[App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)） | 我们的做法 |
|---|---|
| 4.2 最低功能 | 原生渲染的游戏、每天 4 个难度的内容、全国地图收集、好友和排行榜，不是网页套壳 |
| 2.1 完整性 | 提交前所有按钮可用；审核备注里说明玩法，给出测试账号（如需要）和当天题的提示 |
| 4.8 登录服务 | 只用匿名 + Sign in with Apple。若以后加 Google 等第三方登录，必须同时提供符合 4.8 要求的隐私登录选项（Sign in with Apple 满足） |
| 5.1.1(v) 删除账号 | 只要能建账号，App 内就要能删除账号（Profile → Delete account），不能只给邮件方式 |
| 5.1.1 / 5.1.2 隐私 | 隐私政策链接（App 内 + App Store Connect）；App Privacy 标签如实填写（含 PostHog 收集的使用数据）；不用 IDFA，不做跨 App 追踪，因此不需要 ATT 弹窗 |
| 1.2 用户生成内容 | 昵称和挑战属于 UGC：昵称过滤 + 人工审核队列、举报、拉黑、开发者联系方式、24 小时内处理举报的流程；挑战只用预设短语；好友需对方确认；自制谜题以后上线前再按 1.2 补全 |
| 3.1.1 应用内购买 | 订阅、主题题包、提示包都走 Apple IAP（RevenueCat）；不在 App 内引导外部付款；题包（non-consumable）和订阅可恢复购买；提示包余额存服务器 |
| 3.1.2 订阅 | 订阅必须持续提供价值（完整往期题库、周末公路旅行等），写清价格（月 NZ$4.99 / 年 NZ$39.99，proposed）、7 天试用结束后自动扣费、自动续费和取消方法 |
| 年龄分级 | 内容按全年龄把关；按 App Store Connect 当前的年龄分级问卷如实填写（Apple 2025 年调整过分级档位，以当时问卷为准，需核实），社交功能和外部链接要如实申报 |
| 儿童（1.3 / 5.1.4） | **允许 13 岁以下使用，但不进 Kids 分类**（Kids 分类不是必需的，Jeff 已决定）。产品面向所有年龄，不是“主要面向儿童”的 App；但仍按第 12.1 节对 13 岁以下用户做保护。5.1.4 对儿童数据的要求是否适用需核实 |
| 开发者账号 | 以 VERVIA LIMITED 组织身份注册 Apple Developer Program，需要 D-U-N-S 编号（需核实） |
| 名称 | App Store 名 “Crossings: NZ Street Crossword” 需在 App Store Connect 确认未被占用（第 0.1 节待办） |

### 12.1 13 岁以下用户的保护措施（Jeff 已决定允许 13 岁以下使用）

法律项目都标“需核实”，正式上架前建议请懂新西兰隐私法的人过目。

| 措施 | 做法 | 阶段 |
|---|---|---|
| 年龄段询问 | 首次启动用中性方式问出生年份（不预设答案、不暗示“选成年人才能玩”），只存年龄段 `age_band`，不存生日。可考虑 Apple 的 Declared Age Range API 代替自问（可用性和适用系统版本需核实） | M1 |
| 数据最少化 | 13 岁以下：不要求 Sign in with Apple（可选，家长决定）；不收集邮箱、通讯录、位置；昵称从预设词组里选（例如 “Brave Kea 42”），或自填但必须人工审核通过才显示 | M2 |
| 分析 | PostHog 对 13 岁以下用户**不调用 `identify`、不建人物档案**，只发匿名事件，不带任何个人标识；13 岁以上默认也只用随机 ID。是否需要家长同意后才发事件需核实，保守做法是 13 岁以下默认关闭分析 | M1 |
| 广告 | 全 App 不放行为定向广告（本来就不放广告） | 一直 |
| 家长验证（parental gate） | 13 岁以下用户打开外部链接（Wikipedia、新闻原文）、进入付费墙或购买、系统分享前，先过家长验证（例如让成人做一道简单的算术或按住确认），不能是孩子一看就会的 | M2（外部链接 M1 就要） |
| 社交 | 13 岁以下：好友只能通过邀请码 / 好友码加，必须对方确认；全体排行榜只显示预设昵称或已审核昵称；挑战只用预设短语 | M2 |
| 推送 | 13 岁以下不发营销类推送，只发每日提醒和好友挑战（可在设置里关） | M2 |
| 删除数据 | 家长可以在 App 里删除账号和数据（同 5.1.1(v) 流程），隐私政策写明联系方式 | M2 |
| 新西兰 | 遵守 Privacy Act 2020（[隐私专员办公室](https://www.privacy.org.nz/)），尤其是收集儿童信息时的“公平和合理”要求（需核实具体指引） | 一直 |
| 美国及其他地区（以后） | v1 只上新西兰区（Jeff 已决定），COPPA 暂不适用。**以后扩展到美国等地区时**，要先评估 COPPA（明知是 13 岁以下用户时可能需要可验证的家长同意，需核实）和当地法规 | 扩区前 |

**新西兰隐私法（全体用户）**：只收集必要数据（设备 ID、昵称、年龄段、成绩、可选 Apple ID、PostHog 匿名使用数据）；数据存放地区（Neon / Vercel / PostHog 的区域）在隐私政策写明。隐私政策和条款建议请专业人士过目（成本待估）。

---

## 13. 授权与署名

| 素材 | 要求 | 做法 |
|---|---|---|
| OpenStreetMap 数据 | ODbL；需要显示 “© OpenStreetMap contributors” 并链接到[版权页](https://www.openstreetmap.org/copyright)。若公开分发由 OSM 衍生的数据库，可能涉及相同方式共享义务 | 地图角落常驻署名；`/attributions` 页面；谜题 JSON 里的街道几何是否构成“衍生数据库”需核实（参见 [OSMF 社区准则](https://osmfoundation.org/wiki/Licence/Community_Guidelines)），保守做法是在网站上公开提供谜题几何数据并注明 ODbL |
| Wikipedia 文字 | CC BY-SA 4.0 | 不照抄，自己改写 + 链接原文 |
| Wikimedia Commons 图片 | 每张授权不同 | 只用允许商业使用的；App 里在图片下方显示 `attributionText`；`/attributions` 汇总 |
| DigitalNZ 图片 | 由原收藏机构决定权限 | 只用 API 标明可商业使用的；保存原始条目链接 |
| 新闻 | 版权属于媒体 | 只写一句自己的概括 + 链接，不转载文字和图片 |
| 多语言音频（Later） | 需授权 | v1 不做；以后做多语言版本时请母语者录制并签授权 |
| 字体 | Atkinson Hyperlegible、OpenDyslexic | 均为 SIL OFL（需核实所用版本），在 `/attributions` 列出 |

---

## 14. 收费模式

- **免费**：当天 4 道每日题（Jeff 已决定全部免费）、**最近 3 天**的往期、好友、排行榜、点亮地图、全部无障碍功能。**无障碍功能永远免费。**
- **订阅 Crossings Plus（价格 proposed，待 Jeff 最终确认）**：月付 NZ$4.99、年付 NZ$39.99，首次订阅 7 天免费试用。内容：3 天以前的完整往期题库（4 个难度）、周末公路旅行（v1.1）、今昔对比完整版（v1.1）、额外打卡保护、明信片插画。
- **一次性内购（proposed）**：
  - 主题题包（non-consumable）：例 NZ$2.99 / 10 道，一个城市或节日一包（例如 Wellington、Christmas）。由 Grok Bot 用同一流水线生产，经 Jeff 批准上架。
  - 提示包（consumable）：例 NZ$1.99 / 10 个 Hint。用购买的 Hint 的成绩标 assisted，不影响普通排行榜的公平。
- 实现、数据模型和恢复购买见第 10.5 节。
- **不放打扰式广告，也不放行为定向广告**（不弹插屏、不放视频广告）。以后如果需要，可考虑和本地机构合作的赞助主题题（例如博物馆、图书馆），明确标注。
- 13 岁以下用户进付费墙或购买前要过家长验证（第 12.1 节）。
- 退休村/俱乐部团体授权：Later，先验证需求。

---

## 15. 数据分析与留存指标

事件统一发到 **PostHog**（Jeff 已决定；13 岁以下用户只发匿名事件，规则见第 12.1 节）。项目区域（US 或 EU 云）在隐私政策写明。事件清单：

`app_open`、`puzzle_start{difficulty}`、`difficulty_selected{difficulty}`、`word_solved{difficulty, hints, seconds}`、`hint_used`、`check_wrong`、`card_opened{kind}`、`card_link_tapped`、`puzzle_complete{score, seconds, assisted}`、`share_tapped`、`where_am_i_guess{correct}`、`friend_request_sent`、`friend_request_accepted`、`nickname_rejected`、`challenge_sent/accepted/completed`、`paywall_view`、`trial_start`、`subscribe{period}`、`pack_purchase{packId}`、`hint_pack_purchase`、`purchased_hint_used`、`restore_purchases`、`a11y_setting_changed{setting}`、`notification_opened`。

| 指标 | 定义 | 目标 |
|---|---|---|
| D1 / D7 / D30 留存 | 首次打开后第 1/7/30 天又打开并开始一题的比例 | 试点后定基线，再定目标（现在不编数字） |
| 完成率 | `puzzle_complete / puzzle_start`，按难度 | 用来调难度：Easy 应明显高于 Hard |
| 平均用时、Hint 数 | 按难度 | 校准 `targetSeconds` 和难度规则 |
| Streak 分布 | 当前 streak ≥ 3 / 7 / 30 的用户比例 | 回访健康度 |
| 分享率 | `share_tapped / puzzle_complete` | 传播力 |
| 好友密度 | 每个活跃用户的好友数中位数 | 社交功能是否有效 |
| 难度分布 | 每天各难度的开始数、完成数；每人每天平均玩几道 | 验证“每天 4 道”是否值得，决定内容投入 |
| 付费转化 | 试用开始率、试用转付费率、`subscribe / 活跃用户`、题包和提示包购买率 | M2 之后 |
| 无障碍使用 | 开启大字号/朗读/列表模式的比例 | 验证老人需求 |

崩溃和错误：Sentry（`@sentry/react-native` + Next.js）。

---

## 16. 测试计划

### 16.1 自动化

- `packages/scoring`、`src/game`：单元测试（Vitest / Jest），覆盖计分、发现规则、Hint、Check、存档恢复。
- `packages/puzzle-schema`：用流水线产出的真实谜题做 zod 和 JSON Schema 双重校验；CI 检查 TS 类型和 JSON Schema 一致。
- `pipeline`：pytest，覆盖交叉一致性、连通性、署名完整性、剧透检查。
- API：集成测试（测试数据库用 Neon 分支）。
- App 端到端：Maestro 自动解完一题（类似原型 `test.py` 的做法）。

### 16.2 试玩与试点（M1 TestFlight）

目前还没有试点机构（Jeff 2026-11-24）。分两步：

1. **亲友内测（先做）**：通过 TestFlight 邀请 Jeff 的家人朋友，最好包括几位 60 岁以上的长辈和 1–2 个孩子（家长同意）。玩 2 周，重点看安装是否顺利、字号和键盘、4 个难度是否分得开。
2. **机构试点（同时寻找）**：联系退休村、图书馆、Probus、U3A 等老年俱乐部（Jeff 负责）；找到后按下面做：
   - **对象**：1–2 个老年人小组 + 若干家庭成员。需事先说明收集哪些数据并取得同意。
   - **方式**：第一周现场观察 1 次（看他们在哪里卡住、字号够不够、键盘好不好按），之后自由玩 2–3 周。
   - **TestFlight 门槛**：老人自己安装 TestFlight 可能有困难，准备一页图文说明，或现场帮装。

- **收集**：各难度完成率、用时、Hint、回访天数（PostHog 匿名统计）+ 简短问卷（是否好玩、难度、对月付 NZ$4.99 / 年付 NZ$39.99 和题包价格的接受度、最喜欢的功能）。
- **决定点**：试玩结束后决定难度参数、字号默认值、最终价格、M2 功能顺序。

---

## 17. 路线图与工期估计

> 估计前提：Jeff 一人，用 Cursor 写大部分代码，每周投入约 15–20 小时（假设）。以下全部是粗略估计，第一次做 Expo + Skia 的话可能偏乐观。

| 阶段 | 内容 | 验收标准 | 估计 |
|---|---|---|---|
| **P0 仓库与契约** | monorepo、`puzzle-schema`（TS + zod + JSON Schema 导出）、CI | `pnpm build` 通过；把原型 Ponsonby 数据转成新 schema 的样例 JSON 能通过 zod 校验 | 3–5 天 |
| **P1 流水线迁移**（Grok Bot 这边可并行） | 把原型 Python 改成 `kiwi` 命令行；输出新 schema；`validate`、`preview`；secret 加密 | 一条命令从 OSM 为 Ponsonby 和另外 2 个街区各生成 4 个难度的合格 JSON；校验报告全绿；禁用词表生效（无 te reo 答案） | 1.5–2.5 周 |
| **P2 后端最小版** | Neon + Drizzle、匿名 auth、`/puzzles/daily`、`/puzzles/{id}/key`、Admin `POST /puzzles` 和 4 难度排期、Blob 上传、PostHog 服务端接入、`/admin` Schedule 页 | 流水线 `publish` 能把一套 4 道题推上去；`curl` 能按日期拿到 4 个难度；明天的钥匙拿不到 | 1–2 周 |
| **P3 App 核心玩法** | Expo 项目（仅 iPhone）、启动画面 “by Vervia”、Today 页 4 张难度卡、Skia 六层渲染、迷雾动画、手势、选词、键盘、Hint/Check、知识卡、地名揭晓、分享、MMKV 存档、离线缓存 | 真机上 4 个难度都能完整玩完，帧率流畅（目标 60fps，估计）；杀掉 App 重开进度不丢；飞行模式能玩缓存的题 | 3–4 周 |
| **P4 无障碍与试点打磨** | 列表模式、Dynamic Type、高对比、字体、朗读、本地提醒、本地 streak、年龄段询问、外部链接的家长验证、PostHog（13 岁以下匿名/关闭）、隐私页、OSM 署名、Sentry | VoiceOver 下能独立完成一题；最大字号下界面不重叠 | 1–2 周 |
| **M1 里程碑** | TestFlight 亲友内测（之后机构试点） | 连续 14 天每天 4 道题；内测用户能自己完成安装和每日游戏 | — |
| **P5 账号与计分** | Sign in with Apple、删除账号、`/plays` 计分、服务器 streak、分难度排行数据、点亮地图、收藏册、新闻卡、昵称（过滤 + 审核队列）、13 岁以下数据最少化 | 换设备登录后成绩和 streak 保留；改包伪造分数无效；删除账号后数据清除 | 2 周 |
| **P6 社交** | 好友码、邀请链接（Universal Link）、好友请求和确认、好友主页、挑战、好友榜和全体榜（分难度 + 合计）、举报和拉黑、推送 | 两台测试机发请求、对方确认后成为好友、发挑战、看对比；被拉黑用户看不到我的信息 | 2–3 周 |
| **P7 订阅与上架** | RevenueCat：月/年订阅 + 7 天试用、主题题包（non-consumable）、提示包（consumable，服务器余额）、付费墙（13 岁以下先过家长验证）、往期题库（免费 3 天）、恢复购买、只勾新西兰区、App Store 资料（确认商店名可用、副标题、截图、隐私标签、年龄分级、审核备注） | 沙盒里订阅、试用、题包、提示包购买都成功；换设备登录后订阅、题包、Hint 余额都在；同一交易不重复入账；审核清单（第 12 节）逐项打勾；提交审核 | 1.5–2.5 周 |
| **M2 里程碑** | App Store 上架 v1.0 | 审核通过 | — |
| **v1.1** | 第 7.2 节标 v1.1 的功能，按试点反馈排序 | 每项单独验收 | 每项 3 天–2 周 |

合计：M1 约 6–9 周，M2 再加约 8–10 周（估计；比 v1.0 计划多出的是儿童保护、好友确认、一次性内购和服务器 Hint 余额）。内容生产（Grok Bot 线索挖掘 + Jeff 审核）从 P1 开始并行，目标是 M1 前积累至少 14 天 × 4 难度 = 56 道题。

---

## 18. 风险与对策

| 风险 | 影响 | 对策 |
|---|---|---|
| 真实街道凑不出好填字（太乱或交叉太少） | 每天出题困难 | `score-area` 先筛；允许只用街区的一部分；储备 ≥ 14 天 |
| 内容生产吃掉 Jeff 太多时间（每天 4 道，审核量是单题的 4 倍） | 断更 | Grok Bot 承担挖掘、生成、校验；Jeff 每天只做一次打包确认；常规词可一次批几天；新闻词集中在 Medium 以上 |
| 4 个难度共用一个地点，先玩一个就知道地点 | 其他难度少了悬念 | “今天我在哪”奖励只给当天第一个完成的版本；不同难度用不同的街道子集和词 |
| 13 岁以下用户的合规要求理解有误 | 审核被拒或法律风险 | 第 12.1 节保守做法；只上新西兰区可降低范围；上架前请人核实 |
| 新西兰市场小，老人难触达 | 增长慢 | 线下渠道（退休村、图书馆、俱乐部）+ 家庭分享；同时面向新移民、游客、家庭（祖孙同玩）（假设，需验证） |
| Skia 学习曲线、性能 | 拖慢 P3 | 先做静态渲染，再加迷雾动画；路径点数用 RDP 简化（原型 `rdp()`） |
| VoiceOver 无法用画布 | 无障碍不合格 | 列表模式作为一等功能（M1） |
| 图片或文字授权出错 | 下架或侵权 | 授权字段强制校验；不确定就不用 |
| 新闻词碰到敏感事件或政治 | 口碑受损 | 取材规则第 9.6 节第 4 条（不用政治、悲剧新闻）+ Jeff 批准 + 新闻词有效期 |
| 文化敏感（地名、历史话题） | 冒犯 | 一般 te reo 词汇不做答案；毛利语来源地名和动植物名只用允许表里 Jeff 批准过的；显示正式拼写；历史卡片有来源并人工审核 |
| 卖提示被认为“花钱买排名” | 口碑受损 | 购买的 Hint 一律标 assisted，不进普通榜 |
| D-U-N-S / 组织账号办理慢 | 延误上架 | 尽早申请；TestFlight 内测前就要有开发者账号 |
| OSM ODbL 义务理解有误 | 法律风险 | 保守做法：公开谜题几何数据并标 ODbL；需要时咨询 |
| 作弊刷榜 | 排行榜失去意义 | 第 6.4 节；全体榜只显示可信成绩 |
| 审核被拒（4.2、1.2 等） | 延期 | 第 12 节清单；挑战只用预设短语，减少 UGC |
| Admin token 泄露 | 被人乱发题 | token 只存 Vercel 和 box `.env`；可随时轮换；Admin 写操作有审计日志 |

---

## 19. 怎样用这份计划驱动 Cursor

### 19.1 总原则

- 一次只做一个阶段（P0 → P7）。每个阶段开一个新的 Cursor 对话（或 Agent 任务），把本文件放进仓库 `docs/DEV-PLAN.md`，提示里引用对应章节。
- 先让 Cursor 写**计划和文件清单**，你确认后再写代码；每阶段结束让 Cursor 对照“验收标准”自测并列出未完成项。
- 契约优先：`packages/puzzle-schema` 一旦定稿，改动要同时改 TS、zod、JSON Schema 和流水线，并升级 `schemaVersion`。
- 在仓库根目录放 `.cursor/rules/`（或 `AGENTS.md`）：写明技术栈、目录约定、“产品名 Crossings、卖家 Vervia”、“v1 只做 iPhone、只上新西兰区、只用英文答案（毛利语来源词走允许表）”、“每天 4 个难度”、“不要在 App 里生成谜题”、“时区一律 Pacific/Auckland”、“所有知识卡必须有来源”、“13 岁以下用户不发带标识的分析事件”。

### 19.2 建议的提示顺序

1. **P0**：“阅读 docs/DEV-PLAN.md 第 3、4 节。用 pnpm + Turborepo 建 monorepo 骨架；实现 `packages/puzzle-schema`（TS 类型、zod schema、脚本导出 JSON Schema 到 `pipeline/schemas/puzzle.schema.json`）；加 CI。附上 `docs/sample-ponsonby.json` 并写测试验证它。”
   - 样例 JSON 由 Grok Bot 用原型数据转换后提供。
2. **P1**（可交给 Grok Bot 做，或 Cursor 写后 Grok Bot 运行）：“阅读第 8.2 节和原型 Python 文件，把它们重构为 `pipeline/kiwi_pipeline` 包和 `kiwi` 命令行……”
3. **P2**：“阅读第 10 节。在 `apps/web` 建 Next.js 项目，Drizzle + Neon，先实现 10.2 里 users、devices、auth_identities、puzzles、daily_sets、puzzle_schedule 表，和 10.3/10.4 里标 P2 的接口……”
4. **P3**：“阅读第 11.2、11.3 节和 `docs/prototype/template.html`。在 `apps/mobile` 实现 `src/game`（纯逻辑 + 单测），再实现 Skia 渲染……”分三次提示：①逻辑和单测 ②静态渲染和手势 ③迷雾动画、知识卡、分享。
5. **P4**：“阅读第 11.4–11.6 节，实现无障碍列表模式……”
6. **P5–P7**：按第 17 节表格逐个阶段。

### 19.3 交给 Cursor 时附上的文件

- `docs/DEV-PLAN.md`（本文件）
- `docs/prototype/`：原型的 `template.html`、`build.py`、`solve.py`、`solve2.py`、`bank.py`、`geo.py`、截图（`phone-*.png`、`desktop-*.png`）
- `docs/sample-ponsonby.json`（新 schema 样例，Grok Bot 生成）

---

## 20. Jeff 的决定（2026-11-24）与剩余问题

### 20.1 已决定（原开放问题，已关闭）

| # | 原问题 | 决定 | 影响的章节 |
|---|---|---|---|
| 1 | App 名称 | ✅ 产品名 **Crossings**；开发者/卖家 **VERVIA LIMITED**（组织账号，需 D-U-N-S）；商店名 “Crossings: NZ Street Crossword”；主屏幕名 “Crossings”；启动画面、About、分享图页脚显示 “by Vervia”。待办：在 App Store Connect 确认名字可用 | 0.1、11.1、11.7、12 |
| 2 | 难度安排 | ✅ 每天 4 道（Easy / Medium / Hard / Super Hard），用户自选；不按星期轮换 | 4、5、6、8、9、10、11 |
| 3 | 订阅价格、免费范围 | ✅ 当天 4 道全部免费，最近 3 天免费；价格 **proposed**：月 NZ$4.99、年 NZ$39.99、首订 7 天试用，另有主题题包和提示包一次性内购（待 Jeff 最终确认价格） | 10.5、14 |
| 4 | 加好友是否需确认 | ✅ 需要对方确认 | 7.1、10.2、10.3 |
| 5 | 排行榜显示名 | ✅ 显示用户自选昵称（带过滤和人工审核） | 6.3、10.3、12.1 |
| 6 | 分析工具 | ✅ PostHog | 10.1、15、12.1 |
| 7 | 13 岁以下 | ✅ 允许；不进 Kids 分类，按第 12.1 节做保护 | 12、12.1 |
| 8 | te reo 内容 | ✅ 主打英文；一般 te reo 词汇不做答案；日常 NZ English 的毛利语来源地名和动植物名（ROTORUA、TUI、KIWI）可以，走允许表；多语言以后再做 | 4.2、4.4、7、9.6 |
| 9 | 线索挖掘渠道 | ✅ 不另建 bot，由 Grok Bot 每天 09:00（NZ）写 `/workspace/kiwi-crossword/clue-mining/YYYY-MM-DD-线索清单.md` 并在 Grok Bot 聊天里讨论；批准后 Grok Bot 生成谜题数据；routine 已于 2026-11-24 建好 | 2、8、9 |
| 10 | 试点机构 | ✅ 暂时没有；先做亲友 TestFlight 内测，同时寻找机构 | 16.2 |
| 11 | 平台 | ✅ v1 只做 iPhone | 0、3、11.4 |
| 12 | 新闻词范围 | ✅ 约 70% 新西兰、30% 国际；优先经济、科技、体育、文化、历史；国内外政治都不用；回避悲剧和敏感新闻 | 9 |
| 13 | 上架地区 | ✅ v1 只上新西兰区；COPPA 等到以后扩区时再评估 | 0.1、12.1 |
| 14 | 常规词批量审批 | ✅ 常规词可一次批几天；每天重点审新闻词和街区 | 9.2 |
| 15 | 09:00 routine | ✅ 已于 2026-11-24 建好 | 9.3 |

### 20.2 剩余问题（需要 Jeff 决定）

1. **最终确认价格**：月 NZ$4.99、年 NZ$39.99、7 天试用、题包 NZ$2.99 / 10 道、提示包 NZ$1.99 / 10 个，这套提议是否照用？
2. **订阅和题包的关系**：年订阅用户要不要定期送题包（例如每季度一个）？还是题包完全单卖？
3. **哪些日常毛利语借词进允许表**：KAI、HAKA、KUMARA、PAUA 这类（不是地名、不是动植物名）算不算 “everyday NZ English”？计划默认逐个由你批准，未批准前不用。
4. **App Store 副标题**和备选商店名（如果 “Crossings: NZ Street Crossword” 被占用）。
5. **D-U-N-S 编号**：VERVIA LIMITED 是否已经有？没有的话要尽早申请（办理时间需核实），组织账号要在 TestFlight 内测前办好。
6. **域名和 Bundle ID**：邀请链接、隐私政策、Universal Link 要用的域名（例如 vervia 相关域名）；Bundle ID 用 `nz.vervia.crossings` 还是 `com.vervia.crossings`？
7. **13 岁以下的分析**：默认关闭 PostHog，还是匿名开启？（计划默认关闭，更保守。）
8. **隐私政策和条款**：是否请专业人士审核（有成本）？
