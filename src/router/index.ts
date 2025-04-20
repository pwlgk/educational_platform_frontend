// src/router/index.ts
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/store/auth.store';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: () => import('@/components/layout/DefaultLayout.vue'),
    // Все дочерние роуты наследуют meta отсюда, если не переопределено
    // meta: { requiresAuth: true }, // Можно задать здесь, если ВЕСЬ раздел требует входа
    children: [
      {
        path: '', // Путь по умолчанию '/'
        name: 'Dashboard',
        component: () => import('@/views/DashboardPage.vue'),
        meta: { requiresAuth: true }, // Явно указываем для главной
      },
      {
        path: 'news', // Список новостей
        name: 'NewsList',
        component: () => import('@/views/News/NewsListPage.vue'),
        // Можно сделать доступным без входа, если нужно
        // meta: { requiresAuth: true },
    },
    {
      path: 'forum', // Корневая страница форума (категории)
      name: 'ForumCategories',
      component: () => import('@/views/Forum/ForumCategoriesPage.vue'),
      // meta: { requiresAuth: true }, // Форум доступен без входа?
  },
  {
      path: 'forum/category/:categorySlug', // Темы в категории
      name: 'ForumTopics',
      component: () => import('@/views/Forum/ForumTopicsPage.vue'),
      props: true, // Передавать categorySlug как пропс
      // meta: { requiresAuth: true },
  },
   {
      path: 'forum/topic/:topicId(\\d+)', // Конкретная тема (посты)
      name: 'ForumTopic',
      component: () => import('@/views/Forum/ForumTopicPage.vue'),
      props: true, // Передавать topicId как пропс
      // meta: { requiresAuth: true },
  },
  {
      path: 'forum/category/:categorySlug/create-topic', // Создание темы
      name: 'ForumCreateTopic',
      component: () => import('@/views/Forum/CreateTopicPage.vue'),
      props: true,
      meta: { requiresAuth: true }, // Создание требует входа
  },
    {
      path: 'messaging', // Путь к мессенджеру
      name: 'Messaging',
      component: () => import('@/views/Messaging/ChatLayout.vue'),
      meta: { requiresAuth: true }, // Требует входа
      // Опционально: Дочерний роут для конкретного чата, если нужно
      // children: [
      //     { path: ':chatId', name: 'ChatDetail', component: ChatWindow, props: true }
      // ]
      // Но пока ChatWindow встроен в ChatLayout
  },
    {
        path: 'news/:id(\\d+)', // Детальная страница новости, :id - число
        name: 'NewsDetail',
        component: () => import('@/views/News/NewsDetailPage.vue'),
        // Можно сделать доступным без входа
        // meta: { requiresAuth: true },
        props: true // Передавать :id как пропс
    },
      {
        path: 'my-schedule',
        name: 'MySchedule',
        component: () => import('@/views/Schedule/MySchedulePage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'notifications',
        name: 'NotificationsPage',
        component: () => import('@/views/Notifications/NotificationsPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'profile',
        name: 'ProfileView',
        component: () => import('@/views/Profile/ProfileViewPage.vue'),
        meta: { requiresAuth: true },
      },
      {
        path: 'profile/edit',
        name: 'ProfileEdit',
        component: () => import('@/views/Profile/ProfileEditPage.vue'),
         meta: { requiresAuth: true },
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/Settings/SettingsPage.vue'),
         meta: { requiresAuth: true },
      },

      // --- Админские роуты ---
      {
        path: 'admin/users',
        name: 'AdminUserManagement', // Имя для страницы управления пользователями
        component: () => import('@/views/Admin/UserManagementPage.vue'),
        // Оба meta обязательны: нужно быть залогиненым И быть админом
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      { // <-- ДОБАВЛЯЕМ РОУТ ДЛЯ ПРИГЛАШЕНИЙ
        path: 'admin/invitations', // Путь к странице приглашений
        name: 'AdminInvitationCodes', // Имя для страницы управления приглашениями
        component: () => import('@/views/Admin/InvitationCodePage.vue'),
        // Оба meta обязательны
        meta: { requiresAuth: true, requiresAdmin: true }
      },
      // --- Конец админских роутов ---

      // ... другие роуты внутри DefaultLayout ...
    ],
  },
  {
    path: '/auth',
    component: () => import('@/components/layout/AuthLayout.vue'),
    meta: { requiresGuest: true }, // Весь раздел только для неавторизованных
    children: [
       {
            path: 'login',
            name: 'Login',
            component: () => import('@/views/Auth/LoginPage.vue'),
            // meta: { requiresGuest: true } // Наследуется
        },
        {
            path: 'register',
            name: 'Register',
            component: () => import('@/views/Auth/RegisterPage.vue'),
             // meta: { requiresGuest: true } // Наследуется
        },
        // {
        //     path: 'confirm/:token',
        //     name: 'EmailConfirm',
        //     component: () => import('@/views/Auth/EmailConfirmPage.vue'),
        //     props: true,
        //     meta: { requiresGuest: false } // Доступно всем, переопределяем родительский meta
        // },
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundPage.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

// --- Навигационный гард (без изменений) ---
router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();
    while (!authStore.getIsInitialized) {
      console.log('[Guard] Waiting for auth initialization...');
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    const isAuthenticated = authStore.isAuthenticated;
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const requiresGuest = to.matched.some(record => record.meta.requiresGuest);
    const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);

    console.log(`[Guard] Navigating to: ${to.path}, Matched depth: ${to.matched.length}, Auth: ${isAuthenticated}, requiresAuth: ${requiresAuth}, requiresGuest: ${requiresGuest}, requiresAdmin: ${requiresAdmin}, UserRole: ${authStore.getUserRole}`);

    if (requiresAuth && !isAuthenticated) {
      console.log('[Guard] Redirecting to Login (requiresAuth failed)');
      next({ name: 'Login', query: { redirect: to.fullPath } });
    } else if (requiresGuest && isAuthenticated) {
      console.log('[Guard] Redirecting to Dashboard (requiresGuest failed)');
      next({ name: 'Dashboard' });
    } else if (requiresAdmin && !authStore.isAdmin) {
      console.warn(`[Guard] Access denied for non-admin to ${to.path}. Redirecting to Dashboard.`);
      next({ name: 'Dashboard' });
    } else {
      console.log('[Guard] Allowing navigation.');
      next();
    }
});

export default router;