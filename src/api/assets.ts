import type { AxiosInstance } from 'axios';
import { axiosInstance } from '@/api/instance';
import type { Paginated, PaginationParamsDto, Tagged } from '@/core/types/common';

export interface AssetDefinitionDto {
  id: string
  value_type: AssetValueType
  mintable: Mintable
}

export type Mintable = 'Once' | 'Infinitely' | 'Not';

export type AssetValueType = 'Quantity' | 'BigQuantity' | 'Fixed' | 'Store';

export type AssetValue =
  | Tagged<'Quantity', string>
  | Tagged<'BigQuantity', string>
  | Tagged<'Fixed', string>
  | Tagged<'Store', any>;

export interface AssetDto {
  account_id: string
  definition_id: string
  value: AssetValue
}

class AssetsApi {
  constructor(private readonly axiosInstance: AxiosInstance) {}

  fetchAssets(params?: PaginationParamsDto): Promise<Paginated<AssetDto>> {
    return this.axiosInstance.get('/assets', { params }).then(({ data }) => data);
  }

  fetchAssetDefinitions(params?: PaginationParamsDto): Promise<Paginated<AssetDefinitionDto>> {
    return this.axiosInstance.get('/asset-definitions', { params }).then(({ data }) => data);
  }

  fetchAsset(definition_id: string, account_id: string): Promise<AssetDto> {
    return this.axiosInstance.get(`/assets/${definition_id}/${account_id}`).then(({ data }) => data);
  }
}

export default new AssetsApi(axiosInstance);
