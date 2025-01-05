import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import Auth from '@/components/Auth.vue'
import AboutView from '@/views/VideoPlayer.vue'
import VideoListView from '@/views/VideoListView.vue'
import VideoPlayer from '@/views/VideoPlayer.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/auth',
      name: 'Auth',
      component: Auth
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        requiresAuth: true,
        title: 'Главная страница'
      }
    },
    {
      path: '/cameras',
      name: 'cameras',
      component: VideoListView,
      meta: {
        requiresAuth: true,
        title: 'Камеры'
      }
    },
    {
      path: '/VideoPlayer/:videoName/:videoPath',
      name: 'VideoPlayer',
      component: VideoPlayer,
      props: true,
      meta: {
        requiresAuth: true,
        title: ':videoName'
      }
    }
  ],
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('auth');

  // Обновляем title страницы перед переходом
  if (to.meta.title && to.meta.title.includes(':videoName')) {
    to.meta.title = to.meta.title.replace(':videoName', to.params.videoName || '');
  }

  // Переход в зависимости от статуса авторизации
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/auth');
  } else {
    next();
  }
});

export default router
