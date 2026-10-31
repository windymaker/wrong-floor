# 单文件试玩版构建

`tools/build-singlefile.mjs` 会把整个 `w05_3d_game` 打包成一个 HTML：
双击就能玩，对方不需要安装 Node，也不需要起本地服务器。

## 为什么需要它

游戏用的是 ES Module + `fetch` 加载 GLB。直接双击 `index.html`（`file://`）时，
浏览器会拦住模块脚本和本地请求，所以必须有一个打包步骤把这些东西内联进去：

- 所有 JS 用 esbuild 合成一段经典脚本（IIFE），不再是 module
- `styles/main.css` 内联进 `<style>`
- `assets/models/classroom_m1_v01.glb` 转成 base64，挂到 `window.__WF_CLASSROOM_GLB__`
- `level.js` 检测到这个变量时改用 `GLTFLoader.parse`，跳过网络请求

## 怎么构建

需要 Node 18+，并装一次 esbuild：

```powershell
mkdir build-tmp
cd build-tmp
npm init -y
npm i esbuild
```

然后：

```powershell
node ..\tools\build-singlefile.mjs ..\w05_3d_game .\WrongFloor.html
```

也可以把 esbuild 装在任何地方，只要运行脚本时能 `import 'esbuild'`。

产物大约 1.5 MB（bundle 830 KB + 模型 base64 681 KB）。

## 自检

用浏览器打开产物，按 F12 看 `<body>` 上的标记：

```text
data-classroom-model="glb"     模型来自内嵌 base64
data-decor="45"                45 处随机痕迹
data-furniture-hidden="51/51"  旧程序化家具已隐藏
```

`#boot-error` 应该是 `class="hidden"`。

## 已知边界

- 单文件版把 `__WF_DEV__` 设为 `false`，所以没有 `?debug` 面板，也不暴露 `window.__game`。
- 需要浏览器支持 WebGL 与 ES2020（Chrome/Edge 100+、Firefox 100+、Safari 15+）。
- 首次打开要解码 681 KB base64，低配机器可能有 1～2 秒白屏，属正常。
- 文件是通过 `file://` 打开的，个别企业策略会禁止本地脚本，此时改用 HTTP 版。
- 修改 `layout.js` 的课桌坐标后，要先重跑 `generate_furniture_glb.py`，再重新打包。
