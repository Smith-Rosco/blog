// 构建产物检查：跑在 `hexo generate` 之后、`hexo deploy` 之前。
// 只查三类会静默坏掉的问题：
//   1. HTML 里出现本机路径（E:/、file:///），线上一定是碎图
//   2. HTML 里出现旧域名 rosco_k.gitee.io（已 404），canonical/og 全错
//   3. 站内链接或图片指向 public/ 里不存在的文件（404）
// 用法：node tools/check-build.mjs  （失败时退出码 1）

import fs from 'node:fs'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const PUBLIC = path.join(ROOT, 'public')

const config = fs.readFileSync(path.join(ROOT, '_config.yml'), 'utf8')
const siteRoot = (config.match(/^root:\s*(\S+)/m)?.[1] || '/').replace(/\/$/, '')

const htmlFiles = []
const walk = dir => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(full)
    else if (entry.name.endsWith('.html')) htmlFiles.push(full)
  }
}
if (!fs.existsSync(PUBLIC)) {
  console.error('public/ 不存在，先跑 npm run build')
  process.exit(1)
}
walk(PUBLIC)

const problems = []
const toUrlPath = p => '/' + path.relative(PUBLIC, p).split(path.sep).join('/')

const exists = urlPath => {
  let rel = urlPath.slice(siteRoot.length) || '/'
  rel = decodeURI(rel).replace(/^\//, '')
  const target = path.join(PUBLIC, rel)
  if (fs.existsSync(target) && fs.statSync(target).isFile()) return true
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
    return fs.existsSync(path.join(target, 'index.html'))
  }
  // 无扩展名的干净 URL：/blog/foo/ 或 /blog/foo
  return fs.existsSync(path.join(PUBLIC, rel, 'index.html')) ||
    fs.existsSync(path.join(PUBLIC, rel + '.html'))
}

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, 'utf8')
  const page = toUrlPath(file)

  for (const bad of ['E:/', 'E:\\', 'file:///']) {
    if (html.includes(bad)) problems.push(`${page}: 含本机路径 ${bad}`)
  }
  if (html.includes('rosco_k.gitee.io')) problems.push(`${page}: 含旧域名 rosco_k.gitee.io`)

  const refs = html.matchAll(/(?:href|src)="(\/blog\/[^"#?]*)[^"]*"/g)
  for (const [, ref] of refs) {
    if (!exists(ref)) problems.push(`${page}: 链接目标不存在 ${ref}`)
  }
}

if (problems.length) {
  console.error(`构建产物有 ${problems.length} 个问题：`)
  for (const p of problems) console.error('  - ' + p)
  process.exit(1)
}
console.log(`OK: ${htmlFiles.length} 个 HTML 页面，无本机路径 / 旧域名 / 死链`)
