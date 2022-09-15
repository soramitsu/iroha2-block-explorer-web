import { randHexaDecimal, randNumber } from '@ngneat/falso';

export function pagination<T>(list: T[], params?: PaginationParams): Paginated<T> {
  const page = params?.page ?? 1;
  const page_size = params?.page_size ?? 10;
  const skip = (page - 1) * page_size;

  return {
    pagination: {
      page,
      page_size,
      total: list.length,
    },
    data: list.slice(skip, skip + page_size),
  };
}

export function list<T>(factory: () => T, length?: number): T[] {
  const n = length ?? randNumber({ min: 0, max: 30 });

  return new Array(n).fill(null).map(_ => factory());
}

export function hash(length: number) {
  return randHexaDecimal({ length }).join();
}
