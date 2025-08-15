import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import { setupLoadingInterceptors } from '~/utils/loading'

// 定义接口响应格式
interface ApiResponse<T = any> {
  code: string | number
  message: string
  data?: T
  total?: number
  menuTree?: object[]
}

// 创建请求实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 添加加载进度条拦截器
setupLoadingInterceptors(service)

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.token = token
    }
    return config
  },
  (error) => {
    console.error('请求错误:', error)
    return Promise.reject(error)
  },
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse<any>) => {
    const res = response.data
    console.warn('API原始响应:', res)

    // 统一状态码处理（兼容字符串/数字）
    const code = res?.code !== undefined ? String(res.code) : ''
    const httpStatus = response.status

    // 特殊错误码处理
    if (code === '10005') {
      const errorMsg = res.message || '未注册用户'
      ElMessage.error(errorMsg)
      return Promise.reject(new Error(errorMsg))
    }

    if (code === '10003') {
      const errorMsg = res.message || '密码错误'
      ElMessage.error(errorMsg)
      return Promise.reject(new Error(errorMsg))
    }

    if (code === '401') {
      const errorMsg = res.message || '未授权访问'
      localStorage.removeItem('token')
      window.location.href = '/login'
      return Promise.reject(new Error(errorMsg))
    }

    // 成功判断（兼容原来逻辑）
    const isSuccess = ['200', '0', 'success'].includes(code)
      || (httpStatus >= 200 && httpStatus < 300)

    if (!isSuccess) {
      const errorMsg = res.message || `请求失败 (${code || httpStatus})`
      ElMessage.error(errorMsg)
      return Promise.reject(new Error(errorMsg))
    }

    // 关键修改：保持与原来相同的返回结构
    if (res.total || res.menuTree) {
      return response // 返回完整响应
    }

    // 保持数据传递一致性
    response.data = res.data ?? res
    return response
  },
  (error) => {
    console.error('请求异常:', error)

    // 保持原来的网络错误处理
    let message = '网络错误，请稍后重试'
    if (error.response) {
      switch (error.response.status) {
        case 400: message = '请求错误'
          break
        case 401:
          message = '未授权，请重新登录'
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        case 403: message = '拒绝访问'
          break
        case 404: message = '请求地址不存在'
          break
        case 500: message = '服务器内部错误'
          break
        default: message = `请求失败: ${error.response.status}`
      }
    }

    ElMessage.error(message)
    return Promise.reject(error)
  },
)

// 封装GET请求
export function get<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
  return service.get(url, { params, ...config }).then(res => res.data)
}

// 封装POST请求
export function post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return service.post(url, data, config).then(res => res.data)
}

// 封装PUT请求
export function put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return service.put(url, data, config).then(res => res.data)
}

// 封装DELETE请求
export function del<T = any>(url: string, params?: any, config?: AxiosRequestConfig): Promise<T> {
  return service.delete(url, { params, ...config }).then(res => res.data)
}

// 封装PATCH请求
export function patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
  return service.patch(url, data, config).then(res => res.data)
}

// 封装上传文件请求
export function upload<T = any>(url: string, file: File, filename = 'file', data?: Record<string, any>, config?: AxiosRequestConfig): Promise<T> {
  const formData = new FormData()
  formData.append(filename, file)

  if (data) {
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key])
    })
  }

  return service.post(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    ...config,
  }).then(res => res.data)
}

// 封装下载文件请求
export function download(url: string, params?: any, filename?: string, config?: AxiosRequestConfig): Promise<void> {
  // 对于下载请求，我们需要特殊处理，不使用通用的响应拦截器
  const downloadInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 15000,
    ...config,
  })

  return downloadInstance.get(url, {
    params,
    responseType: 'blob',
    ...config,
  }).then((response) => {
    // 创建Blob对象
    const blob = new Blob([response.data])

    // 创建下载链接
    const downloadLink = document.createElement('a')
    const objectUrl = URL.createObjectURL(blob)

    // 设置下载文件名
    downloadLink.href = objectUrl
    downloadLink.download = filename || getFilenameFromResponse(response) || 'download'

    // 触发下载
    document.body.appendChild(downloadLink)
    downloadLink.click()

    // 清理
    document.body.removeChild(downloadLink)
    URL.revokeObjectURL(objectUrl)
  })
}

// 从响应头获取文件名
function getFilenameFromResponse(response: any): string | null {
  const contentDisposition = response.headers['content-disposition']
  if (!contentDisposition)
    return null

  const filenameMatch = contentDisposition.match(/filename="?([^"]*)"?/)
  return filenameMatch ? filenameMatch[1] : null
}

// 创建自定义请求实例
export function createRequest(config?: AxiosRequestConfig): {
  get: <T = any>(url: string, params?: any, requestConfig?: AxiosRequestConfig) => Promise<T>
  post: <T = any>(url: string, data?: any, requestConfig?: AxiosRequestConfig) => Promise<T>
  put: <T = any>(url: string, data?: any, requestConfig?: AxiosRequestConfig) => Promise<T>
  delete: <T = any>(url: string, params?: any, requestConfig?: AxiosRequestConfig) => Promise<T>
  patch: <T = any>(url: string, data?: any, requestConfig?: AxiosRequestConfig) => Promise<T>
} {
  const customInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
    timeout: 15000,
    headers: {
      'Content-Type': 'application/json',
    },
    ...config,
  })

  // 添加加载进度条拦截器
  setupLoadingInterceptors(customInstance)

  // 添加请求拦截器，设置token
  customInstance.interceptors.request.use(
    (config) => {
      // 从localStorage获取token
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.token = token
      }
      return config
    },
    (error) => {
      console.error('请求错误:', error)
      return Promise.reject(error)
    },
  )

  // 添加响应拦截器，处理数据格式
  customInstance.interceptors.response.use(
    (response: AxiosResponse<ApiResponse>) => {
      const res = response.data

      if (res.code !== '200') {
        ElMessage({
          message: res.message || '请求失败',
          type: 'error',
          duration: 3000,
        })

        return Promise.reject(new Error(res.message || '请求失败'))
      }

      return response
    },
    (error) => {
      console.error('响应错误:', error)

      let message = '网络错误，请稍后重试'
      if (error.response) {
        switch (error.response.status) {
          case 400: message = '请求错误'
            break
          case 401: message = '未授权，请重新登录'
            break
          case 403: message = '拒绝访问'
            break
          case 404: message = '请求地址不存在'
            break
          case 500: message = '服务器内部错误'
            break
          default: message = `请求失败: ${error.response.status}`
        }
      }

      ElMessage({
        message,
        type: 'error',
        duration: 3000,
      })

      return Promise.reject(error)
    },
  )

  return {
    get: <T = any>(url: string, params?: any, requestConfig?: AxiosRequestConfig): Promise<T> =>
      customInstance.get(url, { params, ...requestConfig }).then((res) => {
        return res.data.data
      }),
    post: <T = any>(url: string, data?: any, requestConfig?: AxiosRequestConfig): Promise<T> =>
      customInstance.post(url, data, requestConfig).then((res) => {
        return res.data.data
      }),
    put: <T = any>(url: string, data?: any, requestConfig?: AxiosRequestConfig): Promise<T> =>
      customInstance.put(url, data, requestConfig).then((res) => {
        return res.data.data
      }),
    delete: <T = any>(url: string, params?: any, requestConfig?: AxiosRequestConfig): Promise<T> =>
      customInstance.delete(url, { params, ...requestConfig }).then((res) => {
        return res.data.data
      }),
    patch: <T = any>(url: string, data?: any, requestConfig?: AxiosRequestConfig): Promise<T> =>
      customInstance.patch(url, data, requestConfig).then((res) => {
        return res.data.data
      }),
  }
}

// 导出默认实例
export default service
