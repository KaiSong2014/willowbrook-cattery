# Willowbrook 猫舍 · 单页展示

一个可通过滚动探索的猫舍静态落地页，包含开场逐帧动画、猫咪明信片与展览、到访地图、菜单和营业信息。

## 本地预览

在项目目录运行 `python -m http.server 8765`，然后打开 `http://localhost:8765/`。

## 更新发布文件

修改 `index.html`、`styles.css`、`script.js` 或 `assets/` 后，运行：

```bash
python scripts/build_pages.py
python scripts/package_pages.py
```

`docs/` 是从源文件生成的静态站点，`site.zip` 是上传到 GitHub 的发布包。仓库使用 `.github/workflows/deploy.yml` 自动解包并部署到 GitHub Pages；更新 `site.zip` 后会自动重新发布。原始视频及设计草稿留在本地，不随网站上传。

公开预览：[Willowbrook 猫舍](https://kaisong2014.github.io/willowbrook-cattery/)。

地图中的北京朝阳区为示意位置，并非猫舍真实地址。正式对外使用前请更新门店资料。
