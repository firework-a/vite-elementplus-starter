import type { Component } from 'vue'
import type { RouteMeta } from 'vue-router'

export interface MenuItem {
  path?: string
  title: string
  icon?: Component
  children?: MenuItem[]
  meta?: RouteMeta & {
    affix?: boolean
    cache?: boolean
    system?: boolean
    adminOnly?: boolean
    permission?: string
  }
}

export type MenuList = MenuItem[]
