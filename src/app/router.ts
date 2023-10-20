import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('~pages/HomePage.vue'),
  },
  {
    path: '/blocks',
    name: 'blocks-list',
    component: () => import('~pages/BlocksList.vue'),
  },
  {
    path: '/blocks/:id',
    name: 'block-details',
    component: () => import('~pages/BlockDetails.vue'),
  },
  {
    path: '/assets',
    name: 'assets-list',
    component: () => import('~pages/AssetsList.vue'),
  },
  {
    path: '/accounts',
    name: 'accounts-list',
    component: () => import('~pages/AccountsList.vue'),
  },
  {
    path: '/domains',
    name: 'domains-list',
    component: () => import('~pages/DomainsList.vue'),
  },
  {
    path: '/transactions',
    name: 'transactions-list',
    component: () => import('~pages/TransactionsList.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('~pages/NotFound.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
