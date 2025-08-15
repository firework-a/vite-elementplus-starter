import NProgress from 'nprogress'

// 配置NProgress函数
function configureNProgress() {
  // 检查是否存在navigation-layer元素
  const hasNavigationLayer = document.querySelector('.navigation-layer') !== null

  NProgress.configure({
    easing: 'ease',
    speed: 500,
    showSpinner: false,
    trickleSpeed: 200,
    minimum: 0.1,
    // 如果存在navigation-layer则使用它作为父元素，否则使用默认的body
    parent: hasNavigationLayer ? '.navigation-layer' : 'body',
  })
}

// 记录当前活跃的请求数量
let activeRequests = 0

/**
 * 开始加载进度条
 * 当有API请求开始时调用
 */
export function startLoading() {
  if (activeRequests === 0) {
    try {
      // 每次开始加载时重新配置NProgress，以适应可能的DOM变化
      configureNProgress()
      NProgress.start()
    }
    catch (error) {
      console.warn('NProgress start error:', error)
    }
  }
  activeRequests++
}

/**
 * 结束加载进度条
 * 当API请求结束时调用
 */
export function endLoading() {
  activeRequests--
  if (activeRequests <= 0) {
    activeRequests = 0
    try {
      // 在结束进度条前也重新配置NProgress
      configureNProgress()
      NProgress.done()
    }
    catch (error) {
      console.warn('NProgress done error:', error)
    }
  }
}

/**
 * 创建axios请求拦截器
 * @param {import('axios').AxiosInstance} axiosInstance - axios实例
 */
export function setupLoadingInterceptors(axiosInstance: any) {
  // 请求拦截器
  axiosInstance.interceptors.request.use(
    (config: any) => {
      startLoading()
      return config
    },
    (error: any) => {
      endLoading()
      return Promise.reject(error)
    },
  )

  // 响应拦截器
  axiosInstance.interceptors.response.use(
    (response: any) => {
      endLoading()
      return response
    },
    (error: any) => {
      endLoading()
      return Promise.reject(error)
    },
  )
}
