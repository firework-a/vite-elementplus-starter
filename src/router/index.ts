import type { Router, RouterOptions } from 'vue-router'
import { createWebHashHistory } from 'vue-router'

import { routes as autoRoutes } from 'vue-router/auto-routes'

// 添加重定向记录
autoRoutes.push({
  path: '/',
  redirect: '/manage',
})

// 定义路由配置（不创建 Router 实例）
export const routerOptions: RouterOptions = {
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: autoRoutes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  },
}

export function setupRouterGuards(router: Router) {
  // 添加路由守卫
  router.beforeEach((to, from, next) => {
    const isLogin = !!localStorage.getItem('token')

    if (to.path === '/login') {
      if (isLogin) {
        next('/')
        return
      }
      next()
      return
    }

    if (!isLogin) {
      next('/login')
      return
    }

    next()
  })

  router.afterEach((to) => {
    document.title = String(to.meta.title) || '默认标题'
  })
}
