import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('./views/HomePage.vue'),
  },
  {
    path: '/transactions',
    name: 'transactions-list',
    component: () => import('./views/TransactionsListPage.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
