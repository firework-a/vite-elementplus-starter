import { uploadImage } from '~/api/file'

/**
 * 日期格式化函数
 * @param date 日期对象或日期字符串
 * @param format 格式化模板，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
export function formatDate(date: Date | string | number, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  if (!date)
    return '-'

  const d = typeof date === 'object' ? date : new Date(date)

  if (Number.isNaN(d.getTime()))
    return '-'

  const formatObj: Record<string, number> = {
    'Y+': d.getFullYear(),
    'M+': d.getMonth() + 1,
    'D+': d.getDate(),
    'H+': d.getHours(),
    'h+': d.getHours() % 12 || 12,
    'm+': d.getMinutes(),
    's+': d.getSeconds(),
    'q+': Math.floor((d.getMonth() + 3) / 3),
    'S': d.getMilliseconds(),
  }

  // 替换年份
  format = format.replace(/(Y+)/, (match) => {
    return (`${d.getFullYear()}`).substring(4 - match.length)
  })

  // 替换其他日期部分
  for (const k in formatObj) {
    format = format.replace(new RegExp(`(${k})`), (match) => {
      return match.length === 1
        ? `${formatObj[k]}`
        : (`00${formatObj[k]}`).substring((`${formatObj[k]}`).length)
    })
  }

  return format
}

/**
 * 相对时间格式化
 * @param date 日期对象或日期字符串
 * @returns 相对时间字符串，如"刚刚"、"5分钟前"、"2小时前"等
 */
export function formatRelativeTime(date: Date | string | number): string {
  if (!date)
    return '-'

  const d = typeof date === 'object' ? date : new Date(date)

  if (Number.isNaN(d.getTime()))
    return '-'

  const now = new Date()
  const diff = now.getTime() - d.getTime()

  // 小于1分钟
  if (diff < 60 * 1000) {
    return '刚刚'
  }
  // 小于1小时
  else if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))}分钟前`
  }
  // 小于1天
  else if (diff < 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 60 * 1000))}小时前`
  }
  // 小于30天
  else if (diff < 30 * 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (24 * 60 * 60 * 1000))}天前`
  }
  // 小于12个月
  else if (diff < 12 * 30 * 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (30 * 24 * 60 * 60 * 1000))}个月前`
  }
  // 大于等于12个月
  else {
    return `${Math.floor(diff / (12 * 30 * 24 * 60 * 60 * 1000))}年前`
  }
}

/**
 * 将数字转换为带有千位分隔符的字符串
 * @param num 数字
 * @returns 带有千位分隔符的字符串
 */
export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 将金额格式化为货币形式
 * @param amount 金额
 * @param currency 货币符号，默认为'¥'
 * @param decimals 小数位数，默认为2
 * @returns 格式化后的货币字符串
 */
export function formatCurrency(amount: number, currency: string = '¥', decimals: number = 2): string {
  return currency + amount.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

/**
 * 截断文本，超出部分用省略号表示
 * @param text 文本
 * @param length 最大长度
 * @returns 截断后的文本
 */
export function truncateText(text: string, length: number): string {
  if (!text)
    return ''
  return text.length > length ? `${text.substring(0, length)}...` : text
}

/**
 * 上传图片
 * @param img 图片文件
 * @returns 图片url
 */
export async function uploadImg(img: FormData) {
  try {
    const res = await uploadImage(img)
    if (res) {
      console.warn(res)
      return `http://47.94.6.186:3001${res.fileUrl}`
    }
  }
  catch (err) {
    console.error('图片上传失败', err)
  }
}
