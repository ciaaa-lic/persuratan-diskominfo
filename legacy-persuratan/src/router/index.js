import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/admin',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      {
        path: 'dashboard',
        name: 'DashboardAdmin',
        component: () => import('../views/DashboardAdmin.vue')
      },
      {
        path: 'rekap',
        name: 'RekapSurat',
        component: () => import('../views/RekapSurat.vue')
      },
      {
        path: 'bidang',
        name: 'ArsipBidang',
        component: () => import('../views/ArsipBidang.vue')
      },
      {
        path: '',
        redirect: '/admin/dashboard'
      }
    ]
  },
  {
    path: '/user',
    component: () => import('../layouts/UserLayout.vue'),
    meta: { requiresAuth: true, role: 'user' },
    children: [
      {
        path: 'dashboard',
        name: 'DashboardBidang',
        component: () => import('../views/DashboardBidang.vue')
      },
      {
        path: 'pengajuan',
        name: 'PengajuanSurat',
        component: () => import('../views/PengajuanSurat.vue')
      },
      {
        path: '',
        redirect: '/user/dashboard'
      }
    ]
  },
  // Catch all
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/')
  } else if (to.meta.requiresGuest && isAuthenticated) {
    if (authStore.isAdmin) next('/admin/dashboard')
    else next('/user/dashboard')
  } else if (to.meta.requiresAuth && to.meta.role && authStore.user?.role !== to.meta.role) {
    // Redirect if they try to access a route for a different role
    if (authStore.isAdmin) next('/admin/dashboard')
    else next('/user/dashboard')
  } else {
    next()
  }
})

export default router
