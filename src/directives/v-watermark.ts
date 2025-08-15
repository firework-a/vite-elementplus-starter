import type { Directive } from 'vue'
import { nextTick } from 'vue'

// 扩展 Element 和 HTMLElement 类型
declare global {
  interface Element {
    __watermark_config?: WatermarkConfig
  }

  interface HTMLElement {
    __watermark_config?: WatermarkConfig
    _mutObsParent?: MutationObserver
    _mutObsWatermark?: MutationObserver
    _checkInterval?: ReturnType<typeof setInterval>
  }
}

// 密度类型
type DensityType = 'normal' | 'medium' | 'high'

// 水印配置类型
interface WatermarkConfig {
  text: string
  fontSize: number
  color: string
  rotate: number
  density: DensityType
  zIndex: number
  monitor: boolean
  contentOnly: boolean
  contentSelector: string
}

// 密度参数类型
interface DensityParams {
  xGap: number
  yGap: number
  xOffset: number
  yOffset: number
  staggered: boolean
}

// 默认配置
const DEFAULT_CONFIG: WatermarkConfig = {
  text: 'Watermark',
  fontSize: 32,
  color: 'rgba(180,180,180,0.3)',
  rotate: -30,
  density: 'medium',
  zIndex: 99,
  monitor: true,
  contentOnly: true,
  contentSelector: '.content-container',
}

const watermarkDirective: Directive = {
  async mounted(el: HTMLElement, binding) {
    const config = getConfig(binding.value)
    const targetEl = getTargetElement(el, config)
    await createWatermark(targetEl, config)
  },
  async updated(el: HTMLElement, binding) {
    const config = getConfig(binding.value)
    const targetEl = getTargetElement(el, config)
    await updateWatermark(targetEl, config)
  },
  unmounted(el: HTMLElement) {
    const config = el.__watermark_config || DEFAULT_CONFIG
    const targetEl = getTargetElement(el, config)
    removeWatermark(targetEl)
  },
}

// 获取目标元素
function getTargetElement(el: HTMLElement, config: WatermarkConfig): HTMLElement {
  if (config.contentOnly) {
    const contentEl = el.querySelector(config.contentSelector)
    if (contentEl) {
      // 类型断言确保可以访问自定义属性
      const contentElWithConfig = contentEl as HTMLElement
      contentElWithConfig.__watermark_config = config
      return contentElWithConfig
    }
  }
  el.__watermark_config = config
  return el
}

// 获取合并后的配置
function getConfig(value: string | Partial<WatermarkConfig>): WatermarkConfig {
  return typeof value === 'string'
    ? { ...DEFAULT_CONFIG, text: value }
    : { ...DEFAULT_CONFIG, ...value }
}

// 获取密度参数
function getDensityParams(density: DensityType, fontSize: number): DensityParams {
  const baseGap = fontSize * 2 // 基础间距

  const params: Record<DensityType, DensityParams> = {
    normal: {
      xGap: baseGap * 2, // x轴间距
      yGap: baseGap * 1, // y轴间距
      xOffset: 1.8,
      yOffset: 1.8,
      staggered: false,
    },
    medium: {
      xGap: baseGap * 1.5, // x轴间距
      yGap: baseGap * 0.8, // y轴间距
      xOffset: 1.2,
      yOffset: 1.2,
      staggered: false,
    },
    high: {
      xGap: baseGap * 1, // x轴间距
      yGap: baseGap * 0.6, // y轴间距
      xOffset: 1,
      yOffset: 1,
      staggered: true,
    },
  }

  return params[density] || params.medium
}

// 获取设备像素比
function getPixelRatio(): number {
  return window.devicePixelRatio || 1
}

// 准备画布
function prepareCanvas(width: number, height: number, ratio: number = 1): [CanvasRenderingContext2D, HTMLCanvasElement, number, number] {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  const realWidth = width * ratio
  const realHeight = height * ratio

  canvas.setAttribute('width', `${realWidth}px`)
  canvas.setAttribute('height', `${realHeight}px`)

  ctx.save()
  return [ctx, canvas, realWidth, realHeight]
}

// 创建水印
async function createWatermark(el: HTMLElement, config: WatermarkConfig) {
  const {
    text,
    fontSize,
    color,
    rotate,
    density,
    zIndex,
    monitor,
  } = config

  // 移除旧的水印元素
  const oldWatermarks = el.querySelectorAll('.watermark-container')
  oldWatermarks.forEach(wm => wm.remove())

  // 创建多层水印容器 (主容器和备份容器)
  const watermarkContainers: HTMLDivElement[] = []

  // 创建两个水印层，一个主层，一个备份层
  for (let i = 0; i < 2; i++) {
    const watermarkContainer = document.createElement('div')
    watermarkContainer.className = 'watermark-container'
    watermarkContainer.setAttribute('data-watermark-text', text)
    watermarkContainer.setAttribute('data-watermark-index', String(i))

    // 设置水印容器样式
    Object.assign(watermarkContainer.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      zIndex: String(zIndex),
      pointerEvents: 'none',
      overflow: 'hidden',
    })

    watermarkContainers.push(watermarkContainer)
  }

  // 确保目标元素有定位上下文
  if (getComputedStyle(el).position === 'static') {
    el.style.position = 'relative'
  }

  // 获取密度参数
  const { xGap, yGap } = getDensityParams(density, fontSize)

  // 获取设备像素比
  const ratio = getPixelRatio()

  // 计算水印尺寸
  const width = fontSize * 5
  const height = fontSize * 2

  // 第一步：创建内容画布
  const [ctx, canvas, contentWidth, contentHeight] = prepareCanvas(width, height, ratio)

  // 设置字体和样式
  const mergedFontSize = fontSize * ratio
  ctx.font = `normal normal normal ${mergedFontSize}px/${height}px Inter, "Helvetica Neue", Helvetica, 
            "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", 
            微软雅黑, Arial, sans-serif`
  ctx.fillStyle = color
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // 绘制文字
  ctx.fillText(text, contentWidth / 2, contentHeight / 2)

  // 第二步：创建旋转画布
  const maxSize = Math.max(width, height) * 3 // 确保有足够空间旋转
  const [rCtx, rCanvas, realMaxSize] = prepareCanvas(maxSize, maxSize, ratio)

  // 在旋转画布中心进行旋转
  rCtx.translate(realMaxSize / 2, realMaxSize / 2)
  rCtx.rotate((rotate * Math.PI) / 180)

  // 绘制内容画布到旋转画布
  rCtx.drawImage(canvas, -contentWidth / 2, -contentHeight / 2)

  // 计算旋转后的边界
  const angle = Math.PI / 180 * rotate

  function getRotatePos(x: number, y: number): [number, number] {
    const targetX = x * Math.cos(angle) - y * Math.sin(angle)
    const targetY = x * Math.sin(angle) + y * Math.cos(angle)
    return [targetX, targetY]
  }

  let left = 0
  let right = 0
  let top = 0
  let bottom = 0

  const halfWidth = contentWidth / 2
  const halfHeight = contentHeight / 2

  // 计算四个角的旋转后位置
  const points = [
    [0 - halfWidth, 0 - halfHeight],
    [0 + halfWidth, 0 - halfHeight],
    [0 + halfWidth, 0 + halfHeight],
    [0 - halfWidth, 0 + halfHeight],
  ]

  points.forEach(([x, y]) => {
    const [targetX, targetY] = getRotatePos(x, y)
    left = Math.min(left, targetX)
    right = Math.max(right, targetX)
    top = Math.min(top, targetY)
    bottom = Math.max(bottom, targetY)
  })

  // 计算裁剪区域
  const cutLeft = left + realMaxSize / 2
  const cutTop = top + realMaxSize / 2
  const cutWidth = right - left
  const cutHeight = bottom - top

  // 第三步：创建平铺画布
  const realGapX = xGap * ratio
  const realGapY = yGap * ratio

  // 创建一个2x2的水印单元阵列
  const filledWidth = (cutWidth + realGapX) * 2
  const filledHeight = (cutHeight + realGapY) * 2

  const [fCtx, fCanvas] = prepareCanvas(filledWidth, filledHeight)

  // 绘制水印单元
  function drawImg(targetX = 0, targetY = 0) {
    fCtx.drawImage(
      rCanvas,
      cutLeft,
      cutTop,
      cutWidth,
      cutHeight,
      targetX,
      targetY,
      cutWidth,
      cutHeight,
    )
  }

  // 绘制2x2的水印单元阵列
  drawImg(0, 0)
  drawImg(cutWidth + realGapX, 0)
  drawImg(0, cutHeight + realGapY)
  drawImg(cutWidth + realGapX, cutHeight + realGapY)

  // 将画布转换为背景图像URL
  const dataURL = fCanvas.toDataURL('image/png')

  // 为每个水印容器设置样式和背景
  watermarkContainers.forEach((container) => {
    // 设置水印背景
    container.style.backgroundImage = `url(${dataURL})`
    container.style.backgroundRepeat = 'repeat'
    container.style.backgroundSize = `${filledWidth / ratio}px ${filledHeight / ratio}px`

    // 添加水印容器到目标元素
    el.appendChild(container)
  })

  // 防篡改监控
  if (monitor) {
    // 监控父元素变化
    if (!el._mutObsParent) {
      el._mutObsParent = new MutationObserver((records) => {
        // 检查是否有水印容器被移除
        const removed = records.some(record =>
          Array.from(record.removedNodes).some(
            node => (node as HTMLElement).className === 'watermark-container',
          ),
        )

        // 检查现有水印容器数量
        const currentWatermarks = el.querySelectorAll('.watermark-container')

        // 如果水印被移除或数量不对，重新创建
        if (removed || currentWatermarks.length < 2) {
          createWatermark(el, config)
        }
      })
      el._mutObsParent.observe(el, { childList: true })
    }

    // 监控所有水印容器变化
    if (!el._mutObsWatermark) {
      el._mutObsWatermark = new MutationObserver((records) => {
        // 检查是否有样式被修改
        const styleChanged = records.some(record =>
          record.type === 'attributes'
          && (record.attributeName === 'style' || record.attributeName === 'class'),
        )

        if (styleChanged) {
          // 检查水印容器的背景图像是否被移除
          const containers = el.querySelectorAll('.watermark-container')
          let needsRecreate = false

          containers.forEach((container) => {
            const style = window.getComputedStyle(container as HTMLElement)
            if (!style.backgroundImage || style.backgroundImage === 'none') {
              needsRecreate = true
            }
          })

          if (needsRecreate) {
            createWatermark(el, config)
          }
        }
      })

      // 监控所有水印容器
      watermarkContainers.forEach((container) => {
        el._mutObsWatermark?.observe(container, {
          attributes: true,
          attributeFilter: ['style', 'class'],
        })
      })
    }

    // 定期检查水印是否存在和完整，使用更长的间隔减少资源占用
    const checkInterval = setInterval(() => {
      if (!el.isConnected) {
        // 元素已从DOM中移除，清除定时器
        clearInterval(checkInterval)
        return
      }

      const containers = el.querySelectorAll('.watermark-container')

      // 检查水印容器数量
      if (containers.length < 2) {
        createWatermark(el, config)
        return
      }

      // 检查每个容器的背景图像，但不频繁计算样式
      let needsRecreate = false
      containers.forEach((container) => {
        const style = window.getComputedStyle(container as HTMLElement)
        if (!style.backgroundImage || style.backgroundImage === 'none') {
          needsRecreate = true
        }
      })

      if (needsRecreate) {
        createWatermark(el, config)
      }
    }, 10000) // 每10秒检查一次，减少资源占用

    // 存储定时器ID以便清理
    el._checkInterval = checkInterval
  }

  // 存储配置
  el.__watermark_config = config
}

// 更新水印
async function updateWatermark(el: HTMLElement, config: WatermarkConfig) {
  const watermarkContainer = el.querySelector('.watermark-container')
  const currentText = watermarkContainer?.getAttribute('data-watermark-text')

  if (watermarkContainer && currentText === config.text)
    return

  removeWatermark(el)
  await createWatermark(el, config)
}

// 移除水印
async function removeWatermark(el: HTMLElement) {
  el.setAttribute('data-focus-remove', 'true')

  // 断开所有观察器
  el._mutObsParent?.disconnect()
  el._mutObsWatermark?.disconnect()

  // 清除定时检查
  if (el._checkInterval) {
    clearInterval(el._checkInterval)
    delete el._checkInterval
  }

  await nextTick()

  // 移除所有水印容器
  const watermarkContainers = el.querySelectorAll('.watermark-container')
  watermarkContainers.forEach((container) => {
    container.remove()
  })

  delete el.__watermark_config
  el.removeAttribute('data-focus-remove')
}

export default watermarkDirective
