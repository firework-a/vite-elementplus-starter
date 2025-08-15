<script lang="ts" setup>
import type { Component, FunctionalComponent, VNode } from 'vue'
import { defineProps, h, ref, watchEffect, withDefaults } from 'vue'

interface Props {
  icon?: string | Component | (() => VNode) | FunctionalComponent
}

const props = withDefaults(defineProps<Props>(), {
  icon: undefined,
})

const iconNode = ref<VNode | null>(null)

watchEffect(() => {
  if (!props.icon) {
    iconNode.value = null
    return
  }

  // 处理函数式组件或渲染函数
  if (typeof props.icon === 'function') {
    try {
      // 检查是否是函数式组件
      if ('props' in props.icon || 'name' in props.icon) {
        iconNode.value = h(props.icon as Component)
      }
      else {
        // 普通渲染函数
        iconNode.value = (props.icon as () => VNode)()
      }
    }
    catch {
      iconNode.value = null
    }
    return
  }

  // 处理组件对象
  if (typeof props.icon === 'object') {
    iconNode.value = h(props.icon as Component)
    return
  }

  // 处理字符串图标
  if (typeof props.icon === 'string') {
    const loadElementIcon = async () => {
      try {
        const elIcons = await import('@element-plus/icons-vue')
        const iconComponent = (elIcons as Record<string, Component>)[props.icon as string]
        if (iconComponent) {
          iconNode.value = h(iconComponent)
          return
        }
      }
      catch {
        // 忽略错误，继续尝试其他方式
      }
      iconNode.value = h('i', { class: props.icon })
    }

    loadElementIcon() // 执行异步加载
  }
})
</script>

<template>
  <component :is="iconNode" v-if="iconNode" />
</template>
