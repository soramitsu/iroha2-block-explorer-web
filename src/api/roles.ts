import type { AxiosInstance } from 'axios';
import { axiosInstance } from '@/api/instance';
import type { Paginated, PaginationParamsDto } from '@/core/types/common';
import type { PermissionToken } from '@/api/accounts';

export interface RoleDto {
  id: string
  permissions: PermissionToken[]
}

class RolesApi {
  constructor(private readonly axiosInstance: AxiosInstance) {}

  fetchRoles(params?: PaginationParamsDto): Promise<Paginated<RoleDto>> {
    return this.axiosInstance.get('/roles', { params }).then(({ data }) => data);
  }
}

export default new RolesApi(axiosInstance);
