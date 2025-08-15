import type { UserModule } from './types'
import ElementPlus from 'element-plus'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import { ViteSSG } from 'vite-ssg'

import App from './App.vue'

// import { powerDirective } from './directives/v-power'
import watermarkDirective from './directives/v-watermark'

import { routerOptions, setupRouterGuards } from './router'

// 导入自定义样式（包含暗黑模式变量）
import '~/styles/index.scss'

// 导入 Element Plus 样式
import 'element-plus/theme-chalk/index.css'

// 确保导入暗黑模式 CSS 变量
import 'element-plus/theme-chalk/dark/css-vars.css'

// 导入 UnoCSS
import 'uno.css'
// If you want to use ElMessage, import it.
import 'element-plus/theme-chalk/src/message.scss'
import 'element-plus/theme-chalk/src/message-box.scss'

// https://github.com/antfu/vite-ssg
export const createApp = ViteSSG(
  App,
  routerOptions,
  (ctx) => {
    // 使用 Element Plus
    ctx.app.use(ElementPlus)

    // 使用 Pinia
    const pinia = createPinia()
    // 数据持久化插件
    pinia.use(piniaPluginPersistedstate)
    ctx.app.use(pinia)

    // 应用路由守卫
    if (ctx.router) {
      setupRouterGuards(ctx.router)
    }

    // 自定义水印指令
    ctx.app.directive('watermark', watermarkDirective)

    // 自定义按钮权限指令
    // ctx.app.directive('power', powerDirective)

    // install all modules under `modules/`
    Object.values(import.meta.glob<{ install: UserModule }>('./modules/*.ts', { eager: true }))
      .forEach(i => i.install?.(ctx))
  },
)
