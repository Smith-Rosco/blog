# 09_Blog

Hexo 6.3 博客站点源码（`butterfly` 4.8.1 主题）。线上地址：<https://smith-rosco.github.io/blog/>

## 仓库结构（重要）

- **`master` = 源码**（本目录），远端 <https://github.com/Smith-Rosco/blog>
- **`main` = 构建产物**，GitHub Pages 从 `main` 发布。不要手动往 `main` 放源码，下次 `npm run deploy` 会覆盖它
- `public/`、`node_modules/`、`db.json`、`.deploy_git/` 不入库

## 跑起来

```bash
npm install
npm run server      # 本地预览 http://localhost:4000
npm run build       # 生成到 public/
npm run check       # 检查产物：本机路径 / 旧域名 / 站内死链，有问题退出码 1
npm run deploy      # 等价 hexo generate + check + hexo deploy
```

`npm run deploy` 会自动先跑 `predeploy`（generate + check）。**别用 `npx hexo deploy`**，那会绕过检查。

## 写文章

`source/_posts/` 下加 `.md`，头信息模板见 `scaffolds/post.md`。

图片必须用站内路径：

- 图片放进 `source/img/`，正文写 `/blog/img/xxx.png`
- **不要**写 `E:/...`、`C:\...`、`file:///...` 这类本机路径 —— 线上全是碎图，`npm run check` 会拦下来
- 需要给某篇文章单独放图，可以开 `post_asset_folder: true` 后用相对路径

## 改配置时注意

- `_config.yml` 的 `url` 必须等于线上地址（现在是 `https://smith-rosco.github.io/blog`）。它决定 `canonical`、`og:url`、`sitemap.xml`、`atom.xml` 和每篇文章页脚的「文章链接」，写错就是全站死链
- 文章的更新时间用 front matter 的 `updated:`，不要靠文件 mtime（`updated_option` 已改成 `date`；换机器 clone 时 mtime 会全变成克隆时间）
- 主题 CDN 已钉版本（`themes/butterfly/_config.yml` → `CDN.version: true`，版本号在 `themes/butterfly/plugins.yml`）。别关掉：Font Awesome 不钉版本时 jsdelivr 会发 FA 7，而主题 CSS 写死 `Font Awesome 6 Free`，标题前的链条图标会变成占位方框

## 主题说明（重要）

`themes/butterfly/` 是 **vendored** 的上游主题，不是 submodule，因为本地改过它：

- 上游：`https://gitee.com/immyw/hexo-theme-butterfly`；主题 `package.json` 标 4.8.1，上游 git describe 记作 `3.1.1-312-g4e99420`（2023-04-10）
- 本地改动：`_config.yml`（导航菜单、CDN 版本开关、inject 清空）、`source/img/` 下的头像 / 封面 / 页脚 / 加载图 / favicon
- 因此**不能直接 `git pull` 主题更新**。要升级：备份本目录 → 拉上游新版本 → 把上述改动重新贴回去
- 主题原来的独立 git 历史（含上游 312 个提交）存在
  `G:\Temp\8_Project_retired\20261027\butterfly-theme.git`，需要时可以克隆回来比对

## 已停用 / 不要恢复的东西

- gitee 镜像（`rosco_k.gitee.io`）：Pages 已 404，不再部署；站点 URL 已切到 GitHub Pages
- 评论（valine/gitalk 等）、Artalk、aplayer 音乐播放器、clustrmaps 访客地图：都没配置，相关依赖与注入代码已删除
- 导航里的「音乐 / 电影 / 链接 / 关于」：没有对应页面，已从菜单删除。要恢复就先建页面（「链接」页还需要 `source/_data/link.yml`）

## 历史

2026-10-27 之前这批文件在磁盘上没有任何版本历史，只有 `.deploy_git`；现在源码在 `master` 有主线。
