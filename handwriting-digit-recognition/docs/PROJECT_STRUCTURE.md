# 项目结构说明

## 目录结构

```
handwriting-digit-recognition/
│
├── index.html                  # 主HTML文件（应用入口）
├── README.md                   # 项目说明文档
│
├── css/                        # 样式文件目录
│   └── styles.css             # 主样式文件
│
├── js/                         # JavaScript文件目录
│   ├── main.js                # 主应用逻辑
│   ├── data-loader.js         # MNIST数据加载和模型创建
│   └── trainer.js             # 训练逻辑和可视化
│
├── models/                     # 预训练模型目录
│   └── mnist-cnn-model-v2.json # 28×28版本的预训练模型
│
├── mnist/                      # MNIST数据集目录
│   ├── mnist_images.png       # 65,000张28×28训练图片
│   └── mnist_labels_uint8     # 对应的标签文件
│
├── data/                       # 用户数据目录（预留）
│
└── docs/                       # 文档目录
    ├── README.md              # 项目说明
    ├── old-notes.md           # 旧的开发笔记
    └── PROJECT_STRUCTURE.md   # 本文件
```

## 文件说明

### 入口文件

#### `index.html`
- 应用主页面
- 包含两个页签：数字识别和模型训练
- 引用所有CSS和JS文件
- 定义UI结构和布局

### 样式文件

#### `css/styles.css`
- 全局样式定义
- 响应式布局
- 页签样式
- 训练可视化样式
- 图表容器样式

### JavaScript文件

#### `js/main.js`
**主要功能：**
- 应用初始化
- 页签切换
- 画布交互（鼠标/触摸）
- 模型管理（加载、保存、删除）
- 图像预处理（28×28 → 24×24裁剪）
- 数字预测
- UI更新

**关键函数：**
- `init()` - 初始化应用
- `switchTab()` - 页签切换
- `predict()` - 识别手写数字
- `preprocessImage()` - 图像预处理
- `loadModel()` - 加载模型
- `saveModelAs()` - 保存模型

#### `js/data-loader.js`
**主要功能：**
- MNIST数据集加载
- CNN模型创建（24×24输入）
- 图像裁剪工具函数

**关键类/函数：**
- `MnistData` 类 - 数据集加载和管理
- `createModel()` - 创建24×24 CNN模型
- `cropTo24x24()` - 单张图片裁剪
- `batchCropTo24x24()` - 批量图片裁剪

**模型架构：**
```
输入: 24×24×1
↓
Conv2D(32) + BN + ReLU
Conv2D(32) + BN + ReLU
MaxPool(2×2) + Dropout(0.25)
↓
Conv2D(64) + BN + ReLU
Conv2D(64) + BN + ReLU
MaxPool(2×2) + Dropout(0.25)
↓
Flatten + Dense(256) + BN + Dropout(0.5)
↓
Dense(10) + Softmax
```

#### `js/trainer.js`
**主要功能：**
- 单样本训练循环
- 训练过程可视化
- 定期测试评估
- 训练图表绘制

**关键函数：**
- `startTraining()` - 开始训练
- `visualizeNetworkState()` - 显示网络状态
- `testRandomSamples()` - 测试50个样本
- `displayTrainingImage()` - 显示当前训练图片
- `updateCharts()` - 更新训练图表

**训练策略：**
- 每次随机选择1个样本训练
- 每10次更新UI
- 每100次显示网络状态
- 每1000次测试50个样本

### 数据文件

#### `mnist/mnist_images.png`
- 65,000张28×28灰度图片
- 拼接成一张大图
- 包含55,000训练样本 + 10,000测试样本

#### `mnist/mnist_labels_uint8`
- 对应的one-hot编码标签
- 二进制格式

### 模型文件

#### `models/mnist-cnn-model-v2.json`
- 28×28版本的预训练模型
- TensorFlow.js格式
- 可直接加载使用

**注意：** 当前应用使用24×24模型，此模型仅用于兼容性参考。

### 文档文件

#### `README.md`
- 项目概述
- 快速开始指南
- 技术细节
- 使用技巧

#### `docs/old-notes.md`
- 旧的开发笔记
- 保留作为参考

#### `docs/PROJECT_STRUCTURE.md`
- 本文件
- 详细的目录结构说明

## 命名规范

### 文件命名

- HTML文件：使用小写，用连字符分隔 → `index.html`
- CSS文件：使用小写，用连字符分隔 → `styles.css`
- JS文件：使用小写，用连字符分隔 → `main.js`, `data-loader.js`

### 目录命名

- 使用小写
- 语义化命名
- 复数形式用于存放多个文件的目录

### 变量命名

- 使用驼峰命名法 → `trainXs`, `trainYs`
- 常量使用大写下划线 → `MODEL_STORAGE_PREFIX`
- 类名使用帕斯卡命名法 → `MnistData`

## 扩展建议

### 可添加的目录

```
├── assets/          # 静态资源（图标、图片等）
├── config/          # 配置文件
├── utils/           # 工具函数
└── tests/           # 测试文件
```

### 可添加的功能

- 用户自定义数据集
- 模型导入/导出
- 训练历史记录
- 性能监控面板
- 多语言支持

## 依赖关系

```
index.html
  ├── css/styles.css
  └── js/
      ├── data-loader.js (必须在main.js之前加载)
      ├── main.js
      └── trainer.js
```

加载顺序很重要：
1. TensorFlow.js
2. Chart.js
3. data-loader.js（提供MnistData和createModel）
4. main.js（核心应用逻辑）
5. trainer.js（训练功能）
