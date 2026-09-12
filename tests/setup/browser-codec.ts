import path from 'node:path';
import { expect } from 'vitest';

// Bootstrap tests deliberately control an uninitialized codec and its promise.
// Node-only transport/config tests do not execute browser-owned account APIs.
const bootstrapTest = path.resolve(process.cwd(), 'src/app/main.test.ts');
if (typeof window !== 'undefined' && expect.getState().testPath !== bootstrapTest) {
  const { initializeTestBrowserCodec } = await import('../helpers/initialize-browser-codec');
  await initializeTestBrowserCodec();
}
