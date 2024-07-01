import { defineStore } from 'pinia';
import { ref, shallowRef } from 'vue';
import type { PaginationParamsDto } from '@/core/types/common';
import type { RoleDto } from '@/api/roles';
import rolesApi from '@/api/roles';

export const useRolesStore = defineStore('roles', () => {
  const isLoading = ref(false);
  const roles = shallowRef<RoleDto[]>([]);

  async function fetchRoles(params?: PaginationParamsDto) {
    try {
      isLoading.value = true;
      const { data } = await rolesApi.fetchRoles(params);
      roles.value = data;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    isLoading,
    roles,
    fetchRoles,
  };
});
