// MNIST数据集类
class MnistData {
  constructor() {
    this.IMAGE_SIZE = 784
    this.NUM_CLASSES = 10
    this.NUM_DATASET_ELEMENTS = 65000
    this.NUM_TRAIN_ELEMENTS = 55000
    this.NUM_TEST_ELEMENTS =
      this.NUM_DATASET_ELEMENTS - this.NUM_TRAIN_ELEMENTS
    this.shuffledTrainIndex = 0
    this.shuffledTestIndex = 0
  }

  async load() {
    updateStatus('正在加载MNIST数据集...', 'loading')

    // 加载图片
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    const imgRequest = new Promise((resolve, reject) => {
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        img.width = img.naturalWidth
        img.height = img.naturalHeight

        const datasetBytesBuffer = new ArrayBuffer(
          this.NUM_DATASET_ELEMENTS * this.IMAGE_SIZE * 4
        )

        const chunkSize = 5000
        canvas.width = img.width
        canvas.height = chunkSize

        for (let i = 0; i < this.NUM_DATASET_ELEMENTS / chunkSize; i++) {
          const datasetBytesView = new Float32Array(
            datasetBytesBuffer,
            i * this.IMAGE_SIZE * chunkSize * 4,
            this.IMAGE_SIZE * chunkSize
          )
          ctx.drawImage(
            img,
            0,
            i * chunkSize,
            img.width,
            chunkSize,
            0,
            0,
            img.width,
            chunkSize
          )

          const imageData = ctx.getImageData(
            0,
            0,
            canvas.width,
            canvas.height
          )

          for (let j = 0; j < imageData.data.length / 4; j++) {
            datasetBytesView[j] = imageData.data[j * 4] / 255
          }
        }
        this.datasetImages = new Float32Array(datasetBytesBuffer)
        resolve()
      }
      img.onerror = () => reject(new Error('加载MNIST图片失败'))
      img.src = 'mnist/mnist_images.png'
    })

    // 加载标签
    const labelsRequest = fetch('mnist/mnist_labels_uint8')
    const [imgResponse, labelsResponse] = await Promise.all([
      imgRequest,
      labelsRequest,
    ])

    this.datasetLabels = new Uint8Array(
      await labelsResponse.arrayBuffer()
    )

    // 创建训练和测试集的索引
    this.trainIndices = tf.util.createShuffledIndices(
      this.NUM_TRAIN_ELEMENTS
    )
    this.testIndices = tf.util.createShuffledIndices(
      this.NUM_TEST_ELEMENTS
    )

    // 分割训练和测试集
    this.trainImages = this.datasetImages.slice(
      0,
      this.IMAGE_SIZE * this.NUM_TRAIN_ELEMENTS
    )
    this.testImages = this.datasetImages.slice(
      this.IMAGE_SIZE * this.NUM_TRAIN_ELEMENTS
    )
    this.trainLabels = this.datasetLabels.slice(
      0,
      this.NUM_CLASSES * this.NUM_TRAIN_ELEMENTS
    )
    this.testLabels = this.datasetLabels.slice(
      this.NUM_CLASSES * this.NUM_TRAIN_ELEMENTS
    )

    updateStatus('MNIST数据集加载完成！', 'ready')
  }

  nextTrainBatch(batchSize) {
    return this.nextBatch(
      batchSize,
      [this.trainImages, this.trainLabels],
      () => {
        this.shuffledTrainIndex =
          (this.shuffledTrainIndex + 1) % this.trainIndices.length
        return this.trainIndices[this.shuffledTrainIndex]
      }
    )
  }

  nextTestBatch(batchSize) {
    return this.nextBatch(
      batchSize,
      [this.testImages, this.testLabels],
      () => {
        this.shuffledTestIndex =
          (this.shuffledTestIndex + 1) % this.testIndices.length
        return this.testIndices[this.shuffledTestIndex]
      }
    )
  }

  nextBatch(batchSize, data, index) {
    const batchImagesArray = new Float32Array(batchSize * this.IMAGE_SIZE)
    const batchLabelsArray = new Uint8Array(batchSize * this.NUM_CLASSES)

    for (let i = 0; i < batchSize; i++) {
      const idx = index()

      const image = data[0].slice(
        idx * this.IMAGE_SIZE,
        idx * this.IMAGE_SIZE + this.IMAGE_SIZE
      )
      batchImagesArray.set(image, i * this.IMAGE_SIZE)

      const label = data[1].slice(
        idx * this.NUM_CLASSES,
        idx * this.NUM_CLASSES + this.NUM_CLASSES
      )
      batchLabelsArray.set(label, i * this.NUM_CLASSES)
    }

    const xs = tf.tensor2d(batchImagesArray, [batchSize, this.IMAGE_SIZE])
    const labels = tf.tensor2d(batchLabelsArray, [
      batchSize,
      this.NUM_CLASSES,
    ])

    return { xs, labels }
  }
}

// 创建改进的 CNN 模型（输入24x24图像）
function createModel() {
  const model = tf.sequential()

  // 输入: 24x24x1

  // 第一个卷积块
  model.add(
    tf.layers.conv2d({
      inputShape: [24, 24, 1],
      filters: 32,
      kernelSize: 3,
      activation: 'relu',
      kernelInitializer: 'heNormal',
    })
  )
  model.add(tf.layers.batchNormalization())
  model.add(
    tf.layers.conv2d({
      filters: 32,
      kernelSize: 3,
      activation: 'relu',
      kernelInitializer: 'heNormal',
    })
  )
  model.add(tf.layers.maxPooling2d({ poolSize: 2 })) // 24 -> 12
  model.add(tf.layers.dropout({ rate: 0.25 }))

  // 第二个卷积块
  model.add(
    tf.layers.conv2d({
      filters: 64,
      kernelSize: 3,
      activation: 'relu',
      kernelInitializer: 'heNormal',
    })
  )
  model.add(tf.layers.batchNormalization())
  model.add(
    tf.layers.conv2d({
      filters: 64,
      kernelSize: 3,
      activation: 'relu',
      kernelInitializer: 'heNormal',
    })
  )
  model.add(tf.layers.maxPooling2d({ poolSize: 2 })) // 12 -> 6
  model.add(tf.layers.dropout({ rate: 0.25 }))

  // 全连接层
  model.add(tf.layers.flatten()) // 6x6x64 = 2304
  model.add(
    tf.layers.dense({
      units: 256,
      activation: 'relu',
      kernelInitializer: 'heNormal',
    })
  )
  model.add(tf.layers.batchNormalization())
  model.add(tf.layers.dropout({ rate: 0.5 }))

  // 输出层
  model.add(
    tf.layers.dense({
      units: 10,
      activation: 'softmax',
    })
  )

  model.compile({
    optimizer: tf.train.adam(0.001),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  })

  return model
}

// 将28x28图像裁剪为24x24
function cropTo24x24(image28) {
  // 从28x28中心裁剪出24x24
  // 裁剪范围: 上边和左边各裁剪2个像素
  return image28.slice([0, 2, 2, 0], [-1, 24, 24, -1])
}

// 批量裁剪28x28图像到24x24
function batchCropTo24x24(images28) {
  // 直接从28x28裁剪到24x24，批量操作更高效
  // 从中心裁剪: 去掉上下左右各2个像素
  // images28 shape: [batch, 28, 28, 1]
  // cropped shape: [batch, 24, 24, 1]

  // 确保输入是4D张量
  if (images28.rank !== 4) {
    throw new Error(`输入必须是4D张量，但实际是 ${images28.rank}D`)
  }

  // 验证形状
  const shape = images28.shape
  if (shape[1] < 24 || shape[2] < 24) {
    throw new Error(`图像太小无法裁剪: ${shape[1]}x${shape[2]}，需要至少 24x24`)
  }

  // 计算裁剪的起始位置（中心裁剪）
  const offsetX = Math.floor((shape[1] - 24) / 2)
  const offsetY = Math.floor((shape[2] - 24) / 2)

  return images28.slice([0, offsetX, offsetY, 0], [-1, 24, 24, -1])
}
