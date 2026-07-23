import { readFileSync, realpathSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const IROHA_ROOT = realpathSync(path.resolve(process.cwd(), '../iroha'));

describe('canonical Rust Kotodama parity boundary', () => {
  it('keeps fixture refresh rooted in the exact sibling Iroha Rust compiler', () => {
    const refreshScript = readFileSync(
      path.resolve(process.cwd(), 'scripts/refresh-kotodama-parity.mjs'),
      'utf8'
    );

    expect(refreshScript).toContain("path.resolve(repoRoot, '../iroha')");
    expect(refreshScript).toContain("baseArgs: ['run', '-q', '-p', 'ivm', '--bin', 'koto_compile', '--']");
    expect(refreshScript).toContain("path.resolve(irohaRoot, 'crates/kotodama_lang/src/samples')");
    expect(refreshScript).toContain("path.resolve(irohaRoot, 'examples')");
    expect(refreshScript).not.toContain('compileKotodamaStudioProgram');
  });

  it('binds the Node adapter to the canonical Rust host instead of a JavaScript compiler', () => {
    const packageIndex = readFileSync(
      path.join(IROHA_ROOT, 'javascript/iroha_js/src/kotodamaCompiler/index.js'),
      'utf8'
    );
    const nativeBridge = readFileSync(
      path.join(IROHA_ROOT, 'javascript/iroha_js/src/kotodamaCompiler/nativeBridge.js'),
      'utf8'
    );
    const hostSource = readFileSync(
      path.join(IROHA_ROOT, 'crates/iroha_js_host/src/lib.rs'),
      'utf8'
    );

    expect(packageIndex).toContain('compileKotodamaWithNativeBinding');
    expect(nativeBridge).toContain('native.compileKotodama(request)');
    expect(hostSource).toMatch(/pub async fn compile_kotodama[\s\S]*tokio::task::spawn_blocking/u);
    expect(hostSource).toContain('CompilerOptions');
  });

  it('keeps Explorer production code as a package facade with no compiler implementation', () => {
    const explorerFacade = readFileSync(
      path.resolve(process.cwd(), 'src/shared/lib/kotodama-studio-compiler.ts'),
      'utf8'
    );

    expect(explorerFacade.trim()).toBe(
      "export * from '@iroha/iroha-js/kotodama-compiler';"
    );
  });
});
