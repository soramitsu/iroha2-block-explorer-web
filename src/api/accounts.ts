import { axiosInstance } from './instance';
import type { AxiosInstance } from 'axios';
import type { Paginated, PaginationParamsDto } from '@/core/types/common';
import type { RoleDto } from '@/api/roles';
import type { AssetDto } from '@/api/assets';

export interface PermissionToken {
  name: string
  params: any
}

export interface PublicKey {
  digest_function: string
  payload: string
}

export interface AccountDto {
  id: string
  assets: AssetDto[]
  metadata: any
  roles: RoleDto[]

  signatories?: PublicKey[]
  permission_tokens?: PermissionToken[]
  signature_check_condition?: any
}

class AccountsApi {
  constructor(private readonly axiosInstance: AxiosInstance) {}

  fetchAccounts(params?: PaginationParamsDto): Promise<Paginated<AccountDto>> {
    return this.axiosInstance.get('/accounts', { params }).then(({ data }) => data);
  }

  fetchAccount(id: string): Promise<AccountDto> {
    return this.axiosInstance.get(`/accounts/${id}`).then(({ data }) => data);
  }
}

export default new AccountsApi(axiosInstance);
