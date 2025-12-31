import { MnistData } from './data.js'

// 全局状态管理
const state = {
  data: null,
  model: null,
  isTraining: false,
  isDataLoaded: false,
  isModelCreated: false,
  trainingHistory: {
    loss: [],
    acc: [],
    val_loss: [],
    val_acc: []
  },
  currentEpoch: 0,
  totalEpochs: 10
}

// UI 元素引用
const ui = {
  loadDataBtn: document.getElementById('loadDataBtn'),
  showExamplesBtn: document.getElementById('showExamplesBtn'),
  createModelBtn: document.getElementById('createModelBtn'),
  trainModelBtn: document.getElementById('trainModelBtn'),
  stopTrainingBtn: document.getElementById('stopTrainingBtn'),
  showAccuracyBtn: document.getElementById('showAccuracyBtn'),
  showConfusionBtn: document.getElementById('showConfusionBtn'),
  exportModelBtn: document.getElementById('exportModelBtn'),
  exportWeightsBtn: document.getElementById('exportWeightsBtn'),
  exportAllBtn: document.getElementById('exportAllBtn'),
  loadModelBtn: document.getElementById('loadModelBtn'),
  modelFileInput: document.getElementById('modelFileInput'),
  dataStatus: document.getElementById('dataStatus'),
  modelStatus: document.getElementById('modelStatus'),
  trainingStatus: document.getElementById('trainingStatus'),
  progressSection: document.getElementById('progressSection'),
  progressFill: document.getElementById('progressFill'),
  metricsGrid: document.getElementById('metricsGrid'),
  trainAcc: document.getElementById('trainAcc'),
  valAcc: document.getElementById('valAcc'),
  trainLoss: document.getElementById('trainLoss'),
  valLoss: document.getElementById('valLoss')
}

// 更新 UI 状态
function updateUI() {
  ui.showExamplesBtn.disabled = !state.isDataLoaded
  ui.createModelBtn.disabled = !state.isDataLoaded
  ui.trainModelBtn.disabled = !state.isModelCreated || state.isTraining
  ui.stopTrainingBtn.disabled = !state.isTraining
  ui.showAccuracyBtn.disabled = !state.isModelCreated
  ui.showConfusionBtn.disabled = !state.isModelCreated
  ui.exportModelBtn.disabled = !state.isModelCreated
  ui.exportWeightsBtn.disabled = !state.isModelCreated
  ui.exportAllBtn.disabled = !state.isModelCreated

  ui.dataStatus.textContent = state.isDataLoaded ? '已加载 ✓' : '未加载'
  ui.dataStatus.style.color = state.isDataLoaded ? '#28a745' : '#667eea'

  ui.modelStatus.textContent = state.isModelCreated ? '已创建 ✓' : '未创建'
  ui.modelStatus.style.color = state.isModelCreated ? '#28a745' : '#667eea'

  ui.trainingStatus.textContent = state.isTraining ? '训练中...' : state.currentEpoch > 0 ? '已完成 ✓' : '未开始'
  ui.trainingStatus.style.color = state.isTraining ? '#ffc107' : state.currentEpoch > 0 ? '#28a745' : '#667eea'
}

// 更新训练进度
function updateProgress(epoch, logs) {
  const progress = (epoch / state.totalEpochs) * 100
  ui.progressFill.style.width = `${progress}%`
  ui.progressFill.textContent = `${Math.round(progress)}%`

  if (logs) {
    ui.trainAcc.textContent = `${(logs.acc * 100).toFixed(2)}%`
    ui.valAcc.textContent = `${(logs.val_acc * 100).toFixed(2)}%`
    ui.trainLoss.textContent = logs.loss.toFixed(4)
    ui.valLoss.textContent = logs.val_loss.toFixed(4)

    state.trainingHistory.loss.push(logs.loss)
    state.trainingHistory.acc.push(logs.acc)
    state.trainingHistory.val_loss.push(logs.val_loss)
    state.trainingHistory.val_acc.push(logs.val_acc)
  }
}

// 加载数据集
async function loadData() {
  try {
    ui.loadDataBtn.disabled = true
    ui.loadDataBtn.textContent = '加载中...'

    state.data = new MnistData()
    await state.data.load()

    state.isDataLoaded = true
    ui.loadDataBtn.textContent = '数据集已加载 ✓'

    updateUI()
    console.log('数据集加载成功!')
  } catch (error) {
    console.error('加载数据集失败:', error)
    ui.loadDataBtn.textContent = '加载失败，请重试'
    ui.loadDataBtn.disabled = false
    alert('加载数据集失败: ' + error.message)
  }
}

// 显示数据示例
async function showExamples() {
  if (!state.data) return

  const surface = tfvis
    .visor()
    .surface({ name: '输入数据示例', tab: '输入数据' })

  const examples = state.data.nextTestBatch(100)
  const numExamples = examples.xs.shape[0]

  for (let i = 0; i < numExamples; i++) {
    const imageTensor = tf.tidy(() => {
      return examples.xs
        .slice([i, 0], [1, examples.xs.shape[1]])
        .reshape([28, 28, 1])
    })

    const canvas = document.createElement('canvas')
    canvas.width = 28
    canvas.height = 28
    canvas.style = 'margin: 4px;'
    await tf.browser.toPixels(imageTensor, canvas)
    surface.drawArea.appendChild(canvas)

    imageTensor.dispose()
  }
}

// 创建模型
function getModel() {
  const model = tf.sequential()

  const IMAGE_WIDTH = 28
  const IMAGE_HEIGHT = 28
  const IMAGE_CHANNELS = 1

  model.add(
    tf.layers.conv2d({
      inputShape: [IMAGE_WIDTH, IMAGE_HEIGHT, IMAGE_CHANNELS],
      kernelSize: 5,
      filters: 8,
      strides: 1,
      activation: 'relu',
      kernelInitializer: 'varianceScaling',
    })
  )

  model.add(tf.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }))

  model.add(
    tf.layers.conv2d({
      kernelSize: 5,
      filters: 16,
      strides: 1,
      activation: 'relu',
      kernelInitializer: 'varianceScaling',
    })
  )
  model.add(tf.layers.maxPooling2d({ poolSize: [2, 2], strides: [2, 2] }))

  model.add(tf.layers.flatten())

  const NUM_OUTPUT_CLASSES = 10
  model.add(
    tf.layers.dense({
      units: NUM_OUTPUT_CLASSES,
      kernelInitializer: 'varianceScaling',
      activation: 'softmax',
    })
  )

  const optimizer = tf.train.adam(0.001)
  model.compile({
    optimizer: optimizer,
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  })

  return model
}

// 创建模型
async function createModel() {
  try {
    state.model = getModel()
    state.isModelCreated = true

    tfvis.show.modelSummary({ name: '模型架构', tab: '模型' }, state.model)

    updateUI()
    console.log('模型创建成功!')
  } catch (error) {
    console.error('创建模型失败:', error)
    alert('创建模型失败: ' + error.message)
  }
}

// 训练模型
async function trainModel() {
  if (!state.model || !state.data) return

  try {
    state.isTraining = true
    state.currentEpoch = 0
    state.trainingHistory = { loss: [], acc: [], val_loss: [], val_acc: [] }

    ui.progressSection.style.display = 'block'
    ui.metricsGrid.style.display = 'grid'

    updateUI()

    const metrics = ['loss', 'val_loss', 'acc', 'val_acc']
    const container = {
      name: '模型训练',
      tab: '模型',
      styles: { height: '1000px' },
    }

    // 获取可视化回调
    const visCallbacks = tfvis.show.fitCallbacks(container, metrics)

    const BATCH_SIZE = 512
    const TRAIN_DATA_SIZE = 5500
    const TEST_DATA_SIZE = 1000

    const [trainXs, trainYs] = tf.tidy(() => {
      const d = state.data.nextTrainBatch(TRAIN_DATA_SIZE)
      return [d.xs.reshape([TRAIN_DATA_SIZE, 28, 28, 1]), d.labels]
    })

    const [testXs, testYs] = tf.tidy(() => {
      const d = state.data.nextTestBatch(TEST_DATA_SIZE)
      return [d.xs.reshape([TEST_DATA_SIZE, 28, 28, 1]), d.labels]
    })

    // 自定义回调以更新 UI
    const customCallbacks = {
      onEpochEnd: async (epoch, logs) => {
        state.currentEpoch = epoch + 1
        updateProgress(epoch + 1, logs)
        updateUI()
      }
    }

    // 合并所有回调
    const allCallbacks = {
      ...visCallbacks,
      ...customCallbacks
    }

    await state.model.fit(trainXs, trainYs, {
      batchSize: BATCH_SIZE,
      validationData: [testXs, testYs],
      epochs: state.totalEpochs,
      shuffle: true,
      callbacks: allCallbacks,
    })

    state.isTraining = false
    updateUI()

    console.log('训练完成!')
    alert('训练完成! 最终准确率: ' + ui.valAcc.textContent)
  } catch (error) {
    console.error('训练失败:', error)
    state.isTraining = false
    updateUI()
    alert('训练失败: ' + error.message)
  }
}

// 停止训练
function stopTraining() {
  if (state.model && state.isTraining) {
    state.model.stopTraining = true
    state.isTraining = false
    updateUI()
    console.log('训练已停止')
  }
}

const classNames = [
  '零', '一', '二', '三', '四',
  '五', '六', '七', '八', '九'
]

function doPrediction(model, data, testDataSize = 500) {
  const IMAGE_WIDTH = 28
  const IMAGE_HEIGHT = 28
  const testData = data.nextTestBatch(testDataSize)
  const testxs = testData.xs.reshape([
    testDataSize,
    IMAGE_WIDTH,
    IMAGE_HEIGHT,
    1,
  ])
  const labels = testData.labels.argMax(-1)
  const preds = model.predict(testxs).argMax(-1)

  testxs.dispose()
  return [preds, labels]
}

// 显示准确率
async function showAccuracy() {
  if (!state.model || !state.data) return

  const [preds, labels] = doPrediction(state.model, state.data)
  const classAccuracy = await tfvis.metrics.perClassAccuracy(labels, preds)
  const container = { name: '准确率', tab: '评估' }
  tfvis.show.perClassAccuracy(container, classAccuracy, classNames)

  labels.dispose()
}

// 显示混淆矩阵
async function showConfusion() {
  if (!state.model || !state.data) return

  const [preds, labels] = doPrediction(state.model, state.data)
  const confusionMatrix = await tfvis.metrics.confusionMatrix(labels, preds)
  const container = { name: '混淆矩阵', tab: '评估' }
  tfvis.render.confusionMatrix(container, {
    values: confusionMatrix,
    tickLabels: classNames,
  })

  labels.dispose()
}

// 导出模型 JSON
async function exportModelJSON() {
  if (!state.model) return

  try {
    const modelJSON = state.model.toJSON()
    const dataStr = JSON.stringify(modelJSON, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `mnist-cnn-model-${Date.now()}.json`
    a.click()

    URL.revokeObjectURL(url)
    console.log('模型 JSON 导出成功!')
    alert('模型 JSON 导出成功!')
  } catch (error) {
    console.error('导出失败:', error)
    alert('导出失败: ' + error.message)
  }
}

// 导出模型权重
async function exportWeights() {
  if (!state.model) return

  try {
    const weights = await state.model.getWeights()
    const weightData = []

    for (let i = 0; i < weights.length; i++) {
      const weight = weights[i]
      const data = await weight.array()
      weightData.push({
        name: state.model.layers[Math.floor(i / 2)].name,
        shape: weight.shape,
        data: data
      })
    }

    const dataStr = JSON.stringify(weightData, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `mnist-cnn-weights-${Date.now()}.json`
    a.click()

    URL.revokeObjectURL(url)
    console.log('权重导出成功!')
    alert('权重导出成功!')
  } catch (error) {
    console.error('导出权重失败:', error)
    alert('导出权重失败: ' + error.message)
  }
}

// 导出完整模型
async function exportFullModel() {
  if (!state.model) return

  try {
    await state.model.save('downloads://mnist-cnn-full-model')
    console.log('完整模型导出成功!')
    alert('完整模型导出成功!\n模型和权重已保存为 .json 和 .bin 文件')
  } catch (error) {
    console.error('导出完整模型失败:', error)
    alert('导出完整模型失败: ' + error.message)
  }
}

// 加载已保存的模型
async function loadSavedModel(event) {
  const file = event.target.files[0]
  if (!file) return

  try {
    const text = await file.text()
    const modelJSON = JSON.parse(text)

    state.model = await tf.models.modelFromJSON(modelJSON)
    state.isModelCreated = true

    tfvis.show.modelSummary({ name: '已加载的模型架构', tab: '模型' }, state.model)

    updateUI()
    console.log('模型加载成功!')
    alert('模型加载成功!\n注意: 此操作只加载了模型结构,不包含权重')
  } catch (error) {
    console.error('加载模型失败:', error)
    alert('加载模型失败: ' + error.message)
  }

  // 清空 input 以允许重新选择同一文件
  event.target.value = ''
}

// 绑定事件监听器
function bindEvents() {
  ui.loadDataBtn.addEventListener('click', loadData)
  ui.showExamplesBtn.addEventListener('click', showExamples)
  ui.createModelBtn.addEventListener('click', createModel)
  ui.trainModelBtn.addEventListener('click', trainModel)
  ui.stopTrainingBtn.addEventListener('click', stopTraining)
  ui.showAccuracyBtn.addEventListener('click', showAccuracy)
  ui.showConfusionBtn.addEventListener('click', showConfusion)
  ui.exportModelBtn.addEventListener('click', exportModelJSON)
  ui.exportWeightsBtn.addEventListener('click', exportWeights)
  ui.exportAllBtn.addEventListener('click', exportFullModel)

  ui.loadModelBtn.addEventListener('click', () => {
    ui.modelFileInput.click()
  })

  ui.modelFileInput.addEventListener('change', loadSavedModel)
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
  bindEvents()
  updateUI()
  console.log('CNN 手写数字识别应用已启动')
})
