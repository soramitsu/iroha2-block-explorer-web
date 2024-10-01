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
    component: () => import('@/pages/BlocksListPage.vue'),
  },
  {
    path: '/blocks/:heightOrHash',
    name: 'blocks-details',
    component: () => import('@/pages/BlockDetailsPage.vue'),
  },

  {
    path: '/assets',
    name: 'assets-list',
    component: () => import('@/pages/AssetsListPage.vue'),
  },
  {
    path: '/assets/:id',
    name: 'asset-details',
    component: () => import('@/pages/AssetDetailsPage.vue'),
  },
  {
    path: '/accounts',
    name: 'accounts-list',
    component: () => import('@/pages/AccountsListPage.vue'),
  },
  {
    path: '/accounts/:id',
    name: 'account-details',
    component: () => import('@/pages/AccountDetailsPage.vue'),
  },
  {
    path: '/domains',
    name: 'domains-list',
    component: () => import('@/pages/DomainsListPage.vue'),
  },
  {
    path: '/domains/:id',
    name: 'domain-details',
    component: () => import('@/pages/DomainDetailsPage.vue'),
  },
  {
    path: '/transactions',
    name: 'transactions-list',
    component: () => import('@/pages/TransactionsListPage.vue'),
  },
  {
    path: '/transactions/:hash',
    name: 'transaction-details',
    component: () => import('@/pages/TransactionDetailsPage.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/pages/NotFoundPage.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
