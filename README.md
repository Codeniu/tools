# Web Tools Collection

一个实用的在线工具集合，提供多种文件格式转换功能。所有工具均在浏览器端运行，保护用户隐私。

## 项目简介

本项目收录了一系列纯前端实现的在线转换工具，无需服务器端处理，所有操作都在用户的浏览器中完成。这种设计确保了数据隐私，同时提供了快速、便捷的用户体验。

## 包含工具

### MP4 to GIF - 视频转 GIF 工具

基于 FFmpeg WASM 技术实现的 MP4 视频转 GIF 动图工具。

**主要功能：**
- 纯前端转换，无需上传文件到服务器
- 支持自定义起始时间、持续时间、帧率和输出尺寸
- 实时预览和进度显示
- 拖拽上传支持

**技术栈：** HTML5, CSS3, JavaScript (ES6+), FFmpeg WASM

**使用说明：** 查看 [mp4-to-gif/mp4-to-gif.md](mp4-to-gif/mp4-to-gif.md)

**快速启动：**
```bash
cd mp4-to-gif
node server.js
# 访问 http://localhost:8080/mp4-to-gif.html
```

### PNG to ICO - 图片转图标工具

功能丰富的 PNG 转 ICO 在线转换器。

**主要功能：**
- 支持多种输入格式（PNG, JPG, JPEG, BMP）
- 多尺寸选择（16x16 到 256x256）
- 实时预览转换效果
- 批量转换支持，多尺寸自动打包为 ZIP

**技术栈：** HTML5, CSS3, JavaScript (ES6+)

**使用说明：** 查看 [png-to-ico/png-to-ico.md](png-to-ico/png-to-ico.md)

**快速启动：**
```bash
# 直接在浏览器中打开
open png-to-ico/png-to-ico.html
```

## 项目特点

### 隐私保护
- 所有转换均在浏览器本地完成
- 不上传任何文件到外部服务器
- 数据完全由用户控制

### 纯前端实现
- 无需后端服务器
- 无需安装任何软件
- 跨平台支持（Windows, Mac, Linux）

### 现代化技术
- 使用最新的 Web 标准和 API
- 响应式设计，适配移动端
- 优雅的用户界面和交互体验

## 系统要求

### 浏览器支持
- Chrome 90+
- Edge 90+
- Firefox 88+
- Safari 15+

### 技术要求
- 支持 WebGL 2.0（MP4 to GIF 工具）
- 支持 SharedArrayBuffer（MP4 to GIF 工具）
- 建议使用现代浏览器的最新版本

## 安装和使用

### 克隆项目
```bash
git clone https://github.com/yourusername/tools.git
cd tools
```

### 使用 MP4 to GIF 工具
```bash
cd mp4-to-gif

# 启动服务器
node server.js

# 或使用批处理文件（Windows）
start-node-server.bat
```

然后访问 `http://localhost:8080/mp4-to-gif.html`

### 使用 PNG to ICO 工具
直接在浏览器中打开 `png-to-ico/png-to-ico.html` 文件即可使用。

## 项目结构

```
tools/
├── mp4-to-gif/           # MP4 转 GIF 工具
│   ├── mp4-to-gif.html   # 主页面
│   ├── mp4-to-gif.md     # 使用说明
│   ├── server.js         # Node.js 服务器
│   ├── start-node-server.bat
│   └── start-server.sh
│
├── png-to-ico/           # PNG 转 ICO 工具
│   ├── png-to-ico.html   # 主页面
│   └── png-to-ico.md     # 使用说明
│
└── README.md             # 项目介绍（本文件）
```

## 开发计划

欢迎贡献代码和建议！未来计划添加更多实用的转换工具。

## 许可证

本项目基于开源许可证发布。各工具使用的第三方库遵循其相应的许可证。

## 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 联系方式

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发起 Discussion

---

**享受使用！** 🎉✨
