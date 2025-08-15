<route lang="json">
{
  "name": "notFound",
  "meta": {
    "title": "404 - 页面未找到",
    "requiresAuth": false
  }
}
</route>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

// 返回首页
function goHome() {
  router.push('/')
}

// 返回上一页
function goBack() {
  router.back()
}
</script>

<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <div class="error-code">
        404
      </div>
      <div class="error-title">
        页面未找到
      </div>
      <div class="error-desc">
        抱歉，您访问的页面不存在或已被删除
      </div>
      <div class="action-buttons">
        <el-button color="var(--ep-color-primary)" @click="goHome">
          返回首页
        </el-button>
        <el-button color="var(--ep-color-primary)" plain @click="goBack">
          返回上一页
        </el-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
* {
  user-select: none;
}

.not-found-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  background-color: var(--el-bg-color);
}

.not-found-content {
  text-align: center;
  padding: 40px;
  max-width: 500px;

  .error-code {
    font-size: 120px;
    font-weight: bold;
    color: var(--ep-color-primary);
    line-height: 1.2;
    margin-bottom: 20px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  }

  .error-title {
    font-size: 32px;
    font-weight: bold;
    color: var(--el-text-color-primary);
    margin-bottom: 16px;
  }

  .error-desc {
    font-size: 16px;
    color: var(--el-text-color-secondary);
    margin-bottom: 30px;
  }

  .action-buttons {
    display: flex;
    justify-content: center;
    gap: 16px;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .not-found-content {
    padding: 20px;

    .error-code {
      font-size: 80px;
    }

    .error-title {
      font-size: 24px;
    }

    .error-desc {
      font-size: 14px;
    }
  }
}
</style>
