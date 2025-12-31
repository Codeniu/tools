// 训练可视化图表实例
let charts = {
  loss: null,
  accuracy: null,
  testAccuracy: null,
  confusionMatrix: null
}

// 训练历史数据
let trainingHistory = {
  iterations: [],
  loss: [],
  overallAcc: []  // 整体训练集准确率
}

// 测试历史数据
let testHistory = {
  iterations: [],
  testAcc: [],
  correctCount: []
}

// 开始训练（使用28x28输入，与预训练模型一致）
async function startTraining() {
  const totalIterations = parseInt(document.getElementById('trainEpochs').value) * 1000 || 10000
  const batchSize = parseInt(document.getElementById('batchSize').value) || 512
  const updateInterval = batchSize

  const trainBtn = document.getElementById('trainBtn')
  trainBtn.disabled = true

  // 显示进度和可视化
  document.getElementById('progressContainer').style.display = 'block'
  document.getElementById('trainingVisualization').style.display = 'block'

  // 重置历史数据
  trainingHistory = {
    iterations: [],
    loss: [],
    overallAcc: []
  }
  testHistory = {
    iterations: [],
    testAcc: [],
    correctCount: []
  }

  // 初始化图表
  initCharts()

  try {
    updateStatus('正在创建模型架构...', 'loading')
    // 创建28x28输入的模型
    model = createModel28x28()

    // 加载MNIST数据集
    const mnistData = new MnistData()
    await mnistData.load()

    // 准备训练和测试数据（使用28x28，不裁剪）
    const trainSize = Math.min(55000, totalIterations)
    updateStatus(`正在准备${trainSize}个训练样本...`, 'loading')

    // 获取训练数据（保持28x28）
    const trainData = mnistData.nextTrainBatch(trainSize)
    const trainXs = trainData.xs.reshape([trainSize, 28, 28, 1])
    const trainYs = trainData.labels

    // 获取测试数据（保持28x28）
    const testSize = 5000
    const testData = mnistData.nextTestBatch(testSize)
    const testXs = testData.xs.reshape([testSize, 28, 28, 1])
    const testYs = testData.labels

    // 显示第一个训练图片
    displayTrainingImage28x28(trainXs, 0, trainSize)

    updateStatus(`开始训练... 总计${totalIterations}次`, 'loading')

    const startTime = Date.now()

    // 训练循环
    let correctCount = 0  // 累计正确预测次数

    for (let iteration = 0; iteration < totalIterations; iteration++) {
      // 随机选择一个训练样本
      const sampleIndex = Math.floor(Math.random() * trainSize)

      // 使用gather获取单个样本
      const sampleX = trainXs.gather([sampleIndex])
      const sampleY = trainYs.gather([sampleIndex])

      // 训练单个样本
      const history = await model.fit(sampleX, sampleY, {
        batchSize: 1,
        epochs: 1,
        verbose: 0
      })

      // 训练后预测，统计整体准确率
      const pred = await model.predict(sampleX).data()
      const predictedDigit = pred.indexOf(Math.max(...pred))
      const labelArray = Array.from(sampleY.dataSync())
      const actualDigit = labelArray.indexOf(1)

      if (predictedDigit === actualDigit) {
        correctCount++
      }

      sampleX.dispose()
      sampleY.dispose()

      // 记录损失
      const currentLoss = history.history.loss[0]

      // 每完成10次训练，记录数据
      if (iteration % 10 === 0 || iteration === totalIterations - 1) {
        trainingHistory.iterations.push(iteration + 1)
        trainingHistory.loss.push(currentLoss.toFixed(4))

        // 计算并记录整体准确率
        const overallAcc = ((correctCount / (iteration + 1)) * 100).toFixed(2)
        trainingHistory.overallAcc.push(overallAcc)

        // 更新显示
        const currentTime = Date.now()
        const elapsedTime = ((currentTime - startTime) / 1000).toFixed(1)
        const progress = (((iteration + 1) / totalIterations) * 100).toFixed(0)

        document.getElementById('progressFill').style.width = progress + '%'
        document.getElementById('progressText').textContent =
          `训练中... ${progress}% (${iteration + 1}/${totalIterations}, 已用时: ${elapsedTime}秒)`

        updateMetricsDisplay({
          loss: currentLoss
        }, elapsedTime)

        updateCharts()
      }

      // 每100次训练，可视化网络状态
      if ((iteration + 1) % 100 === 0) {
        visualizeNetworkState(iteration + 1)
        displayTrainingImage28x28(trainXs, Math.floor(Math.random() * trainSize), trainSize)
      }

      // 每1000次训练，测试100个样本并更新混淆矩阵
      if ((iteration + 1) % 1000 === 0 || iteration === totalIterations - 1) {
        await testRandomSamples(testXs, testYs, iteration + 1)
        await updateConfusionMatrix(testXs, testYs)
      }

      // 让浏览器有机会更新UI
      if (iteration % 10 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0))
      }
    }

    // 清理内存
    trainXs.dispose()
    trainYs.dispose()
    testXs.dispose()
    testYs.dispose()

    currentModelName = 'mnist-trained-28x28-' + Date.now()
    updateStatus('模型训练完成！请使用"另存为模型"保存完整模型（包含权重）', 'ready')
    document.getElementById('predictBtn').disabled = false
  } catch (error) {
    console.error('训练失败:', error)
    updateStatus('训练失败: ' + error.message, 'error')
  } finally {
    trainBtn.disabled = false
  }
}

// 创建28x28输入的CNN模型
function createModel28x28() {
  const model = tf.sequential()

  // 输入: 28x28x1

  // 第一个卷积块
  model.add(
    tf.layers.conv2d({
      inputShape: [28, 28, 1],
      filters: 8,
      kernelSize: 5,
      activation: 'relu',
      kernelInitializer: 'varianceScaling',
    })
  )
  model.add(tf.layers.maxPooling2d({ poolSize: 2 })) // 28 -> 14

  // 第二个卷积块
  model.add(
    tf.layers.conv2d({
      filters: 16,
      kernelSize: 5,
      activation: 'relu',
      kernelInitializer: 'varianceScaling',
    })
  )
  model.add(tf.layers.maxPooling2d({ poolSize: 2 })) // 14 -> 7

  // 展平层
  model.add(tf.layers.flatten()) // 7x7x16 = 784

  // 全连接层
  model.add(
    tf.layers.dense({
      units: 128,
      activation: 'relu',
      kernelInitializer: 'varianceScaling',
    })
  )
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

// 可视化网络状态
function visualizeNetworkState(iteration) {
  try {
    // 获取模型的层权重
    const layers = model.layers
    let networkInfo = `<strong>训练迭代: ${iteration}</strong><br>`
    networkInfo += `<strong>网络结构:</strong><br>`

    layers.forEach((layer, index) => {
      const layerConfig = layer.getConfig()
      const layerName = layer.name || `Layer_${index}`

      if (layerConfig.filters) {
        networkInfo += `  ${layerName}: Conv2D (${layerConfig.filters} filters, ${layerConfig.kernelSize}x${layerConfig.kernelSize})<br>`
      } else if (layerConfig.units) {
        networkInfo += `  ${layerName}: Dense (${layerConfig.units} units)<br>`
      } else if (layer.poolSize) {
        networkInfo += `  ${layerName}: MaxPooling (${layer.poolSize}x${layer.poolSize})<br>`
      } else if (layer.rate !== undefined) {
        networkInfo += `  ${layerName}: Dropout (${(layer.rate * 100).toFixed(0)}%)<br>`
      } else {
        networkInfo += `  ${layerName}: ${layer.className}<br>`
      }
    })

    // 更新网络信息显示
    const networkInfoDiv = document.getElementById('networkInfo')
    if (networkInfoDiv) {
      networkInfoDiv.innerHTML = networkInfo
    }
  } catch (error) {
    console.error('可视化网络状态失败:', error)
  }
}

// 测试随机样本
async function testRandomSamples(testXs, testYs, iteration) {
  try {
    const numSamples = 100
    const indices = []
    const predictions = []
    const labels = []

    // 随机选择100个样本
    for (let i = 0; i < numSamples; i++) {
      const randomIndex = Math.floor(Math.random() * testXs.shape[0])
      indices.push(randomIndex)

      // 使用gather而不是slice
      const testX = testXs.gather([randomIndex])
      const testY = testYs.gather([randomIndex])

      const pred = await model.predict(testX).data()
      predictions.push(pred)
      labels.push(Array.from(testY.dataSync()))

      testX.dispose()
      testY.dispose()
    }

    // 统计正确数量
    let correctCount = 0
    const results = []

    for (let i = 0; i < numSamples; i++) {
      const predictedDigit = predictions[i].indexOf(Math.max(...predictions[i]))
      const actualDigit = labels[i].indexOf(1)

      const isCorrect = predictedDigit === actualDigit
      if (isCorrect) correctCount++

      results.push({
        index: indices[i],
        predicted: predictedDigit,
        actual: actualDigit,
        correct: isCorrect,
        confidence: (predictions[i][predictedDigit] * 100).toFixed(1)
      })
    }

    const accuracy = (correctCount / numSamples * 100).toFixed(1)

    // 更新测试历史
    testHistory.iterations.push(iteration)
    testHistory.testAcc.push(accuracy)
    testHistory.correctCount.push(correctCount)

    // 更新测试结果显示
    updateTestResults(results, correctCount, accuracy, iteration)

    // 更新测试图表
    updateTestCharts()
  } catch (error) {
    console.error('测试失败:', error)
  }
}

// 更新测试结果显示
function updateTestResults(results, correctCount, accuracy, iteration) {
  const testResultsDiv = document.getElementById('testResults')
  if (!testResultsDiv) return

  let html = `<strong>测试结果 (迭代 ${iteration}):</strong><br>`
  html += `正确率: ${accuracy}% (${correctCount}/100)<br>`
  html += `<div style="max-height: 200px; overflow-y: auto; margin-top: 10px;">`
  html += `<table style="width: 100%; font-size: 12px; border-collapse: collapse;">`
  html += `<tr style="background: #f0f0f0; position: sticky; top: 0;">`
  html += `<th style="padding: 5px; border: 1px solid #ddd;">索引</th>`
  html += `<th style="padding: 5px; border: 1px solid #ddd;">预测</th>`
  html += `<th style="padding: 5px; border: 1px solid #ddd;">实际</th>`
  html += `<th style="padding: 5px; border: 1px solid #ddd;">结果</th>`
  html += `<th style="padding: 5px; border: 1px solid #ddd;">置信度</th>`
  html += `</tr>`

  results.forEach(result => {
    const rowStyle = result.correct ? 'background: #d4edda;' : 'background: #f8d7da;'
    html += `<tr style="${rowStyle}">`
    html += `<td style="padding: 5px; border: 1px solid #ddd;">${result.index}</td>`
    html += `<td style="padding: 5px; border: 1px solid #ddd;">${result.predicted}</td>`
    html += `<td style="padding: 5px; border: 1px solid #ddd;">${result.actual}</td>`
    html += `<td style="padding: 5px; border: 1px solid #ddd;">${result.correct ? '✓' : '✗'}</td>`
    html += `<td style="padding: 5px; border: 1px solid #ddd;">${result.confidence}%</td>`
    html += `</tr>`
  })

  html += `</table></div>`

  testResultsDiv.innerHTML = html
}

// 显示训练图片（适配24x24）
function displayTrainingImage(trainXs, index, maxSize) {
  const canvas = document.getElementById('currentImageCanvas')
  const ctx = canvas.getContext('2d')

  // 清除画布
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  try {
    // 确保索引在有效范围内
    const safeIndex = Math.min(index, maxSize - 1)

    // 使用gather获取单张图片 (24, 24, 1)
    const image = trainXs.gather([safeIndex])

    // 转换为 2D tensor (24, 24)
    const image2D = image.squeeze()

    // 获取像素数据并缩放到 0-255
    const pixels = image2D.mul(255).dataSync()

    // 创建 ImageData
    const imageData = ctx.createImageData(24, 24)

    // 填充像素数据（灰度图，所以RGB都是同一个值）
    for (let i = 0; i < pixels.length; i++) {
      const pixelValue = Math.floor(pixels[i])
      const dataIndex = i * 4
      imageData.data[dataIndex] = pixelValue     // R
      imageData.data[dataIndex + 1] = pixelValue // G
      imageData.data[dataIndex + 2] = pixelValue // B
      imageData.data[dataIndex + 3] = 255        // A
    }

    // 将 24x24 的图像绘制到 140x140 的画布上
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = 24
    tempCanvas.height = 24
    const tempCtx = tempCanvas.getContext('2d')
    tempCtx.putImageData(imageData, 0, 0)

    // 放大绘制到主画布
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(tempCanvas, 0, 0, 140, 140)

    // 更新图片信息
    document.getElementById('imageIndex').textContent = safeIndex + 1
    document.getElementById('imageLabel').textContent = '24x24 (裁剪后)'

    // 清理 tensor
    image.dispose()
    image2D.dispose()
  } catch (error) {
    console.error('显示图片失败:', error)
  }
}

// 更新指标显示
function updateMetricsDisplay(logs, elapsedTime) {
  document.getElementById('metricLoss').textContent = logs.loss.toFixed(4)
  document.getElementById('metricTime').textContent = elapsedTime + '秒'
}

// 初始化图表
function initCharts() {
  // 销毁旧图表
  if (charts.loss) charts.loss.destroy()
  if (charts.accuracy) charts.accuracy.destroy()
  if (charts.testAccuracy) charts.testAccuracy.destroy()

  // 创建损失图表
  const lossCtx = document.getElementById('lossChart').getContext('2d')
  charts.loss = new Chart(lossCtx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: '训练损失',
          data: [],
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: '损失值'
          }
        },
        x: {
          title: {
            display: true,
            text: '训练次数'
          }
        }
      }
    }
  })

  // 创建准确率图表
  const accCtx = document.getElementById('accuracyChart').getContext('2d')
  charts.accuracy = new Chart(accCtx, {
    type: 'line',
    data: {
      labels: [],
      datasets: [
        {
          label: '整体训练准确率',
          data: [],
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 0
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          title: {
            display: true,
            text: '准确率 (%)'
          }
        },
        x: {
          title: {
            display: true,
            text: '训练次数'
          }
        }
      }
    }
  })

  // 创建测试准确率图表
  const testCtx = document.getElementById('testChart').getContext('2d')
  if (testCtx) {
    charts.testAccuracy = new Chart(testCtx, {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            label: '测试准确率 (100样本)',
            data: [],
            borderColor: '#f093fb',
            backgroundColor: 'rgba(240, 147, 251, 0.1)',
            fill: true,
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: '准确率 (%)'
            }
          },
          x: {
            title: {
              display: true,
              text: '训练次数'
            }
          }
        }
      }
    })
  }
}

// 更新图表
function updateCharts() {
  // 更新损失图表
  if (charts.loss) {
    charts.loss.data.labels = trainingHistory.iterations
    charts.loss.data.datasets[0].data = trainingHistory.loss
    charts.loss.update('none')
  }

  // 更新准确率图表（使用整体训练准确率）
  if (charts.accuracy) {
    charts.accuracy.data.labels = trainingHistory.iterations
    charts.accuracy.data.datasets[0].data = trainingHistory.overallAcc
    charts.accuracy.update('none')
  }
}

// 更新测试图表
function updateTestCharts() {
  if (charts.testAccuracy) {
    charts.testAccuracy.data.labels = testHistory.iterations
    charts.testAccuracy.data.datasets[0].data = testHistory.testAcc
    charts.testAccuracy.update('none')
  }
}

// 显示28x28训练图片
function displayTrainingImage28x28(trainXs, index, maxSize) {
  const canvas = document.getElementById('currentImageCanvas')
  const ctx = canvas.getContext('2d')

  // 清除画布
  ctx.fillStyle = 'white'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  try {
    // 确保索引在有效范围内
    const safeIndex = Math.min(index, maxSize - 1)

    // 使用gather获取单张图片 (28, 28, 1)
    const image = trainXs.gather([safeIndex])

    // 转换为 2D tensor (28, 28)
    const image2D = image.squeeze()

    // 获取像素数据并缩放到 0-255
    const pixels = image2D.mul(255).dataSync()

    // 创建 ImageData
    const imageData = ctx.createImageData(28, 28)

    // 填充像素数据
    for (let i = 0; i < pixels.length; i++) {
      const pixelValue = Math.floor(pixels[i])
      const dataIndex = i * 4
      imageData.data[dataIndex] = pixelValue     // R
      imageData.data[dataIndex + 1] = pixelValue // G
      imageData.data[dataIndex + 2] = pixelValue // B
      imageData.data[dataIndex + 3] = 255        // A
    }

    // 将 28x28 的图像绘制到 140x140 的画布上
    const tempCanvas = document.createElement('canvas')
    tempCanvas.width = 28
    tempCanvas.height = 28
    const tempCtx = tempCanvas.getContext('2d')
    tempCtx.putImageData(imageData, 0, 0)

    // 放大绘制到主画布
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(tempCanvas, 0, 0, 140, 140)

    // 更新图片信息
    document.getElementById('imageIndex').textContent = safeIndex + 1
    document.getElementById('imageLabel').textContent = '28x28'

    // 清理 tensor
    image.dispose()
    image2D.dispose()
  } catch (error) {
    console.error('显示图片失败:', error)
  }
}

// 更新混淆矩阵
async function updateConfusionMatrix(testXs, testYs) {
  try {
    const numSamples = 1000 // 使用更多样本获得更准确的混淆矩阵
    const indices = []

    // 随机选择样本
    for (let i = 0; i < numSamples; i++) {
      indices.push(Math.floor(Math.random() * testXs.shape[0]))
    }

    // 批量预测
    const predictions = []
    const actualLabels = []

    for (let i = 0; i < indices.length; i++) {
      const testX = testXs.gather([indices[i]])
      const testY = testYs.gather([indices[i]])

      const pred = await model.predict(testX).data()
      predictions.push(pred)
      actualLabels.push(Array.from(testY.dataSync()))

      testX.dispose()
      testY.dispose()
    }

    // 计算混淆矩阵
    const confusionMatrix = Array(10).fill(0).map(() => Array(10).fill(0))
    const perClassCorrect = Array(10).fill(0)
    const perClassTotal = Array(10).fill(0)

    for (let i = 0; i < predictions.length; i++) {
      const predictedDigit = predictions[i].indexOf(Math.max(...predictions[i]))
      const actualDigit = actualLabels[i].indexOf(1)

      confusionMatrix[actualDigit][predictedDigit]++
      perClassTotal[actualDigit]++
      if (predictedDigit === actualDigit) {
        perClassCorrect[actualDigit]++
      }
    }

    // 更新混淆矩阵显示
    displayConfusionMatrix(confusionMatrix)
    displayPerClassAccuracy(perClassCorrect, perClassTotal)

  } catch (error) {
    console.error('更新混淆矩阵失败:', error)
  }
}

// 显示混淆矩阵
function displayConfusionMatrix(matrix) {
  const container = document.getElementById('confusionMatrixContainer')
  if (!container) return

  let html = '<h4>混淆矩阵</h4>'
  html += '<table style="width: 100%; font-size: 11px; border-collapse: collapse; margin-top: 10px;">'
  html += '<tr><th style="border: 1px solid #ddd; padding: 4px;">实际\\预测</th>'

  for (let i = 0; i < 10; i++) {
    html += `<th style="border: 1px solid #ddd; padding: 4px;">${i}</th>`
  }
  html += '</tr>'

  for (let i = 0; i < 10; i++) {
    html += `<tr><td style="border: 1px solid #ddd; padding: 4px; font-weight: bold;">${i}</td>`
    for (let j = 0; j < 10; j++) {
      const value = matrix[i][j]
      const isDiagonal = i === j
      const bgColor = isDiagonal
        ? `rgba(40, 167, 69, ${Math.min(1, value / 100 + 0.2)})`
        : `rgba(220, 53, 69, ${Math.min(1, value / 50 + 0.1)})`
      html += `<td style="border: 1px solid #ddd; padding: 4px; text-align: center; background: ${bgColor};">${value}</td>`
    }
    html += '</tr>'
  }

  html += '</table>'

  container.innerHTML = html
}

// 显示每类准确率
function displayPerClassAccuracy(correct, total) {
  const container = document.getElementById('perClassAccuracyContainer')
  if (!container) return

  let html = '<h4>各类数字准确率</h4>'
  html += '<div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-top: 10px;">'

  for (let i = 0; i < 10; i++) {
    const accuracy = total[i] > 0 ? ((correct[i] / total[i]) * 100).toFixed(1) : 0
    const color = accuracy >= 90 ? '#28a745' : accuracy >= 70 ? '#ffc107' : '#dc3545'
    html += `
      <div style="text-align: center; padding: 8px; background: #f8f9ff; border-radius: 6px;">
        <div style="font-size: 18px; font-weight: bold; color: #667eea;">${i}</div>
        <div style="font-size: 14px; color: ${color}; font-weight: bold;">${accuracy}%</div>
        <div style="font-size: 10px; color: #666;">(${correct[i]}/${total[i]})</div>
      </div>
    `
  }

  html += '</div>'
  container.innerHTML = html
}
