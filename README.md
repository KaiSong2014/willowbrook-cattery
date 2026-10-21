# Willowbrook 猫舍 · 单页展示

一个可通过滚动探索的猫舍静态落地页，包含开场逐帧动画、猫咪明信片与展览、到访地图、菜单和营业信息。

## 本地预览

在项目目录运行 `python -m http.server 8765`，然后打开 `http://localhost:8765/`。

## 统一资料与模式切换

经营资料只编辑 `site-config.js`。`mode: 'demo'` 使用演示资料；改为 `official` 使用独立的正式资料。正式资料不继承演示菜单或地图，空值显示待确认。无效模式也不加载演示资料。切换需要修改配置并发布，访客不能通过网址参数切换。

- `address`、`hours`、`contact`：文字或 null。
- `map`：null 或 `{ label, latitude, longitude }`；坐标使用数值。未填写或无效时不加载地图。
- `menu`：分类数组，每类包含 title、english、items；每项包含 name、english、price、allergens（过敏原说明）。price 为非负数，缺失则显示待确认。
- `booking.status`：演示模式下 `preview` 开启本页预览；其他值全部关闭。正式资料模式始终关闭在线收集，即使误设为 preview 也不会开启。`booking.instructions` 可填写经确认的预约说明，默认待公布。

当前没有预约接口，不发送、保存输入，不显示提交成功。关闭后重新打开会清空输入及结果。演示表单请勿输入真实联系方式。猫咪档案仍明确标为示例，不受经营资料模式切换影响。

## 构建与发布

```bash
python scripts/build_pages.py
# 可选：生成离线发布包
python scripts/package_pages.py
```

`docs/` 是生成结果，不应单独编辑。GitHub Actions 在 main 上的源码变更后直接运行构建并发布 docs，避免 site.zip 未同步导致资料不一致。仓库旧 site.zip 仅为历史包，重新运行打包命令后才会更新；部署不再读取它。

## 验证

数据逻辑回归：`npm install --no-save jsdom` 后运行 `node scripts/test_data.cjs`。演示、正式、无效模式及填入测试资料的四组检查已通过；语法与构建检查通过。本次环境 Chromium 下载失败，以下真实浏览器测试尚未执行，视觉与滚动效果需继续验收。

```bash
npm install --no-save playwright
npx playwright install chromium
node scripts/test_site.cjs
```

回归覆盖桌面/手机、演示/正式/无效模式、正式资料填入、地址与时间重复位置一致、全部预约入口、预览无提交、正式模式表单禁用、地图空值及零坐标、菜单文字转义。外部资源请求在测试中阻断，地图服务在线可用性不属于此测试。

公开预览：[Willowbrook 猫舍](https://kaisong2014.github.io/willowbrook-cattery/)。
