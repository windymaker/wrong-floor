// 把 w05_3d_game 打包成单个 HTML：双击即可玩，不需要 Node、不需要服务器。
// 用法：node build.mjs <游戏目录> <输出 HTML>
import { build } from 'esbuild';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const [, , gameDirArg, outFileArg] = process.argv;
if (!gameDirArg || !outFileArg) {
  console.error('用法: node build.mjs <gameDir> <outFile>');
  process.exit(1);
}

const gameDir = path.resolve(gameDirArg);
const outFile = path.resolve(outFileArg);

const read = (p) => readFile(path.join(gameDir, p), 'utf8');

// 1) 打包 ES Module → 单段经典脚本
const result = await build({
  entryPoints: [path.join(gameDir, 'src/main.js')],
  absWorkingDir: gameDir,
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['chrome100', 'edge100'],
  minify: true,
  legalComments: 'none',
  write: false,
  logLevel: 'warning',
});

let bundle = result.outputFiles[0].text;
// 内联脚本里出现 </script> 会提前关闭标签
bundle = bundle.replace(/<\/script>/gi, '<\\/script>');

// 2) 内嵌模型
const glb = await readFile(path.join(gameDir, 'assets/models/classroom_m1_v01.glb'));
const glbBase64 = glb.toString('base64');

// 3) 内嵌样式
const css = await readFile(path.join(gameDir, 'styles/main.css'), 'utf8');

// 4) 取出 index.html 的 body 结构（丢掉原来的两段 script）
const html = await read('index.html');
const bodyStart = html.indexOf('<body>');
const firstScript = html.indexOf('<script', bodyStart);
if (bodyStart < 0 || firstScript < 0) throw new Error('index.html 结构不符合预期');
const bodyMarkup = html.slice(bodyStart + '<body>'.length, firstScript).trimEnd();

const title = (html.match(/<title>([^<]*)<\/title>/) || [, '错层 Wrong Floor'])[1];

const out = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<style>
${css}
</style>
</head>
<body>
${bodyMarkup}
<script>window.__WF_DEV__ = false;</script>
<script>window.__WF_CLASSROOM_GLB__ = "${glbBase64}";</script>
<script>
${bundle}
</script>
</body>
</html>
`;

await writeFile(outFile, out, 'utf8');
const kb = (n) => (n / 1024).toFixed(0) + ' KB';
console.log(`bundle: ${kb(result.outputFiles[0].contents.length)}`);
console.log(`model : ${kb(glb.length)} raw -> ${kb(glbBase64.length)} base64`);
console.log(`html  : ${kb(Buffer.byteLength(out, 'utf8'))} -> ${outFile}`);
