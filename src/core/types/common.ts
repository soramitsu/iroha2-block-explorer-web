export interface Tagged<T, Content> {
  t: T
  c: Content
}

export interface PaginationParamsDto {
  page: number
  page_size: number
}

export interface PaginationInfo {
  page: number
  page_size: number
  total: number
}

export interface Paginated<T> {
  pagination: PaginationInfo
  data: T[]
}

export interface DropdownItem {
  label: string
  value: string | number
}
