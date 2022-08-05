import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('./views/HomePage.vue'),
  },
  {
    path: '/blocks',
    name: 'blocks-list',
    component: () => import('./views/BlocksList.vue'),
  },
  {
    path: '/assets',
    name: 'assets-list',
    component: () => import('./views/AssetsList.vue'),
  },
  {
    path: '/accounts',
    name: 'accounts-list',
    component: () => import('./views/AccountsList.vue'),
  },
  {
    path: '/domains',
    name: 'domains-list',
    component: () => import('./views/DomainsList.vue'),
  },
  {
    path: '/transactions',
    name: 'transactions-list',
    component: () => import('./views/TransactionsListPage.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('./views/NotFound.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
