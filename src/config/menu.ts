import type { MenuList } from '~/types/menu'
import { BellFilled, DataBoard } from '@element-plus/icons-vue'

export const sideMenuList: MenuList = [
  {
    path: '/manage',
    title: '控制台',
    icon: DataBoard,
    meta: { cache: true },
  },
  {
    title: '通知管理',
    icon: BellFilled,
    meta: { cache: true },
    children: [
      {
        path: '/manage/notice',
        title: '通知管理',
      },
      {
        path: '/manage/notice/category',
        title: '通知分类管理',
      },
    ],
  },
]
