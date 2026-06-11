# BrainTrain 微信小程序

基于 [Taro 4.x](https://taro.zone/) 构建的脑力训练微信小程序，包含 12 款认知训练游戏。

## 项目结构

```
weapp/
├── config/index.ts          # Taro 编译配置 (webpack5 + 持久化缓存)
├── project.config.json      # 微信小程序项目配置
├── src/
│   ├── app.tsx              # App 入口
│   ├── app.config.ts        # 全局配置 (16页路由 + 4-tab导航)
│   ├── app.scss             # 全局样式 & CSS 变量
│   ├── engine/              # 12 款游戏引擎 (纯 TypeScript)
│   ├── stores/              # Zustand 状态管理
│   ├── hooks/               # 自定义 Hooks (useTimer, useFeedback 等)
│   ├── utils/               # Storage 封装 + Supabase 云同步
│   ├── components/          # 共享 UI 组件 + 数独专用组件
│   ├── i18n/                # 国际化 (zh-CN / en)
│   └── pages/               # 16 个页面
└── dist/                    # 编译产物 (在微信开发者工具中打开此目录)
```

## 快速开始

### 环境要求
- Node.js >= 18
- npm >= 9
- 微信开发者工具 ([下载](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html))

### 安装 & 编译

```bash
cd weapp
npm install
npm run build:weapp
```

编译产物输出到 `dist/` 目录。

### 预览

1. 打开**微信开发者工具**
2. 选择**导入项目**，目录指向 `weapp/dist/`
3. 填写 AppID（或使用测试号）
4. 点击确定即可预览

### 开发模式 (热更新)

```bash
npm run dev:weapp
```

在微信开发者工具中打开 `weapp/dist/`，修改源码后自动编译刷新。

## 游戏列表

| 游戏 | 说明 | 难度 |
|------|------|------|
| 数独 | 经典 9x9 宫格逻辑游戏，4 档难度 + 每日挑战 | 高 |
| CPS 点击测试 | 1s/3s/5s/10s 四阶段极速点击 | 低 |
| 反应速度 | 5 轮随机延迟视觉反应测试 | 低 |
| 十秒挑战 | 凭直觉估算 10 秒时长 | 低 |
| 舒尔特方格 | 5x5 数字网格注意力训练 | 中 |
| 斯特鲁普测试 | 20 轮颜色词干扰抑制控制测试 | 中 |
| 记忆翻牌 | 4x4 卡片配对记忆训练 (3 种主题) | 高 |
| N-Back 测试 | 双流工作记忆训练 (1-4 Back) | 高 |
| SBTI 人格测试 | 20 题认知风格评估 | 低 |
| 番茄钟 | 25/5/15 分钟专注计时器 | 中 |
| 呼吸练习 | 引导式深呼吸 (3 种模式) | 低 |
| 青蛙跳跃 | 序列记忆复现游戏 | 中 |

## 数据存储

- **本地存储**: 使用微信 Storage API，数据存储在本机
- **云同步**: 可选对接 Supabase，通过 HTTP REST API 上传游戏记录和拉取排行榜（best-effort）

### 启用云同步

在 `src/utils/supabase.ts` 中修改：

```ts
const supabaseUrl = 'https://your-project.supabase.co';
const supabaseKey = 'your-anon-key';
```

并在微信公众平台后台将域名加入 **request 合法域名**。

## 设计系统

- **品牌色**: `#229CF8` (蓝色)
- **背景**: `#F5F7FA` (浅灰)
- **卡片**: `#FFFFFF` 白底 + 阴影
- **文字**: `#1A1A2E` (主), `#64748B` (次), `#94A3B8` (辅助)
- **圆角**: 8px / 14px / 20px

## 技术栈

Taro 4.x · React 18 · TypeScript · Zustand · i18next · webpack5
