<script lang="ts" setup>
import { Close } from '@element-plus/icons-vue'
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface HistoryItem {
  path: string
  title: string
}

const router = useRouter()
const route = useRoute()
const historyList = ref<HistoryItem[]>([])
const isFromSidebar = ref(false)

const MAX_HISTORY = 8

function getShortTitle(title: string): string {
  return title.split('-').pop()?.slice(0, 5) || title
}

function addHistory() {
  if (!route.meta?.title)
    return

  const existingIndex = historyList.value.findIndex(item => item.path === route.path)
  const newItem = {
    path: route.path,
    title: getShortTitle(route.meta.title as string),
  }

  if (existingIndex >= 0) {
    if (isFromSidebar.value) {
      historyList.value.splice(existingIndex, 1)
      historyList.value.push(newItem)
    }
  }
  else {
    historyList.value.push(newItem)
    if (historyList.value.length > MAX_HISTORY) {
      historyList.value.shift()
    }
  }

  isFromSidebar.value = false
}

function handleHistoryClick(path: string) {
  router.push(path)
}

function handleSidebarClick() {
  isFromSidebar.value = true
}

function removeHistory(path: string, e: MouseEvent) {
  e.stopPropagation()

  if (route.path === path && historyList.value.length > 1) {
    const currentIndex = historyList.value.findIndex(item => item.path === path)
    const newHistoryList = historyList.value.filter(item => item.path !== path)

    const redirectPath = currentIndex < newHistoryList.length
      ? newHistoryList[currentIndex]?.path
      : newHistoryList[newHistoryList.length - 1]?.path

    if (redirectPath) {
      router.push(redirectPath)
    }
  }

  if (historyList.value.length > 1) {
    historyList.value = historyList.value.filter(item => item.path !== path)
  }
}

addHistory()

watch(
  () => route.path,
  () => addHistory(),
  { immediate: true },
)

defineExpose({
  handleSidebarClick,
})
</script>

<template>
  <div class="history-tracker">
    <el-scrollbar>
      <div class="history-items">
        <div
          v-for="item in historyList" :key="item.path" class="history-item" :class="{
            'active': route.path === item.path,
            'only-one': historyList.length === 1,
          }" @click="handleHistoryClick(item.path)"
        >
          <span class="item-text">{{ item.title }}</span>
          <el-icon v-if="historyList.length > 1" class="close-icon" @click.stop="removeHistory(item.path, $event)">
            <Close />
          </el-icon>
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<style scoped lang="scss">
* {
  user-select: none;
}

.history-tracker {
  padding: 5px 16px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);

  .el-scrollbar {
    height: 100%;
  }

  .history-items {
    display: flex;
    gap: 8px;
    height: 100%;
    align-items: center;
  }

  .history-item {
    display: inline-flex;
    align-items: center;
    height: 24px;
    padding: 0 6px;
    font-size: 12px;
    border-radius: 4px;
    background: #fff;
    border: 1px solid #e0e3e8;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;

    &:hover {
      border-color: #c0c4cc;

      .close-icon {
        opacity: 1;
      }
    }

    &.active {
      background: #e6f7ff;
      border-color: #00805a;
      color: #00805a;
    }

    &.only-one {
      padding-right: 6px;
    }

    .item-text {
      max-width: 60px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .close-icon {
      margin-left: 6px;
      font-size: 12px;
      opacity: 0.3;
      transition: all 0.2s;
      color: #666;

      &:hover {
        opacity: 1;
        color: #ff4d4f;
      }
    }
  }
}

.dark {
  .history-tracker {
    border-bottom-color: #333;
  }

  .history-item {
    background: #1e1e1e;
    border-color: #444;
    color: #e0e0e0;

    &:hover {
      border-color: #666;
    }

    &.active {
      background: rgba(0, 160, 120, 0.2);
      border-color: #00a078;
      color: #00a078;
    }

    .close-icon {
      color: #888;

      &:hover {
        color: #ff6b6b;
      }
    }
  }
}
</style>
