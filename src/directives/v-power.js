import { useUserStore } from '~/stores/user'

// 存储被移除的元素信息
const removedElements = new WeakMap()

// 权限检查函数
function checkPermission(el, binding) {
  const userStore = useUserStore()
  const { value } = binding

  // 获取当前用户角色
  const userRole = userStore.role

  // 没有权限值，默认显示
  if (!value) {
    restoreElement(el)
    return
  }

  // 处理不同类型的权限值
  let hasPermission = false

  if (typeof value === 'string') {
    // 字符串：匹配角色
    hasPermission = userRole === value
  }
  else if (Array.isArray(value)) {
    // 数组：匹配任一角色
    hasPermission = value.includes(userRole)
  }
  else if (typeof value === 'function') {
    // 函数：自定义权限验证
    hasPermission = value(userStore.userData)
  }
  else if (value && typeof value === 'object') {
    // 对象：复杂权限验证
    hasPermission = checkObjectPermission(value, userStore.userData)
  }
  else {
    // 其他情况：默认显示
    hasPermission = true
  }

  // 根据权限结果处理元素
  if (hasPermission) {
    restoreElement(el)
  }
  else {
    removeElement(el)
  }
}

// 对象权限验证（基于现有store结构）
function checkObjectPermission(permissionObj, userData) {
  const { role, roles, custom } = permissionObj

  let hasPermission = true

  // 角色验证
  if (role || roles) {
    const requiredRoles = role || roles
    const userRole = userData?.role
    const rolesToCheck = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
    hasPermission = hasPermission && rolesToCheck.includes(userRole)
  }

  // 自定义验证
  if (custom && hasPermission) {
    hasPermission = hasPermission && custom(userData)
  }

  return hasPermission
}

// 移除元素
function removeElement(el) {
  if (el.parentNode && !removedElements.has(el)) {
    const comment = document.createComment('v-power removed')
    const parentNode = el.parentNode
    const nextSibling = el.nextSibling

    // 存储元素信息以便恢复
    removedElements.set(el, {
      parentNode,
      nextSibling,
      comment,
    })

    // 用注释节点替换元素
    parentNode.replaceChild(comment, el)
  }
}

// 恢复元素
function restoreElement(el) {
  const elementInfo = removedElements.get(el)

  if (elementInfo && elementInfo.parentNode) {
    const { parentNode, nextSibling, comment } = elementInfo

    // 如果注释节点还在，则恢复元素
    if (comment && comment.parentNode === parentNode) {
      parentNode.insertBefore(el, nextSibling)
      parentNode.removeChild(comment)
    }

    // 清理存储的信息
    removedElements.delete(el)
  }
}

// 主指令对象
const powerDirective = {
  mounted(el, binding) {
    checkPermission(el, binding)
  },
  updated(el, binding) {
    checkPermission(el, binding)
  },
  unmounted(el) {
    removedElements.delete(el)
  },
}

// 全局权限检查方法（可选，如果需要的话）
const powerMethods = {
  check: (permission) => {
    const userStore = useUserStore()
    const userData = userStore.userData

    if (typeof permission === 'string') {
      return userStore.role === permission
    }
    else if (Array.isArray(permission)) {
      return permission.includes(userStore.role)
    }
    else if (typeof permission === 'function') {
      return permission(userData)
    }
    else if (permission && typeof permission === 'object') {
      return checkObjectPermission(permission, userData)
    }

    return true
  },

  // 基于现有store的计算属性
  isStudent: () => {
    const userStore = useUserStore()
    return userStore.isStudent
  },

  isTeacher: () => {
    const userStore = useUserStore()
    return userStore.isTeacher
  },

  isAdmin: () => {
    const userStore = useUserStore()
    return userStore.isAdmin
  },
}

export { powerDirective, powerMethods }
