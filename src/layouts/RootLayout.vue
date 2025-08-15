<script lang="ts" setup>
import { provide, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import LoadingBar from '~/components/LoadingBar.vue'

const historyBarRef = ref()
const isCollapse = ref(false)
const router = useRouter()
const route = useRoute()

// 提供刷新页面的方法，供子组件使用
provide('refreshPage', refreshCurrentPage)

function handleMenuSelect() {
  historyBarRef.value?.handleSidebarClick()
}

function toggleSidebar() {
  isCollapse.value = !isCollapse.value
}

// 刷新当前页面数据的方法
function refreshCurrentPage() {
  // 获取当前路由的完整路径
  const { path, query, hash } = route

  // 只对管理页面进行刷新
  if (path.startsWith('/manage/')) {
    // 对于管理页面，使用管理专用的重定向
    const managePath = path.replace(/^\/manage/, '')
    router.replace({
      path: `/manage/redirect${managePath}`,
      query,
      hash,
    })
  }
  else {
    // 对于非管理页面，不执行刷新操作
    console.warn('当前不是管理页面，不执行刷新操作')
  }
}
</script>

<template>
  <el-config-provider namespace="ep">
    <BaseHeader />
    <div class="main-container">
      <div class="side-area" :class="{ collapsed: isCollapse }">
        <BaseSide :is-collapse="isCollapse" @menu-select="handleMenuSelect" />
      </div>
      <div class="content-area">
        <div class="navigation-layer">
          <BreadCrumb :is-collapse="isCollapse" @toggle-collapse="toggleSidebar" @refresh="refreshCurrentPage" />
          <div class="history-bar-wrapper">
            <HistoryBar ref="historyBarRef" />
            <LoadingBar />
          </div>
        </div>

        <div class="router-view-container">
          <RouterView />
        </div>
      </div>
    </div>
  </el-config-provider>
</template>

<style lang="scss">
/* 重置默认边距和填充 */
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
  overflow: hidden;
  /* 禁止全局滚动 */
}

#app {
  display: flex;
  flex-direction: column;
}

.main-container {
  display: flex;
  flex: 1;
  min-height: 0;

  .side-area {
    height: 100%;
    border-right: 1px solid #e6e8eb;
    transition: width 0.3s ease;
    width: 220px; /* 与侧边栏展开宽度保持一致 */

    &.collapsed {
      width: 64px; /* 与侧边栏折叠宽度保持一致 */
    }
  }
}

.content-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  /* 关键：解决 flex 容器溢出问题 */
  overflow: hidden;
}

.navigation-layer {
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color);
  flex-shrink: 0;
  /* 防止导航层被压缩 */
  position: relative; /* 为进度条提供定位上下文 */
}

.history-bar-wrapper {
  position: relative; /* 为进度条提供定位上下文 */
}

.router-view-container {
  flex: 1;
  min-height: 0;
  /* 关键：允许内部容器滚动 */
  padding: 16px 24px;
  overflow-y: auto;
  background-color: var(--el-bg-color-page);

  /* 使用Element Plus的滚动条变量 */
  &::-webkit-scrollbar {
    width: 6px;
    background-color: var(--el-bg-color);
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--el-color-info-light-5);
    border-radius: 3px;

    &:hover {
      background-color: var(--el-color-info-light-3);
    }
  }

  @media (max-width: 768px) {
    padding: 12px;
  }
}
</style>
