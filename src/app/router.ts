import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/pages/HomePage.vue'),
  },
  {
    path: '/blocks',
    name: 'blocks-list',
    component: () => import('@/pages/BlocksList.vue'),
  },
  {
    path: '/blocks/:heightOrHash',
    name: 'blocks-details',
    component: () => import('@/pages/BlockDetailsPage.vue'),
  },

  {
    path: '/assets',
    name: 'assets-list',
    component: () => import('@/pages/AssetsList.vue'),
  },
  {
    path: '/assets/:id',
    name: 'asset-details',
    component: () => import('@/pages/AssetDetailsPage.vue'),
  },
  {
    path: '/accounts',
    name: 'accounts-list',
    component: () => import('@/pages/AccountsList.vue'),
  },
  {
    path: '/accounts/:id',
    name: 'account-details',
    component: () => import('@/pages/AccountDetailsPage.vue'),
  },
  {
    path: '/domains',
    name: 'domains-list',
    component: () => import('@/pages/DomainsList.vue'),
  },
  {
    path: '/transactions',
    name: 'transactions-list',
    component: () => import('@/pages/TransactionsList.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/pages/NotFound.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
