<script lang="ts" setup>
import NProgress from 'nprogress'
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import 'nprogress/nprogress.css'

// 配置NProgress
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

const router = useRouter()

// 路由开始切换时显示进度条
function startLoading() {
  try {
    // 每次调用前重新配置
    configureNProgress()
    NProgress.start()
  }
  catch (error) {
    console.warn('NProgress start error:', error)
  }
}

// 路由切换完成时结束进度条
function endLoading() {
  try {
    // 每次调用前重新配置
    configureNProgress()
    NProgress.done()
  }
  catch (error) {
    console.warn('NProgress error:', error)
  }
}

onMounted(() => {
  // 配置NProgress
  configureNProgress()

  // 添加路由钩子
  router.beforeEach((to, from, next) => {
    // 每次路由切换时重新配置NProgress，以适应可能的DOM变化
    configureNProgress()
    startLoading()
    next()
  })

  router.afterEach(() => {
    // 延迟结束进度条，给数据加载留出时间
    setTimeout(() => {
      endLoading()
    }, 300)
  })
})

onUnmounted(() => {
  // 确保进度条被关闭，添加错误处理
  try {
    // 卸载前重新配置
    configureNProgress()
    NProgress.done()
  }
  catch (error) {
    console.warn('NProgress cleanup error:', error)
  }
})
</script>

<template>
  <div />
</template>

<style>
/* 自定义NProgress样式 */
#nprogress .bar {
  background: var(--ep-color-primary, #52c41a);
  height: 2px;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
}

#nprogress .peg {
  box-shadow:
    0 0 10px var(--ep-color-primary, #52c41a),
    0 0 5px var(--ep-color-primary, #52c41a);
}

/* 确保进度条在HistoryBar下方 */
.history-bar-wrapper {
  position: relative;
}
</style>
