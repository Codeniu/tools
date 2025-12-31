# 手写数字识别 - 使用真实 MNIST 数据集

基于深度学习的数字识别应用，使用卷积神经网络（CNN）和真实的 MNIST 数据集进行训练。

## 功能特点

### 1. 模型管理
- 📁 **上传模型文件**：支持上传 JSON 格式的预训练模型
- 📋 **模型列表**：查看和管理所有已保存的模型
- 🔄 **快速切换**：点击模型名称即可切换使用不同版本的模型
- 🗑️ **删除模型**：可以删除不需要的模型

### 2. 训练功能
- 🎓 **真实 MNIST 数据集**
  - 55,000 个训练样本
  - 10,000 个测试样本
- ⚙️ **可配置训练轮数**：1-50 轮可调（推荐 10-15 轮）
- 💾 **另存为模型**：训练完成后可保存为自定义名称
- 📊 **实时进度显示**：显示训练准确率和验证准确率

### 3. 数字识别
- ✍️ **手写输入**：在画布上绘制数字
- 🖌️ **可调节画笔**：支持调节画笔粗细（5-30）
- 📱 **触屏支持**：支持移动设备触摸操作
- 🎯 **概率显示**：显示每个数字（0-9）的识别概率

## 文件结构

```
handwriting-digit-recognition/
├── digit-recognition.html      # 主应用文件
├── mnist-cnn-model-v2.json     # 预训练模型（可选）
└── mnist/                      # MNIST 数据集文件夹
    ├── mnist_images.png        # 图像数据（10.7MB）
    └── mnist_labels_uint8      # 标签数据（650KB）
```

## 使用方法

### 首次使用

#### 方法 1：使用预训练模型（推荐）
1. 将 `mnist-cnn-model-v2.json` 文件放在与 `digit-recognition.html` 同目录下
2. 在浏览器中打开 `digit-recognition.html`
3. 应用会自动加载预训练模型
4. 开始在画布上绘制数字并识别

#### 方法 2：训练自己的模型
1. 确保 `mnist/` 文件夹与 `digit-recognition.html` 在同一目录
2. 打开 `digit-recognition.html`
3. 在"训练设置"中设置训练轮数（推荐 10-15）
4. 点击"🚀 开始训练"按钮
5. 等待训练完成（可能需要几分钟）
6. 点击"💾 另存为模型"保存训练好的模型

### 日常使用

1. **选择模型**（如果有多个模型）
   - 在"模型列表"中点击想要使用的模型

2. **绘制数字**
   - 在画布上用鼠标或手指绘制数字
   - 可以调节画笔粗细

3. **识别**
   - 点击"🔍 识别"按钮
   - 查看识别结果和置信度
   - 查看各数字的概率分布

4. **管理模型**
   - 上传新的模型文件
   - 切换不同模型进行对比
   - 删除不需要的模型

## 技术细节

### CNN 模型架构
- **第一个卷积块**
  - Conv2D (32 filters, 3x3) + BatchNormalization
  - Conv2D (32 filters, 3x3) + BatchNormalization
  - MaxPooling2D (2x2)
  - Dropout (0.25)

- **第二个卷积块**
  - Conv2D (64 filters, 3x3) + BatchNormalization
  - Conv2D (64 filters, 3x3) + BatchNormalization
  - MaxPooling2D (2x2)
  - Dropout (0.25)

- **全连接层**
  - Flatten
  - Dense (256 units) + BatchNormalization
  - Dropout (0.5)
  - Dense (10 units, softmax)

### 训练参数
- **优化器**: Adam (learning rate = 0.001)
- **损失函数**: Categorical Crossentropy
- **批大小**: 512
- **训练数据**: 55,000 样本
- **测试数据**: 10,000 样本

### 性能指标
使用真实 MNIST 数据集训练 10 轮后：
- 训练准确率: ~99%
- 验证准确率: ~98%

## 浏览器兼容性

- ✅ Chrome/Edge (推荐)
- ✅ Firefox
- ✅ Safari
- ⚠️ 需要支持 WebGL 和 ES6+

## 常见问题

### Q: 训练需要多长时间？
A: 取决于设备性能，通常 10 轮训练需要 2-5 分钟。

### Q: 模型保存在哪里？
A: 模型保存在浏览器的 localStorage 中。清除浏览器数据会删除所有保存的模型。

### Q: 如何备份模型？
A: 使用浏览器开发工具导出 localStorage，或在训练后手动保存模型 JSON 文件。

### Q: 为什么识别不准确？
A:
1. 确保使用的是用 MNIST 数据集训练的模型
2. 绘制时尽量写得清晰，居中绘制
3. 尝试训练更多轮次以提高准确率

## 更新日志

### v3.0 (最新)
- ✨ 使用真实 MNIST 数据集替代模拟数据
- 🎓 大幅提升识别准确率（98%+）
- 📊 优化训练过程，使用 55,000 个真实训练样本
- 🔄 改进模型加载机制

### v2.0
- ✨ 添加模型管理功能
- 📁 支持上传和保存多个模型
- 🎓 可配置训练参数
- 💾 模型另存为功能

### v1.0
- ✍️ 基础手写数字识别
- 🎨 漂亮的 UI 界面
- 🖌️ 可调节画笔粗细

## 许可证

MIT License

## 致谢

- MNIST 数据集：http://yann.lecun.com/exdb/mnist/
- TensorFlow.js：https://www.tensorflow.org/js
