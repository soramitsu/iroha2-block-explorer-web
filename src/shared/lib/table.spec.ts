import {  describe, test, expect } from 'vitest'
import { deferred } from '@vue-kakuyaku/core'
import {useTable} from "~shared/lib/table";

describe('useTable', () => {
  async function fetchFn(params: PaginationParams): Promise<Paginated<{ index: number }>> {
    const data: { index: number }[] = []
    for (let i = 0; i < params.page_size; i++) {
      data.push({ index: i + params.page * params.page_size })
    }

    return {
      pagination: {...params, total: Infinity},
      data
    }
  }

  test('init state', () => {
    const state = useTable(fetchFn)

    expect(state.loading.value).toBe(false)
    expect(state.items.value).toEqual([])
    expect(state.pagination.value).toMatchInlineSnapshot(`
      {
        "page": 1,
        "page_size": 10,
        "pages": 1,
        "total": 10,
      }
    `)
  })

  test('loading=true after fetch()', () => {
    const state = useTable(fetchFn)

    state.fetch()

    expect(state.loading.value).toBe(true)
  })

  test('items are updated after fetch is done', async () => {
    const fetchDeferred = deferred<Paginated<{ index: number }>>()
    const state = useTable(() => fetchDeferred)

    state.fetch();

    await fetchDeferred.resolve(await fetchFn({ page: 1, page_size: 5 }))

    expect(state.loading.value).toBe(false)
    expect(state.items.value).toMatchInlineSnapshot(`
      [
        {
          "index": 5,
        },
        {
          "index": 6,
        },
        {
          "index": 7,
        },
        {
          "index": 8,
        },
        {
          "index": 9,
        },
      ]
    `)
    expect(state.pagination.value).toMatchInlineSnapshot(`
      {
        "page": 1,
        "page_size": 5,
        "pages": Infinity,
        "total": Infinity,
      }
    `)
  })
})