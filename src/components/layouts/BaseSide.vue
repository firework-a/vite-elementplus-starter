<script lang="ts" setup>
import type { Component } from 'vue'
import type { MenuItem } from '~/types/menu'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { routes } from 'vue-router/auto-routes'
import { sideMenuList } from '~/config/menu'

const props = defineProps({
  isCollapse: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['menuSelect'])
const route = useRoute()
const router = useRouter()
const userSelectedItems = ref<Set<string>>(new Set())

// 控制菜单折叠状态
// const isCollapse = ref(true)

// 菜单展开回调
function handleOpen(key: string, keyPath: string[]) {
  // eslint-disable-next-line no-console
  console.log('菜单展开:', key, keyPath)
}

// 菜单收起回调
function handleClose(key: string, keyPath: string[]) {
  // eslint-disable-next-line no-console
  console.log('菜单收起:', key, keyPath)
}

/**
 * 查找第一个有效的路由路径
 */
function findFirstValidPath(menuItem: MenuItem): string | null {
  if (menuItem.path)
    return menuItem.path
  if (menuItem.children?.length) {
    for (const child of menuItem.children) {
      const path = findFirstValidPath(child)
      if (path)
        return path
    }
  }
  return null
}

/**
 * 处理子菜单展开时的智能导航
 */
function handleSubMenuOpen(index: string) {
  const menuItem = findMenuItemByKey(index)
  if (!menuItem?.children?.length)
    return

  // 检查是否已经手动选择过该菜单的子项
  const hasUserSelection = Array.from(userSelectedItems.value).some(
    path => isDescendantPath(path, menuItem),
  )

  // 检查当前路由是否已经是该菜单的子项
  const isCurrentInSubMenu = isDescendantPath(route.path, menuItem)

  // 只有从未手动选择过且当前不在子菜单中才自动导航
  if (!hasUserSelection && !isCurrentInSubMenu) {
    const firstPath = findFirstValidPath(menuItem.children[0])
    if (firstPath && firstPath !== route.path) {
      router.push(firstPath)
    }
  }
}

/**
 * 判断路径是否是菜单项的子项
 */
function isDescendantPath(path: string, menuItem: MenuItem): boolean {
  if (menuItem.path === path)
    return true
  if (menuItem.children) {
    return menuItem.children.some(child => isDescendantPath(path, child))
  }
  return false
}

/**
 * 记录用户手动选择的菜单项
 */
function handleMenuSelect(index: string) {
  // 找到实际选择的菜单项
  const selectedItem = findMenuItemByKey(index)
  if (selectedItem) {
    // 记录所有祖先菜单的key
    const parentKeys = findParentKeys(selectedItem)
    parentKeys.forEach(key => userSelectedItems.value.add(key))
  }
  // 触发menuSelect事件
  emit('menuSelect', index)
}

/**
 * 查找菜单项的所有父级key
 */
function findParentKeys(menuItem: MenuItem, menus = sideMenuList, parentKeys: string[] = []): string[] {
  for (const menu of menus) {
    if (menu.children?.includes(menuItem)) {
      const key = menu.path || menu.title
      return [...parentKeys, key, ...findParentKeys(menu, sideMenuList)]
    }
    if (menu.children) {
      const found = findParentKeys(menuItem, menu.children, parentKeys)
      if (found.length)
        return found
    }
  }
  return parentKeys
}

/**
 * 根据key查找菜单项
 */
function findMenuItemByKey(key: string, menus: MenuItem[] = sideMenuList): MenuItem | null {
  for (const menu of menus) {
    if (menu.path === key || menu.title === key)
      return menu
    if (menu.children) {
      const found = findMenuItemByKey(key, menu.children)
      if (found)
        return found
    }
  }
  return null
}

// 合并路由配置
const mergedRoutes = computed(() => {
  return sideMenuList.map(item => ({
    ...item,
    meta: {
      ...(routes.find(r => r.path === item.path)?.meta || {}),
      ...(item.meta || {}),
    },
  }))
})
</script>

<template>
  <div class="sidebar-container" :class="{ 'is-collapsed': props.isCollapse }">
    <el-menu
      :default-active="route.path"
      router
      class="el-menu-vertical"
      :collapse="props.isCollapse"
      @open="(key: string, keyPath: string[]) => {
        handleOpen(key, keyPath);
        handleSubMenuOpen(key);
      }"
      @close="handleClose"
      @select="handleMenuSelect"
    >
      <template v-for="item in mergedRoutes" :key="item.path || item.title">
        <!-- 有子菜单的情况 -->
        <template v-if="item.children?.length">
          <el-sub-menu :index="item.path || item.title" popper-class="multi-level-menu">
            <template #title>
              <el-icon v-if="item.icon">
                <component :is="item.icon as Component" />
              </el-icon>
              <span>{{ item.title }}</span>
            </template>

            <!-- 渲染真实的子菜单项 -->
            <template v-for="child in item.children" :key="child.path || child.title">
              <!-- 有三级菜单的情况 -->
              <el-sub-menu v-if="child.children?.length" :index="child.path || child.title">
                <template #title>
                  <el-icon v-if="child.icon">
                    <component :is="child.icon as Component" />
                  </el-icon>
                  <span>{{ child.title }}</span>
                </template>
                <el-menu-item v-for="subChild in child.children" :key="subChild.path" :index="subChild.path">
                  <el-icon v-if="subChild.icon">
                    <component :is="subChild.icon as Component" />
                  </el-icon>
                  <span>{{ subChild.title }}</span>
                </el-menu-item>
              </el-sub-menu>

              <!-- 纯二级菜单项 -->
              <el-menu-item v-else :index="child.path">
                <el-icon v-if="child.icon">
                  <component :is="child.icon as Component" />
                </el-icon>
                <span>{{ child.title }}</span>
              </el-menu-item>
            </template>
          </el-sub-menu>
        </template>

        <!-- 没有子菜单的情况 -->
        <el-menu-item v-else :index="item.path">
          <el-icon v-if="item.icon">
            <component :is="item.icon as Component" />
          </el-icon>
          <span>{{ item.title }}</span>
        </el-menu-item>
      </template>
    </el-menu>
  </div>
</template>

<style scoped lang="scss">
.sidebar-container {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  transition: width 0.3s ease;
  width: 220px; /* 展开时的宽度 */

  &.is-collapsed {
    width: 64px; /* 折叠时的宽度 */
  }

  /* 美化滚动条 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 3px;

    &:hover {
      background-color: #a8a8a8;
    }
  }
}

.el-menu-vertical {
  --el-menu-level-padding: 20px;
  width: 100%;
  border-right: none;

  /* 确保菜单项不换行 */
  .el-sub-menu__title,
  .el-menu-item {
    white-space: nowrap;
  }
}

/* 多级菜单缩进控制 */
:deep(.multi-level-menu) {
  .el-sub-menu__title,
  .el-menu-item {
    padding-left: calc(var(--el-menu-level-padding) * var(--level, 1)) !important;
  }

  .el-sub-menu .el-sub-menu__title {
    padding-left: calc(var(--el-menu-level-padding) * var(--level, 1) - 12px) !important;
  }
}

/* 禁止用户选择文本 */
* {
  user-select: none;
}

.ep-menu-item.is-active {
  /* 背景色 */
  background-color: rgba(0, 128, 90, 0.1);
  /* 文字颜色 */
  color: #00805a;
  /* 边框右侧高亮 */
  border-right: 3px solid #00805a;
}
</style>
