# 09_Blog

Hexo 8 博客站点源码（`butterfly` 5.7.0 主题）。线上地址：<https://smith-rosco.github.io/blog/>

## 仓库结构（重要）

- **`master` = 源码**（本目录），远端 <https://github.com/Smith-Rosco/blog>
- **`main` = 构建产物**，GitHub Pages 从 `main` 发布。不要手动往 `main` 放源码，下次 `npm run deploy` 会覆盖它
- `public/`、`node_modules/`、`db.json`、`.deploy_git/` 不入库
- 升级前的备份 tag：`backup-pre-hexo8-butterfly5`

## 跑起来

```bash
npm install          # 需要 Node >= 20.19
npm run server       # 本地预览 http://localhost:4000
npm run build        # 生成到 public/
npm run check        # 检查产物：本机路径 / 旧域名 / 站内死链，有问题退出码 1
npm run deploy       # 等价 hexo generate + check + hexo deploy
```

`npm run deploy` 会自动先跑 `predeploy`（generate + check）。**别用 `npx hexo deploy`**，那会绕过检查。

## 写文章

`source/_posts/` 下加 `.md`，头信息模板见 `scaffolds/post.md`。

图片必须用站内路径：

- 图片放进 `source/img/`，正文写 `/blog/img/xxx.webp`
- 优先用 **WebP**（仓里的头像/横幅/封面/头图已经全部转成 WebP）；PNG/JPG 只在动图（GIF）或必须无损时用
- **不要**写 `E:/...`、`C:\...`、`file:///...` 这类本机路径 —— 线上全是碎图，`npm run check` 会拦下来

## 配置分两层

- `_config.yml`：站点级配置（标题、URL、permalink、部署、`updated_option`）
- `_config.butterfly.yml`：主题本地覆盖（菜单、头像、封面、社交、页脚、各种开关）。Hexo 会把它合并到 `themes/butterfly/_config.yml` 之上
- **主题目录保持上游原样**，不要再直接改 `themes/butterfly/_config.yml`；要覆盖什么就写进 `_config.butterfly.yml`

## 性能设置

- 图片：头像 320px、首页横幅 1280x720、封面 800px、文章头图 1600x900，全部 WebP。首页图片传输量已从约 1.3MB 降到 221KB
- 懒加载：`lazyload.enable: true` + `native: true`（浏览器原生 `loading="lazy"`，不额外加载 JS）；首屏图片仍会立即加载
- 已关闭三个纯装饰特效：`preloader`（全屏加载动画，自带 147KB GIF）、`canvas_nest`（背景粒子）、`activate_power_mode`（打字冒光/抖动）。想要氛围感时可以把对应 `enable` 改回 `true`，但会明显增加 CPU 和首屏等待
- 想再压首页：把 `index_image_1.webp` 换成更小的横幅，或给文章加 `cover` 后减少默认封面的使用

## 主题说明（重要）

`themes/butterfly/` 是 **vendored** 的上游主题（不是 submodule），因为 `source/img/` 里有本地图片：

- 上游：`https://github.com/jerryc127/hexo-theme-butterfly`，当前版本 **5.7.0**
- 本地自制图片：`source/img/` 下的 `avatar_image/`、`cover_image/`、`footer_image/`、`index_image/`、`page_image/`、`favicon.png`、`loding.gif`、`网页图标_1.png`、`Ellipsis-2.4s-200px.html`
- 升级主题的步骤：
  1. 备份本目录（或打 tag）
  2. 用新版本整目录替换 `themes/butterfly/`
  3. 把上面这些图片拷回新主题的 `source/img/` 同路径
  4. 对照上游新配置检查 `_config.butterfly.yml` 有没有改名/删除的键
  5. `npm run build && npm run check`，再跑 `npm run server` 人工看一遍
- 主题原来的独立 git 历史（含上游提交）存在
  `G:\Temp\8_Project_retired\20261027\butterfly-theme.git`，需要时可以克隆回来比对
- 主题 5.x 的 `plugins.yml` 钉的是 Font Awesome 7.3.1，**不要**再把 CDN 版本关掉：主题 CSS 与图标字族必须一致，否则标题前的图标会变成方框

## 改配置时注意

- `_config.yml` 的 `url` 必须等于线上地址（现在是 `https://smith-rosco.github.io/blog`）。它决定 `canonical`、`og:url`、`sitemap.xml`、`atom.xml` 和每篇文章页脚的「文章链接」，写错就是全站死链
- 文章的更新时间用 front matter 的 `updated:`，不要靠文件 mtime（`updated_option` 已改成 `date`；换机器 clone 时 mtime 会全变成克隆时间）
- 标签颜色（`aside.card_tags.color: true`）是每次构建随机分配的，所以两次构建的 HTML 会有颜色差异，这不是错误

## 已停用 / 不要恢复的东西

- gitee 镜像（`rosco_k.gitee.io`）：Pages 已 404，不再部署；站点 URL 已切到 GitHub Pages
- 评论（valine/gitalk 等）、Artalk、aplayer 音乐播放器、clustrmaps 访客地图：都没配置，相关依赖与注入代码已删除
- 导航里的「音乐 / 电影 / 链接 / 关于」：没有对应页面，已从菜单删除。要恢复就先建页面（「链接」页还需要 `source/_data/link.yml`）

## 历史

- 2026-10-27：这批文件第一次纳入版本控制（此前只有 `.deploy_git`）
- 2026-11-06：修复发布链路（域名、死链、图片、CDN 版本），补 `npm run check` 与 CI
- 2026-11-06：升级 Hexo 6.3 → 8.1.2、Butterfly 4.8.1 → 5.7.0、kramed → marked 7
