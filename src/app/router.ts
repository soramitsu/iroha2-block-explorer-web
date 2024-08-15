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
    component: () => import('@/pages/Blocks/BlocksList.vue'),
  },
  {
    path: '/blocks/:height',
    name: 'blocks-details',
    component: () => import('@/pages/Blocks/BlockDetailsPage.vue'),
  },

  {
    path: '/assets',
    name: 'assets-list',
    component: () => import('@/pages/Assets/AssetsList.vue'),
  },
  {
    path: '/assets/:id',
    name: 'asset-details',
    component: () => import('@/pages/Assets/AssetDetailsPage.vue'),
  },
  {
    path: '/accounts',
    name: 'accounts-list',
    component: () => import('@/pages/Accounts/AccountsList.vue'),
  },
  {
    path: '/accounts/:id',
    name: 'account-details',
    component: () => import('@/pages/Accounts/AccountDetailsPage.vue'),
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
