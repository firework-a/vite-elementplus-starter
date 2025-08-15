<script lang="ts" setup>
import { ArrowDown, SwitchButton } from '@element-plus/icons-vue'
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { toggleDark } from '~/composables'

const router = useRouter()

const username = localStorage.getItem('username')

// 获取管理员信息
const adminName = computed(() => {
  return username || '管理员'
})

// 退出登录
function handleLogout() {
  // 清理存储信息（示例）
  localStorage.clear()
  // 重定向登录页
  router.push('/login')
}
</script>

<template>
  <el-menu class="el-menu-demo" mode="horizontal" :ellipsis="false" router>
    <el-menu-item index="/">
      <div class="flex items-center justify-center gap-2">
        <div class="text-xl" i-ep-element-plus />
        <span>后台管理系统</span>
      </div>
    </el-menu-item>

    <div class="flex-spacer" />

    <!-- 主题切换按钮 -->
    <el-menu-item h="full" @click="toggleDark()">
      <button
        class="w-full cursor-pointer border-none bg-transparent"
        style="height: var(--ep-menu-item-height)"
      >
        <i inline-flex i="dark:ep-moon ep-sunny" />
      </button>
    </el-menu-item>

    <!-- 用户菜单 -->
    <el-dropdown class="user-dropdown" trigger="click" @command="(command: string) => command === 'logout' && handleLogout()">
      <div class="user-info">
        <el-avatar :size="28" class="user-avatar">
          {{ adminName.substring(0, 1).toUpperCase() }}
        </el-avatar>
        <span class="user-name">{{ adminName }}</span>
        <el-icon class="el-icon--right">
          <ArrowDown />
        </el-icon>
      </div>
      <template #dropdown>
        <el-dropdown-menu class="logout-menu">
          <el-dropdown-item command="logout">
            <el-icon><SwitchButton /></el-icon>
            <span>退出登录</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </el-menu>
</template>

<style lang="scss" scoped>
.el-menu-demo {
  display: flex;
  align-items: center;
  padding-right: 16px;

  &.ep-menu--horizontal > .ep-menu-item:nth-child(1) {
    margin-right: 20px;
  }

  .flex-spacer {
    flex: 1;
  }
}

.user-dropdown {
  height: 100%;
  display: flex;
  align-items: center;
  margin-left: 12px;
  cursor: pointer;

  .user-info {
    display: flex;
    align-items: center;
    padding: 0 8px;
    height: 50px;
    transition: background-color 0.3s;
    border-radius: 4px;

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    .user-avatar {
      background-color: var(--ep-color-primary);
      margin-right: 8px;
      font-size: 14px;
    }

    .user-name {
      font-size: 14px;
      margin-right: 4px;
      max-width: 80px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
