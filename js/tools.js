// 工具数据
const toolsData = [
  {
    id: 'mp4-to-gif',
    icon: '🎬',
    badge: '热门工具',
    badgeStyle: '',
    title: 'MP4 转 GIF',
    description: '将 MP4 视频转换为 GIF 动图，支持自定义参数调整，实时预览转换效果。',
    features: [
      '纯前端转换，无需上传文件',
      '可调节起始时间、持续时长',
      '支持自定义帧率和尺寸',
      '实时预览和进度显示',
      '基于 FFmpeg WASM 技术',
    ],
    link: './mp4-to-gif/mp4-to-gif.html',
    techStack: ['FFmpeg WASM', 'HTML5', 'ES6+'],
    category: 'video',
    categoryName: '视频工具',
  },
  {
    id: 'png-to-ico',
    icon: '🖼️',
    badge: '常用工具',
    badgeStyle: '',
    title: 'PNG 转 ICO',
    description: '将 PNG/JPG 等图片格式转换为 ICO 图标文件，支持多种尺寸批量转换。',
    features: [
      '支持 PNG、JPG、JPEG、BMP 格式',
      '多尺寸选择（16x16 到 256x256）',
      '实时预览转换效果',
      '批量转换自动打包 ZIP',
      '符合 ICO 文件格式规范',
    ],
    link: './png-to-ico/png-to-ico.html',
    techStack: ['Canvas API', 'Blob API', 'JSZip'],
    category: 'image',
    categoryName: '图片工具',
  },
  {
    id: 'handwriting-digit-recognition',
    icon: '✍️',
    badge: 'AI 深度学习',
    badgeStyle: 'background: #e3f2fd; color: #1565c0',
    title: '手写数字识别',
    description: '基于 CNN 卷积神经网络训练的 AI 模型，在画板上手写数字，实时高精度识别。',
    features: [
      '使用 CNN 卷积神经网络模型',
      '在 MNIST 数据集上训练（99.5%+ 准确率）',
      '实时预测和置信度概率显示',
      '完全离线运行，无需网络请求',
      '支持鼠标和触摸屏操作',
    ],
    link: './handwriting-digit-recognition/index.html',
    techStack: ['TensorFlow.js', 'CNN', '深度学习'],
    category: 'ai',
    categoryName: 'AI 工具',
  },
  {
    id: 'recording-screen',
    icon: '🎬',
    badge: '实用工具',
    badgeStyle: 'background: #fff3e0; color: #e65100',
    title: '在线录屏工具',
    description: '简单易用的浏览器录屏工具，无需安装任何插件，直接在浏览器中录制屏幕并下载视频。',
    features: [
      '纯前端录制，无需上传文件',
      '支持选择屏幕、窗口或标签页',
      '实时预览录制画面',
      '支持暂停/继续录制',
      '一键下载 WebM 格式视频',
    ],
    link: './recording-screen/index.html',
    techStack: ['MediaRecorder API', 'Screen Capture API', 'WebRTC'],
    category: 'video',
    categoryName: '视频工具',
  },
  {
    id: 'lucky-draw',
    icon: '🎰',
    badge: '趣味工具',
    badgeStyle: 'background: #fce4ec; color: #c2185b',
    title: '在线抽奖工具',
    description: '简单、公平、有趣的在线抽奖系统，支持自定义中奖人数和抽奖速度，完美适配各种活动场景。',
    features: [
      '完全随机抽取，确保公平性',
      '支持批量导入参与名单',
      '已中奖人员不会重复中奖',
      '数据本地存储，刷新不丢失',
      '支持导出中奖结果为文件',
    ],
    link: './lucky-draw/index.html',
    techStack: ['ES6+', 'LocalStorage', 'Canvas API'],
    category: 'fun',
    categoryName: '趣味工具',
  },
  {
    id: 'image-splitter',
    icon: '🖼️',
    badge: '图片工具',
    badgeStyle: 'background: #e8f5e9; color: #2e7d32',
    title: '图片分割工具',
    description: '简单高效的图片分割工具，将图片按网格分割成多个小图片，支持九宫格、拼图等多种分割方式。',
    features: [
      '支持网格均匀分割（1-20行×1-20列）',
      '支持拖拽上传和点击上传',
      '多种输出格式（PNG/JPEG/WebP）',
      '支持批量下载所有分割图片',
      '完全本地处理，保护隐私',
    ],
    link: './image-splitter/index.html',
    techStack: ['Canvas API', 'File API', 'Blob API'],
    category: 'image',
    categoryName: '图片工具',
  },
  {
    id: 'image-merger',
    icon: '🔗',
    badge: '创意工具',
    badgeStyle: 'background: #fff3e0; color: #e65100',
    title: '图片拼接工具',
    description: '智能布局模式，自由拖拽、缩放、旋转图片，类似专业设计软件的体验。',
    features: [
      '✨ 智能布局 - 自由拖拽图片到任意位置',
      '🎯 智能吸附 - 三级吸附系统（边缘/图片/网格）',
      '📐 拖拽缩放 - 角落控制点调整大小',
      '🔄 旋转图片 - 0-360度自由旋转',
      '📐 画布预设 - Full HD、Instagram、4K等',
      '🎨 透明背景 - 支持导出透明PNG',
    ],
    link: './image-merger/index.html',
    techStack: ['Canvas API', 'Tailwind CSS', 'File API', 'Blob API'],
    category: 'image',
    categoryName: '图片工具',
  },
];

// 创建工具卡片
function createToolCard(tool, index = 0) {
  const featuresHtml = tool.features.map((feature) => `<li>${feature}</li>`).join('');
  const techStackHtml = tool.techStack.map((tech) => `<span class="tech-tag">${tech}</span>`).join('');

  return `
    <div class="tool-card" ${index ? `style="animation-delay: ${index * 0.1}s"` : ''}>
      <span class="tool-icon">${tool.icon}</span>
      <span class="badge" style="${tool.badgeStyle}">${tool.badge}</span>
      <h2>${tool.title}</h2>
      <p>${tool.description}</p>
      <ul class="features-list">
        ${featuresHtml}
      </ul>
      <a href="${tool.link}" class="tool-link">
        立即使用 →
      </a>
      <div class="tech-stack">
        ${techStackHtml}
      </div>
    </div>
  `;
}

// 获取所有分类
function getCategories() {
  return [
    { id: 'all', name: '全部' },
    ...Array.from(
      new Map(toolsData.map((t) => [t.category, t.categoryName])).entries()
    ).map(([id, name]) => ({ id, name })),
  ];
}

// 筛选工具
function filterTools(category, searchQuery = '') {
  return toolsData.filter((tool) => {
    const matchesCategory = category === 'all' || tool.category === category;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      tool.title.toLowerCase().includes(searchLower) ||
      tool.description.toLowerCase().includes(searchLower) ||
      tool.features.some((f) => f.toLowerCase().includes(searchLower)) ||
      tool.techStack.some((t) => t.toLowerCase().includes(searchLower));

    return matchesCategory && matchesSearch;
  });
}
