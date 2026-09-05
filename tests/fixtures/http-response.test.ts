import { describe, expect, it } from 'vitest';
import { jsonResponse, testResponse } from './http-response';

describe('HTTP response fixtures', () => {
  it('streams UTF-8 bytes in the test realm without replacing Fetch response behavior', async () => {
    const response = testResponse('Kina ₭', { status: 503 });
    expect(response).toBeInstanceOf(Response);
    expect(response.ok).toBe(false);
    expect(response.status).toBe(503);
    const reader = response.body!.getReader();
    const { value } = await reader.read();
    expect(value).toBeInstanceOf(Uint8Array);
    expect(new TextDecoder().decode(value)).toBe('Kina ₭');
    expect((await reader.read()).done).toBe(true);
  });

  it('retains native JSON consumption and rejects a second body read', async () => {
    const response = jsonResponse({ amount: '123.45' }, { headers: { 'x-request-id': 'fixture' } });
    expect(response.headers.get('content-type')).toBe('application/json');
    expect(response.headers.get('x-request-id')).toBe('fixture');
    expect(await response.json()).toEqual({ amount: '123.45' });
    await expect(response.json()).rejects.toThrow();
  });

  it('preserves responses with no body and copies supplied byte buffers', async () => {
    expect(testResponse(null, { status: 204 }).body).toBeNull();
    const bytes = new Uint8Array([65, 66]);
    const response = testResponse(bytes);
    bytes.fill(67);
    expect(await response.text()).toBe('AB');
  });
});
