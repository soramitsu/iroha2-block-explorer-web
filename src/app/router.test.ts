import { describe, expect, it } from 'vitest';
import { routes } from './router';

describe('router', () => {
  it('registers tracing workspace route', () => {
    expect(routes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '/tracing',
          name: 'tracing-workspace',
        }),
      ])
    );
  });

  it('registers dataspaces detail route', () => {
    expect(routes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '/dataspaces/:laneId/:dataspaceId',
          name: 'dataspaces-details',
        }),
      ])
    );
  });

  it('registers the kotodama studio route', () => {
    expect(routes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '/studio',
          name: 'kotodama-studio',
        }),
      ])
    );
  });

  it('registers the soracloud route', () => {
    expect(routes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '/soracloud',
          name: 'soracloud',
        }),
      ])
    );
  });

  it('registers the VPN stats route', () => {
    expect(routes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '/vpn',
          name: 'vpn-stats',
        }),
      ])
    );
  });

  it('registers the smart contracts route', () => {
    expect(routes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '/contracts',
          name: 'smart-contracts',
        }),
      ])
    );
  });

  it('registers exact search before the final catch-all route', () => {
    expect(routes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: '/search',
          name: 'search-results',
        }),
      ])
    );
    expect(routes.at(-1)).toEqual(expect.objectContaining({ path: '/:pathMatch(.*)*' }));
  });
});
