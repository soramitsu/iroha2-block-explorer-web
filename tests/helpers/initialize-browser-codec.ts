import { createHash } from 'node:crypto';
import { readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';

// Independently checked against the admitted browser-codec106 consumer packet.
// Only transport is supplied here: the SDK loads and executes its own real Wasm.
const expectedWasmSha256 = 'fbc434ef49154351478b49524e44e0f2f08b71ce38be4912ec4e73ff546863eb';
const wasmPath = realpathSync(path.resolve(
  process.cwd(),
  'node_modules/@iroha/iroha-js/dist/wasm/iroha_js_codec_wasm_bg.wasm'
));
const wasmBytes = readFileSync(wasmPath);
if (createHash('sha256').update(wasmBytes).digest('hex') !== expectedWasmSha256) {
  throw new Error('Unit tests require the exact admitted package-owned browser codec Wasm.');
}

/** Initialize the current SDK module instance, including after vi.resetModules. */
export async function initializeTestBrowserCodec(): Promise<void> {
  // A static SDK import would retain the old codec after a test resets modules.
  const { initializeBrowserCodec } = await import('@iroha/iroha-js/browser-codec');
  const previousFetch = globalThis.fetch;
  const localOrigin = globalThis.location.origin;
  const allowedUrls = new Set([
    new URL(`/@fs${wasmPath}`, localOrigin).href,
    new URL(`/${path.relative(process.cwd(), wasmPath).split(path.sep).join('/')}`, localOrigin).href,
  ]);
  globalThis.fetch = async (input, init) => {
    const requested = input instanceof Request ? input.url : String(input);
    if (!allowedUrls.has(requested)) {
      throw new Error(`Unexpected browser codec test transport URL: ${requested}`);
    }
    if (init?.credentials !== 'omit' || init.redirect !== 'error') {
      throw new Error('Browser codec transport must omit credentials and reject redirects.');
    }
    return new Response(Uint8Array.from(wasmBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/wasm',
        'Content-Length': String(wasmBytes.length),
      },
    });
  };
  try {
    await initializeBrowserCodec();
  } finally {
    globalThis.fetch = previousFetch;
  }
}
