## 图片分割工具

你是一位专业的前端开发专家。请创建一个完整的单文件HTML网页，所有代码（HTML、CSS、JavaScript）必须内嵌在同一个文件中，使用<style>标签放置CSS，使用<script>标签放置JavaScript。不要使用任何外部链接、CDN或框架（如Bootstrap、jQuery），纯原生实现。

网页主题：[图片分割工具]

具体要求：

- 使用 tailwindcss 美化页面样式
- 响应式设计，支持移动端和桌面端。
- 现代简约风格。
- 页面结构包括合理划分。
- 交互效果。
- 添加代码注释，解释关键部分。
- 确保代码干净、可读、兼容现代浏览器。

任务列表：

- [ ] 设计用户界面
- [ ] 实现基本功能
- [ ] 添加README说明文档
- [ ] 更新主项目的index.html添加抽奖工具入口
- [ ] 更新主项目的README.md添加抽奖工具介绍

- 调整页面布局，文件上传区域小一点，尽量使页面一屏显示
- 添加手动调整分割线的功能
- 代码样式可以使用 tailwindcss 美化，（通过CDN的方式引入）

- 下载全部，打包为 ZIP 文件
- 手动模式需要添加垂直分割线

- 将输出格式调整为单选框样式

图片拼接工具：

第一次调整

- 调整页面布局，文件上传区域小一点，尽量使页面一屏显示
- 添加手动调整拼接顺序的功能
- 代码样式可以使用 tailwindcss 美化，（通过CDN的方式引入）
- 上传完之后即可预览

2

- 手动移动拼接位置
- 手动调整单张图片大小
- 不再局限是横向还是纵向拼接

3

- 布局模式，只保留智能模式
- 在缩放图片时，存在缩放框不跟随图片的bug
- 将背景网格线是否显示，设置为配置项

4

- 增加画布边框，与背景做区分
- 画布容器的背景网格可以保留

5

- 当图片缩放时，用于辅助缩放的指示器，需要跟随图片放大缩小
- 优化网格吸附，优先吸附边缘以及图片边缘

6

- 增加常用画布尺寸预设选项
- 增加画布背景色透明功能

## 首页调整

- 将 [tool-card] 中的内容 JSON 化，使用循环的方式渲染
- 在首页使用 [carousel] 的方式展示工具卡片
- 新增 [more.html] 页面，展示所有工具卡片，并提供筛选功能

- 将 [index.html] 与 [more.html] 中的工具数据，合并成一个js公共文件，将可复用的 css，tailwindcss 类名，js 函数等，提取出来，放到公共文件中
- 优化 [index.html] ,使卡片布局更加合理,紧凑，尽量一个页面显示出来

- 首页的轮播，轮播的样式可以常考 element-plus 的 carousel组件的 Card mode

- 优化首页样式，使布局更加合理
- 优化轮播的样式，每次只滚动一个卡片

- 增加卡片高度，使卡片内容更加完整显示
- 优化卡片样式，使其更有科技感

- 继续增加卡片高度，同时，是轮播指示器置于卡片下方，轮播左右指示器，置于卡片左右侧，不要压在卡片上，卡片底部的立即使用按钮，离卡片底部的距离太小了，请合理规划卡片布局

## gif编辑工具

你是一位专业的前端开发专家。在[gif-editor]下创建一个完整的单文件HTML网页，所有代码（HTML、CSS、JavaScript）必须内嵌在同一个文件中，使用<style>标签放置CSS，使用<script>标签放置JavaScript。使用 ffmpegwasm 库来实现 GIF 编辑功能。

引用示例

```
    const load = async () => {
        const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core-mt@0.12.10/dist/umd'
        const ffmpeg = ffmpegRef.current;
        ffmpeg.on('log', ({ message }) => {
            messageRef.current.innerHTML = message;
            console.log(message);
        });
        // toBlobURL is used to bypass CORS issue, urls with the same
        // domain can be used directly.
        await ffmpeg.load({
            coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
            wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
            workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
        });
        setLoaded(true);
    }
```

网页主题：[gif编辑工具]

具体要求：

- 使用 tailwindcss 美化页面样式
- 响应式设计，支持移动端和桌面端。
- 现代简约风格。
- 页面结构包括合理划分。
- 交互效果。
- 添加代码注释，解释关键部分。
- 确保代码干净、可读、兼容现代浏览器。

任务列表：

- [ ] 设计用户界面
- [ ] 实现基本功能
- [ ] 添加README说明文档
- [ ] 更新主项目的index.html添加抽奖工具入口
- [ ] 更新主项目的README.md添加抽奖工具介绍

- 修复GIF编辑功能,目前不能正常显示有多少帧
- 优化布局

- 考虑使用 FFMpeg 库来实现GIF编辑功能(通过CDN引入)
- 使用 tailwindcss 美化页面样式(通过CDN引入)
