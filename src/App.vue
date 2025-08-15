<script setup lang="ts">
// import { onMounted } from 'vue'

// onMounted(() => {
//   // eslint-disable-next-line no-console
//   console.log(
//     '%c欢迎使用控制台 🚀',
//     'color: #409EFF; font-size: 18px; font-weight: bold; padding: 10px; background: #f0f9ff; border: 1px solid #e6f7ff; border-radius: 4px;',
//   )

//   // eslint-disable-next-line no-console
//   console.log(
//     '%c环境：%c开发环境',
//     'color: #666; font-weight: 500;',
//     'color: #00b42a; background: #f6ffed; padding: 2px 6px; border-radius: 3px;',
//   )
// })
</script>

<template>
  <RouterView />
</template>

<style>
#app {
  text-align: center;
  color: var(--ep-text-color-primary);
  height: 100dvh;
  width: 100vw;
  overflow: hidden;
}
</style>
