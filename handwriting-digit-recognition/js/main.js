// 全局变量
let model
let isDrawing = false
let lastX = 0
let lastY = 0
let currentModelName = 'mnist-cnn-model-v2'
const canvas = document.getElementById('drawCanvas')
const ctx = canvas.getContext('2d')

// 模型管理
const MODEL_STORAGE_PREFIX = 'mnist-model-'
let savedModels = []

// ==================== 页签切换功能 ====================
function switchTab(tabName) {
  // 移除所有活动状态
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.remove('active')
  })
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.remove('active')
  })

  // 激活选中的页签
  if (tabName === 'recognize') {
    document.querySelector('.tab-btn:first-child').classList.add('active')
    document.getElementById('tab-recognize').classList.add('active')
  } else if (tabName === 'training') {
    document.querySelectorAll('.tab-btn')[1].classList.add('active')
    document.getElementById('tab-training').classList.add('active')
  } else if (tabName === 'testing') {
    document.querySelectorAll('.tab-btn')[2].classList.add('active')
    document.getElementById('tab-testing').classList.add('active')
  }
}

// ==================== 模型管理 ====================
// 预定义模型列表（从 models 目录）
const predefinedModels = [
  {
    name: 'mnist-cnn-full-model',
    path: 'models/mnist-cnn-full-model.json',
    description: '5000样本训练（推荐）',
    isDefault: true
  },
  {
    name: 'mnist-trained-28x28-1767150554786',
    path: 'models/mnist-trained-28x28-1767150554786.json',
    description: '10000样本训练',
    isDefault: false
  }
]

// 获取所有可用的模型（预定义 + 本地存储）
function getSavedModels() {
  const models = []

  // 添加预定义模型
  predefinedModels.forEach(model => {
    models.push({
      name: model.name,
      path: model.path,
      description: model.description,
      isPredefined: true
    })
  })

  // 添加本地存储的模型
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key.startsWith(MODEL_STORAGE_PREFIX)) {
      const name = key.replace(MODEL_STORAGE_PREFIX, '')
      // 避免重复（本地存储的模型可能与预定义模型同名）
      if (!models.find(m => m.name === name)) {
        models.push({
          name: name,
          description: '本地存储',
          isPredefined: false
        })
      }
    }
  }

  return models
}

// 更新模型列表显示
function updateModelList() {
  savedModels = getSavedModels()
  const listEl = document.getElementById('modelList')

  if (savedModels.length === 0) {
    listEl.innerHTML =
      '<div style="text-align: center; color: #999; padding: 20px;">暂无可用模型</div>'
    return
  }

  listEl.innerHTML = savedModels
    .map(
      model => {
        const isActive = model.name === currentModelName
        const deleteBtn = !model.isPredefined ?
          `<button class="model-item-delete" onclick="deleteModel('${model.name}', event)">删除</button>` :
          ''

        return `
          <div class="model-item ${isActive ? 'active' : ''}" onclick="loadModel('${model.name}', '${model.path || ''}', ${model.isPredefined})">
            <div class="model-item-info">
              <span class="model-item-name">${model.name}</span>
              <span class="model-item-desc">${model.description}</span>
            </div>
            ${deleteBtn}
          </div>
        `
      }
    )
    .join('')
}

// 加载指定模型
async function loadModel(modelName, modelPath = '', isPredefined = false) {
  try {
    updateStatus('正在加载模型: ' + modelName, 'loading')

    if (isPredefined && modelPath) {
      // 加载预定义模型文件（包含权重）
      model = await tf.loadLayersModel(modelPath)
      currentModelName = modelName
      updateStatus('预训练模型 "' + modelName + '" 加载完成！', 'ready')
    } else {
      // 加载本地存储的模型
      const modelData = localStorage.getItem(
        MODEL_STORAGE_PREFIX + modelName
      )
      if (!modelData) {
        throw new Error('模型不存在')
      }

      const modelArtifacts = JSON.parse(modelData)
      model = await tf.models.modelFromJSON(modelArtifacts)
      currentModelName = modelName
      updateStatus('本地模型 "' + modelName + '" 加载完成！', 'ready')
    }

    document.getElementById('predictBtn').disabled = false
    updateModelList()
  } catch (error) {
    console.error('加载模型失败:', error)
    updateStatus('加载模型失败: ' + error.message, 'error')
  }
}

// 删除模型（仅本地存储的模型可删除）
function deleteModel(modelName, event) {
  event.stopPropagation()

  if (confirm('确定要删除模型 "' + modelName + '" 吗？')) {
    localStorage.removeItem(MODEL_STORAGE_PREFIX + modelName)
    updateModelList()

    if (modelName === currentModelName) {
      model = null
      document.getElementById('predictBtn').disabled = true
      updateStatus('当前模型已删除，请选择其他模型', 'error')
    }
  }
}

// 处理模型上传
async function handleModelUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  document.getElementById('uploadFileName').textContent = file.name

  try {
    updateStatus('正在解析模型文件...', 'loading')

    const reader = new FileReader()
    reader.onload = async e => {
      try {
        const modelData = JSON.parse(e.target.result)

        // 从文件名提取模型名（去掉.json后缀）
        let modelName = file.name.replace('.json', '')

        // 保存到localStorage
        localStorage.setItem(
          MODEL_STORAGE_PREFIX + modelName,
          JSON.stringify(modelData)
        )

        updateStatus('模型 "' + modelName + '" 上传成功！', 'ready')
        updateModelList()

        // 询问是否加载该模型
        if (
          confirm('模型 "' + modelName + '" 已保存，是否现在加载使用？')
        ) {
          await loadModel(modelName)
        }
      } catch (error) {
        console.error('解析模型文件失败:', error)
        updateStatus('解析模型文件失败: ' + error.message, 'error')
      }
    }
    reader.readAsText(file)
  } catch (error) {
    console.error('上传模型失败:', error)
    updateStatus('上传模型失败: ' + error.message, 'error')
  }

  // 清空文件选择
  event.target.value = ''
}

// ==================== 画布功能 ====================
// 初始化画布
function initCanvas() {
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.strokeStyle = 'black'
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = 15

  canvas.addEventListener('mousedown', startDrawing)
  canvas.addEventListener('mousemove', draw)
  canvas.addEventListener('mouseup', stopDrawing)
  canvas.addEventListener('mouseout', stopDrawing)

  canvas.addEventListener('touchstart', handleTouchStart)
  canvas.addEventListener('touchmove', handleTouchMove)
  canvas.addEventListener('touchend', stopDrawing)

  const brushSizeSlider = document.getElementById('brushSize')
  brushSizeSlider.addEventListener('input', e => {
    ctx.lineWidth = e.target.value
    document.getElementById('brushSizeValue').textContent = e.target.value
  })
}

function startDrawing(e) {
  isDrawing = true
  ;[lastX, lastY] = [e.offsetX, e.offsetY]
}

function draw(e) {
  if (!isDrawing) return
  ctx.beginPath()
  ctx.moveTo(lastX, lastY)
  ctx.lineTo(e.offsetX, e.offsetY)
  ctx.stroke()
  ;[lastX, lastY] = [e.offsetX, e.offsetY]
}

function stopDrawing() {
  isDrawing = false
}

function handleTouchStart(e) {
  e.preventDefault()
  const touch = e.touches[0]
  const rect = canvas.getBoundingClientRect()
  isDrawing = true
  lastX = touch.clientX - rect.left
  lastY = touch.clientY - rect.top
}

function handleTouchMove(e) {
  e.preventDefault()
  if (!isDrawing) return
  const touch = e.touches[0]
  const rect = canvas.getBoundingClientRect()
  const x = touch.clientX - rect.left
  const y = touch.clientY - rect.top
  ctx.beginPath()
  ctx.moveTo(lastX, lastY)
  ctx.lineTo(x, y)
  ctx.stroke()
  lastX = x
  lastY = y
}

function clearCanvas() {
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  document.getElementById('prediction').textContent = '-'
  document.getElementById('confidenceValue').textContent = '0%'
  document.getElementById('confidenceFill').style.width = '0%'
  resetProbGrid()
}

function resetProbGrid() {
  const probItems = document.querySelectorAll('.prob-item')
  probItems.forEach(item => {
    item.classList.remove('active')
    item.querySelector('.prob-value').textContent = '0%'
  })
}

// ==================== 预测功能 ====================
// 预处理图像（转换为28x28，适配CNN模型）
function preprocessImage() {
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = 280
  tempCanvas.height = 280
  const tempCtx = tempCanvas.getContext('2d')

  // 复制原始画布内容
  tempCtx.drawImage(canvas, 0, 0)

  // 获取图像数据
  const imageData = tempCtx.getImageData(0, 0, 280, 280)
  const data = imageData.data

  // 找到数字的边界（自动裁剪）
  let minX = 280, minY = 280, maxX = 0, maxY = 0
  let found = false

  for (let y = 0; y < 280; y++) {
    for (let x = 0; x < 280; x++) {
      const idx = (y * 280 + x) * 4
      // 检测是否有黑色笔画（RGB值小于255）
      if (data[idx] < 250 || data[idx + 1] < 250 || data[idx + 2] < 250) {
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
        found = true
      }
    }
  }

  // 如果没有找到内容，返回全黑图像
  if (!found) {
    minX = 0
    minY = 0
    maxX = 279
    maxY = 279
  }

  // 添加一些边距
  const padding = 10
  minX = Math.max(0, minX - padding)
  minY = Math.max(0, minY - padding)
  maxX = Math.min(279, maxX + padding)
  maxY = Math.min(279, maxY + padding)

  const contentWidth = maxX - minX + 1
  const contentHeight = maxY - minY + 1

  // 创建新的画布用于居中处理
  const centeredCanvas = document.createElement('canvas')
  centeredCanvas.width = 280
  centeredCanvas.height = 280
  const centeredCtx = centeredCanvas.getContext('2d')

  // 填充白色背景
  centeredCtx.fillStyle = 'white'
  centeredCtx.fillRect(0, 0, 280, 280)

  // 计算居中位置
  const offsetX = Math.floor((280 - contentWidth) / 2)
  const offsetY = Math.floor((280 - contentHeight) / 2)

  // 将裁剪后的数字绘制到中心
  centeredCtx.drawImage(
    tempCanvas,
    minX, minY, contentWidth, contentHeight,
    offsetX, offsetY, contentWidth, contentHeight
  )

  // 创建最终的小画布（28x28）
  const finalCanvas = document.createElement('canvas')
  finalCanvas.width = 28
  finalCanvas.height = 28
  const finalCtx = finalCanvas.getContext('2d')

  // 缩放到28x28
  finalCtx.drawImage(centeredCanvas, 0, 0, 280, 280, 0, 0, 28, 28)

  // 获取像素数据并进行反色处理（白底黑字 -> 黑底白字）
  const finalImageData = finalCtx.getImageData(0, 0, 28, 28)
  const finalData = finalImageData.data

  for (let i = 0; i < finalData.length; i += 4) {
    // 反色：255 - 原值
    const inverted = 255 - finalData[i]
    finalData[i] = inverted      // R
    finalData[i + 1] = inverted  // G
    finalData[i + 2] = inverted  // B
    // Alpha 保持 255
  }

  finalCtx.putImageData(finalImageData, 0, 0)

  // 创建张量
  const tensor = tf.browser
    .fromPixels(finalCanvas, 1)
    .toFloat()
    .div(255.0)  // 归一化到 [0, 1]
    .expandDims(0)  // 添加批次维度: [1, 28, 28, 1]

  return tensor
}

// 预测
async function predict() {
  if (!model) {
    alert('模型尚未加载完成')
    return
  }

  const input = preprocessImage()
  const predictions = await model.predict(input).data()
  input.dispose()

  const maxProb = Math.max(...predictions)
  const predictedDigit = predictions.indexOf(maxProb)

  document.getElementById('prediction').textContent = predictedDigit
  const confidence = (maxProb * 100).toFixed(1)
  document.getElementById('confidenceValue').textContent =
    confidence + '%'
  document.getElementById('confidenceFill').style.width = confidence + '%'

  const probItems = document.querySelectorAll('.prob-item')
  probItems.forEach((item, index) => {
    item.classList.remove('active')
    const prob = (predictions[index] * 100).toFixed(1)
    item.querySelector('.prob-value').textContent = prob + '%'
    if (index === predictedDigit) {
      item.classList.add('active')
    }
  })
}

// ==================== 训练功能 ====================
// 另存为模型（完整模型，包含权重）
async function saveModelAs() {
  if (!model) {
    alert('没有可保存的模型，请先训练或加载模型')
    return
  }

  const modelName = prompt('请输入模型名称（将保存为 .json 和 .bin 文件）:', currentModelName)
  if (!modelName) return

  if (modelName.trim() === '') {
    alert('模型名称不能为空')
    return
  }

  const safeName = modelName.trim()

  try {
    // 询问保存方式
    const saveType = confirm(
      '选择保存方式:\n\n' +
      '点击"确定" - 下载为文件（推荐，包含完整权重）\n' +
      '点击"取消" - 保存到浏览器本地存储（仅结构和权重，容量受限）'
    )

    if (saveType) {
      // 下载为文件（包含完整权重）
      updateStatus('正在保存模型到文件...', 'loading')

      // 保存到 models 目录
      await model.save(`downloads://${safeName}`)

      updateStatus(`模型已保存为 ${safeName}.json 和 ${safeName}.bin（包含权重）`, 'ready')

      alert(`模型已成功下载！\n\n` +
            `文件名: ${safeName}.json 和 ${safeName}.bin\n` +
            `请将这些文件放到项目的 models 目录下以供加载。`)
    } else {
      // 保存到 localStorage（仅模型结构和权重，JSON格式）
      updateStatus('正在保存模型到本地存储...', 'loading')

      const modelJSON = await model.toJSON(undefined, false)
      localStorage.setItem(
        MODEL_STORAGE_PREFIX + safeName,
        JSON.stringify(modelJSON)
      )

      currentModelName = safeName
      updateStatus('模型已保存到本地存储 "' + safeName + '"', 'ready')
      updateModelList()

      alert(`模型已保存到浏览器本地存储！\n\n` +
            `注意: 本地存储有容量限制，建议使用下载文件的方式。`)
    }
  } catch (error) {
    console.error('保存模型失败:', error)
    alert('保存模型失败: ' + error.message + '\n\n提示: 浏览器可能阻止了下载，请允许下载文件。')
    updateStatus('保存模型失败', 'error')
  }
}

// ==================== 状态更新 ====================
function updateStatus(message, type) {
  const statusEl = document.getElementById('statusMessage')
  statusEl.textContent = message
  statusEl.className = 'status-message status-' + type
}

// ==================== 初始化 ====================
async function init() {
  initCanvas()
  updateModelList()

  try {
    // 默认加载5000样本训练的模型（mnist-cnn-full-model）
    updateStatus('正在加载预训练模型（5000样本）...', 'loading')

    // 使用 TensorFlow.js 的 loadLayersModel 加载完整模型
    // 这会自动加载 .json 和 .bin 文件
    model = await tf.loadLayersModel('models/mnist-cnn-full-model.json')
    currentModelName = 'mnist-cnn-full-model'

    updateStatus('预训练模型加载完成！（5000样本训练，包含权重）', 'ready')
    document.getElementById('predictBtn').disabled = false
    updateModelList() // 更新列表以显示当前激活的模型

    console.log('预训练模型加载成功，包含以下层:')
    model.layers.forEach((layer, index) => {
      console.log(`  ${index + 1}. ${layer.name} (${layer.getClassName()})`)
    })
    console.log('模型权重已加载，可以直接用于预测')
  } catch (e) {
    console.error('加载预训练模型失败:', e)
    updateStatus('加载预训练模型失败，请手动选择模型或训练新模型', 'error')
  }
}

window.addEventListener('load', init)

// ==================== 样本集测试功能 ====================
// 全局变量
let testData = null // 用于存储测试集数据

// 开始样本测试
async function startSampleTesting() {
  if (!model) {
    alert('模型尚未加载，请先加载或训练模型')
    return
  }

  const sampleCount = parseInt(document.getElementById('testSampleCount').value) || 50

  if (sampleCount < 1 || sampleCount > 500) {
    alert('测试样本数量必须在 1-500 之间')
    return
  }

  const startTestBtn = document.getElementById('startTestBtn')
  startTestBtn.disabled = true

  // 显示进度
  document.getElementById('testProgressContainer').style.display = 'block'
  document.getElementById('testResultsSection').style.display = 'none'
  document.getElementById('testProgressFill').style.width = '0%'
  document.getElementById('testProgressText').textContent = '正在准备测试数据...'

  try {
    // 加载测试数据（如果还没加载）
    if (!testData) {
      document.getElementById('testProgressText').textContent = '正在加载 MNIST 测试集...'

      const mnistData = new MnistData()
      await mnistData.load()

      // 获取测试集数据（保持28x28，不裁剪）
      const testSize = 10000
      const rawData = mnistData.nextTestBatch(testSize)
      const testXs = rawData.xs.reshape([testSize, 28, 28, 1])
      const testYs = rawData.labels

      testData = {
        xs: testXs,
        labels: testYs,
        size: testSize
      }
    }

    document.getElementById('testProgressText').textContent = `正在测试 ${sampleCount} 个样本...`

    // 随机选择样本索引
    const indices = []
    const usedIndices = new Set()

    while (indices.length < sampleCount && indices.length < testData.size) {
      const idx = Math.floor(Math.random() * testData.size)
      if (!usedIndices.has(idx)) {
        usedIndices.add(idx)
        indices.push(idx)
      }
    }

    // 测试每个样本
    const results = []
    let correctCount = 0

    for (let i = 0; i < indices.length; i++) {
      const idx = indices[i]

      // 更新进度
      const progress = (((i + 1) / indices.length) * 100).toFixed(0)
      document.getElementById('testProgressFill').style.width = progress + '%'
      document.getElementById('testProgressText').textContent =
        `测试中... ${progress}% (${i + 1}/${indices.length})`

      // 获取样本
      const sampleX = testData.xs.gather([idx])
      const sampleY = testData.labels.gather([idx])

      // 预测
      const pred = await model.predict(sampleX).data()
      const predictedDigit = pred.indexOf(Math.max(...pred))
      const confidence = (Math.max(...pred) * 100).toFixed(1)

      // 获取实际标签
      const labelArray = Array.from(sampleY.dataSync())
      const actualDigit = labelArray.indexOf(1)

      const isCorrect = predictedDigit === actualDigit
      if (isCorrect) correctCount++

      // 克隆图像数据用于显示（转换为普通数组）
      const image2D = sampleX.squeeze()
      const pixels = Array.from(image2D.mul(255).dataSync())
      image2D.dispose()

      // 保存结果
      results.push({
        index: idx,
        imagePixels: pixels,  // 保存像素数据而不是 tensor
        actual: actualDigit,
        predicted: predictedDigit,
        confidence: confidence,
        correct: isCorrect
      })

      // 清理
      sampleX.dispose()
      sampleY.dispose()

      // 让浏览器有机会更新UI
      if (i % 5 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0))
      }
    }

    // 显示结果
    displayTestResults(results, correctCount, sampleCount)

    document.getElementById('testProgressText').textContent =
      `测试完成！准确率: ${((correctCount / sampleCount) * 100).toFixed(1)}%`

  } catch (error) {
    console.error('测试失败:', error)
    alert('测试失败: ' + error.message)
  } finally {
    startTestBtn.disabled = false
  }
}

// 显示测试结果
function displayTestResults(results, correctCount, totalCount) {
  const wrongCount = totalCount - correctCount
  const accuracy = ((correctCount / totalCount) * 100).toFixed(1)

  // 更新统计信息
  document.getElementById('statTotal').textContent = totalCount
  document.getElementById('statCorrect').textContent = correctCount
  document.getElementById('statWrong').textContent = wrongCount
  document.getElementById('statAccuracy').textContent = accuracy + '%'

  // 显示样本详情
  const samplesGrid = document.getElementById('samplesGrid')
  samplesGrid.innerHTML = ''

  results.forEach((result) => {
    const card = createSampleCard(result)
    samplesGrid.appendChild(card)
  })

  // 显示结果区域
  document.getElementById('testResultsSection').style.display = 'block'
}

// 创建样本卡片
function createSampleCard(result) {
  const card = document.createElement('div')
  card.className = `sample-card ${result.correct ? 'correct' : 'wrong'}`

  // 创建图片 canvas
  const canvasContainer = document.createElement('div')
  canvasContainer.className = 'sample-image-container'

  const canvas = document.createElement('canvas')
  canvas.className = 'sample-image'
  canvas.width = 56
  canvas.height = 56

  const ctx = canvas.getContext('2d')

  // 绘制图片
  try {
    const pixels = result.imagePixels
    const imageData = ctx.createImageData(28, 28)

    for (let i = 0; i < pixels.length; i++) {
      const pixelValue = Math.floor(pixels[i])
      const dataIndex = i * 4
      imageData.data[dataIndex] = pixelValue
      imageData.data[dataIndex + 1] = pixelValue
      imageData.data[dataIndex + 2] = pixelValue
      imageData.data[dataIndex + 3] = 255
    }

    // 创建临时 canvas 并放大
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = 28
    tempCanvas.height = 28
    const tempCtx = tempCanvas.getContext('2d')
    tempCtx.putImageData(imageData, 0, 0)

    // 放大绘制到主画布 (28 -> 56)
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(tempCanvas, 0, 0, 56, 56)
  } catch (error) {
    console.error('绘制图片失败:', error)
  }

  canvasContainer.appendChild(canvas)

  // 创建信息区域
  const infoDiv = document.createElement('div')
  infoDiv.className = 'sample-info'

  const indexDiv = document.createElement('div')
  indexDiv.className = 'sample-index'
  indexDiv.textContent = `样本索引: ${result.index}`

  const valuesDiv = document.createElement('div')
  valuesDiv.className = 'sample-values'

  const actualValue = document.createElement('div')
  actualValue.className = 'sample-value'
  actualValue.innerHTML = `
    <span class="sample-value-label">实际值</span>
    <span class="sample-value-number actual">${result.actual}</span>
  `

  const predictedValue = document.createElement('div')
  predictedValue.className = 'sample-value'
  predictedValue.innerHTML = `
    <span class="sample-value-label">预测值</span>
    <span class="sample-value-number predicted">${result.predicted}</span>
  `

  valuesDiv.appendChild(actualValue)
  valuesDiv.appendChild(predictedValue)

  const confidenceDiv = document.createElement('div')
  confidenceDiv.className = 'sample-confidence'
  confidenceDiv.textContent = `置信度: ${result.confidence}%`

  const statusIcon = document.createElement('div')
  statusIcon.style.fontSize = '12px'
  statusIcon.style.marginTop = '5px'
  statusIcon.textContent = result.correct ? '✓ 正确' : '✗ 错误'

  infoDiv.appendChild(indexDiv)
  infoDiv.appendChild(valuesDiv)
  infoDiv.appendChild(confidenceDiv)
  infoDiv.appendChild(statusIcon)

  card.appendChild(canvasContainer)
  card.appendChild(infoDiv)

  return card
}
