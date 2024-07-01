import type { AxiosInstance } from 'axios';
import { axiosInstance } from '@/api/instance';
import type { Paginated, PaginationParamsDto } from '@/core/types/common';
import type { AccountDto } from '@/api/accounts';
import type { AssetDefinitionDto } from '@/api/assets';

export interface DomainDto {
  id: string
  accounts: AccountDto[]
  asset_definitions: AssetDefinitionDto[]
  logo: null | string
  metadata: any
  /**
   * amount of triggers, always 0 for now
   */
  triggers: number
}

class DomainsApi {
  constructor(private readonly axiosInstance: AxiosInstance) {}

  fetchDomains(params?: PaginationParamsDto): Promise<Paginated<DomainDto>> {
    return this.axiosInstance.get('domains', { params }).then(({ data }) => data);
  }

  fetchDomain(id: string): Promise<DomainDto> {
    return this.axiosInstance.get(`/domains/${id}`).then(({ data }) => data);
  }
}

export default new DomainsApi(axiosInstance);
