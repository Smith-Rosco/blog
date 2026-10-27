# 09_Blog

Hexo 博客站点源码（`butterfly` 主题）。**本目录是仓根**，`public/`、`node_modules/`、`db.json` 不入库。

## 跑起来

```bash
npm install          # 首次
npx hexo server      # 本地预览 http://localhost:4000
npx hexo generate    # 生成到 public/
npx hexo deploy      # 部署（.deploy_git 是部署产物目录，不入库）
```

## 写文章

`source/_posts/` 下加 `.md`，头信息模板见 `scaffolds/post.md`。

## 主题说明（重要）

`themes/butterfly/` 是**vendored** 的上游主题，不是 submodule，原因是本地已改过它：

- 上游：`https://gitee.com/immyw/hexo-theme-butterfly`，基准版本 `3.1.1-312-g4e99420`（2023-04-10）
- 本地改动：`_config.yml`，以及 `source/img/` 下的头像 / 封面 / 页脚 / 加载图 / favicon
- 因此**不能直接 `git pull` 主题更新**。要升级：备份本目录 → 拉上游新版本 → 把上述改动重新贴回去。
- 主题原来的独立 git 历史（含上游 312 个提交）存在
  `G:\Temp\8_Project_retired\20261027\butterfly-theme.git`，需要时可以克隆回来比对。

## 为什么要建这个仓

2026-10-27 之前这 14,899 个文件在磁盘上**没有任何版本历史**，只有 `.deploy_git`。现在源码有主线了。
