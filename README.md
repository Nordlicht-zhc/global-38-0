# Global 38-0｜全球全明星赛季

一款支持中英文切换的足球选秀与赛季模拟游戏。从不同赛季、不同俱乐部的阵容中挑选球员，组建属于你的跨时代首发十一人，调整阵型、聘请教练并运作转会，争夺联赛、国内杯赛与欧洲赛事冠军。

**[在线游玩](https://nordlicht-zhc.github.io/global-38-0/) · [下载 Windows 便携版](https://github.com/Nordlicht-zhc/global-38-0/releases/latest)**

## 游戏特色

- **跨时代选秀**：分别抽取赛季与俱乐部，再选择适合阵容的球员；支持赛季范围、联赛范围、阵型和难度设置，并识别跨赛季重复球员。
- **完整赛事体验**：模拟五大联赛、国内杯赛和欧洲赛事，通过积分榜、比赛结果和球员统计回顾球队表现。不同联赛按各自赛制安排比赛。
- **教练与转会**：选择不同风格的教练，使用弱项补强、自由签约、盲盒和截止日报价等转会机制；王朝模式还包含租借与赛季末引援。
- **长期目标**：通过成就与历史战绩记录球队成长，也可以体验草根奇迹、铁血经理、时空旅人、环球更衣室、防守大师和俱乐部巅峰等挑战。

## 三种游戏模式

**经典模式**适合单赛季体验：完成选秀、组建球队并挑战冠军。**挑战模式**在基础玩法上增加阵容或成绩目标，让每次组队有不同取舍。**王朝模式**提供“三级征途”生涯，保留阵容并跨赛季经营，通过升降级、转会和冠军目标推动球队成长。

普通模式与王朝模式各有一份进行中的存档，可以交替游玩；挑战模式与普通模式共用档案槽。新建同类游戏会更新对应档案，建议先确认是否需要继续已有进度。

## 存档与账号

游戏默认使用本地存档，无需注册即可游玩。同一浏览器、同一站点下可以继续已有进度；清除站点数据或更换设备前，请留意存档是否已同步。

可选的 Supabase 在线账号提供跨设备云存档，同步普通与王朝档案、历史记录和成就。历史赛果明细在本地和云端均最多保留每份赛果的最新 30 场，积分与球员统计等其他字段继续保留。云同步需要网络连接。

## 本地运行

浏览器版使用原生 HTML、CSS 和 JavaScript，不需要安装 npm 依赖，也没有构建步骤。安装 Python 后，在项目根目录启动静态服务器：

```powershell
git clone https://github.com/Nordlicht-zhc/global-38-0.git
cd global-38-0
python -m http.server 8000
```

随后访问 [本地游戏页面](http://127.0.0.1:8000/global%2038-0.html)。建议通过 HTTP 访问，以便正常加载按需读取的历史赛季数据。

Windows 用户也可以从 Releases 下载便携版 EXE，直接运行；若系统缺少 Microsoft Edge WebView2 Runtime，需要先安装该运行时。桌面端包装与构建产物单独管理，源码仓库不包含 `desktop/` 目录。

## 项目结构

| 路径 | 用途 |
| --- | --- |
| `global 38-0.html`、`index.html` | 游戏入口与首页跳转 |
| `src/app.js` | 界面交互、选秀、转会与赛事流程 |
| `src/simulation-core.js` | 带种子的联赛模拟逻辑 |
| `src/storage.js`、`src/cloud-*.js` | 本地存储与云存档集成 |
| `src/big-five*.js`、`src/season-*.js` | 俱乐部、球员、赛季数据与加载逻辑 |
| `history-data/` | 按赛季拆分、按需加载的历史数据 |
| `styles.css` | 页面布局、主题与动画 |
| `scripts/` | 数据校验、回归检查、平衡模拟与数据生成工具 |
| `supabase/`、`docs/` | 云端数据库初始化 SQL 与配置说明 |
| `source-data/`、`archive/` | 数据生成输入与退役参考代码 |

## 开发与验证

使用 Node.js 从项目根目录执行与改动相关的检查，例如：

```powershell
node --check src/app.js
node scripts/validate-data.js
node scripts/random-test.js
node scripts/season-loader-test.js
node scripts/cloud-history-limit-test.js
node scripts/dynasty-tier-test.js
git diff --check
```

修改交互时，请同时检查中文和英文界面。修改数据时，请核对球队 ID、球员身份、阵容完整性及赛季加载；游戏中的评分与模拟结果属于玩法模型，不代表真实比赛预测。

自行部署云存档请参阅 [云存档配置说明](docs/CLOUD_SETUP.md)。前端仅使用公开的项目地址与 publishable key；服务端密钥和数据库密码不得写入客户端或提交到仓库。贡献代码前请阅读 [仓库贡献指南](AGENTS.md)。
