<script lang="ts" setup>
import type { RouteLocationMatched } from 'vue-router'
import { Expand, Fold, Refresh } from '@element-plus/icons-vue'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

defineProps({
  isCollapse: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['toggleCollapse', 'refresh'])

const route = useRoute()

function formatTitle(title: string): string {
  return title.replace(/-/g, ' > ')
}

const breadcrumbList = computed(() => {
  const matched = route.matched.filter(item => item.meta?.title)
  return matched.map((item: RouteLocationMatched) => ({
    title: formatTitle(item.meta.title as string),
    path: item.path,
  }))
})

function toggleCollapse() {
  emit('toggleCollapse')
}

function refreshPage() {
  emit('refresh')
}
</script>

<template>
  <div class="breadcrumb-wrapper">
    <div class="breadcrumb-content">
      <el-button class="collapse-btn" :icon="isCollapse ? Expand : Fold" text @click="toggleCollapse" />
      <el-button class="refresh-btn" :icon="Refresh" text title="刷新页面数据" @click="refreshPage" />
      <el-breadcrumb separator="/">
        <el-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="index" :to="item.path || undefined">
          <span class="breadcrumb-item">
            {{ item.title }}
          </span>
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>
  </div>
</template>

<style scoped lang="scss">
* {
  user-select: none;
  cursor: pointer;
}

.breadcrumb-wrapper {
  padding: 12px 24px;
  background: var(--el-bg-color);
  border-bottom: 1px solid #e6e8eb;
}

.breadcrumb-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.collapse-btn,
.refresh-btn {
  font-size: 18px;
  color: var(--el-text-color-regular);
  transition: all 0.3s ease;
  padding: 4px;
  margin: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    color: var(--ep-color-primary);
    transform: scale(1.1);
  }
}

:deep() {
  .el-breadcrumb {
    font-size: 15px;
    line-height: 1.5;

    &__separator {
      margin: 0 8px;
      color: var(--el-text-color-placeholder);
      font-weight: 400;
    }

    &__item {
      display: inline-flex;
      align-items: center;

      .breadcrumb-item {
        display: inline-block;
        padding: 4px 8px;
        border-radius: var(--el-border-radius-base);
        transition: all 0.3s ease;
        color: var(--el-text-color-regular);
        font-weight: 500;
      }

      &:hover .breadcrumb-item {
        background-color: var(--el-fill-color-light);
        color: var(--el-color-primary);
      }

      &:last-child .breadcrumb-item {
        color: var(--el-text-color-primary);
        font-weight: 600;
        background-color: transparent;
        pointer-events: none;
      }

      &:not(:last-child)::after {
        content: '';
        display: inline-block;
        width: 6px;
        height: 6px;
        margin-left: 12px;
        border-radius: 50%;
        background-color: var(--el-border-color);
      }
    }
  }
}

.dark {
  .breadcrumb-wrapper {
    border-bottom-color: #333;
  }
}
</style>
