import { z } from 'zod';
import { isCanonicalIrohaHashLiteral32 } from '@/shared/lib/iroha-hash';

const CheckedNetworkIdSchema = z.string().refine(isCanonicalIrohaHashLiteral32);

const RuntimeConfigSchema = z
  .object({
    toriiBaseUrl: z.string().trim().min(1).optional(),
    networkId: CheckedNetworkIdSchema.optional(),
    kotodamaCompilerUrl: z.string().trim().min(1).optional(),
    sorafsPublicBaseUrl: z.string().trim().min(1).optional(),
    toriiForceBaseUrl: z.boolean().optional(),
    toriiEconometricsEndpointsEnabled: z.boolean().optional(),
    toriiFailoverEnabled: z.boolean().optional(),
    toriiFailoverNodes: z.array(z.string().trim().min(1)).optional(),
    toriiFailoverFailureThreshold: z.number().int().min(1).optional(),
    toriiFailoverWindowMs: z.number().int().min(1).optional(),
    toriiFailoverProbeTimeoutMs: z.number().int().min(1).optional(),
    toriiFailoverPersistSwitch: z.boolean().optional(),
    toriiFailoverMaxPeerCandidates: z.number().int().min(1).optional(),
    toriiRequestTimeoutMs: z.number().int().min(1).optional(),
    toriiRequestRetryCount: z.number().int().min(0).optional(),
    toriiRequestRetryBaseDelayMs: z.number().int().min(0).optional(),
  })
  .strict();

const BpngRuntimeConfigSchema = z
  .object({
    toriiBaseUrl: z.literal('https://taira.sora.org'),
    toriiForceBaseUrl: z.literal(true),
    networkId: CheckedNetworkIdSchema,
  })
  .strict();

export type RuntimeConfig = z.infer<typeof RuntimeConfigSchema>;

const CONFIGURATION_ERROR_MESSAGE = 'Explorer runtime configuration is unavailable or invalid.';
let runtimeConfig: RuntimeConfig = {};
let loadPromise: Promise<RuntimeConfig> | null = null;

export function getRuntimeConfig(): RuntimeConfig {
  return runtimeConfig;
}

export async function loadRuntimeConfig(): Promise<RuntimeConfig> {
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    if (typeof window === 'undefined') return runtimeConfig;

    const baseUrl = String(import.meta.env.BASE_URL ?? '/');
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const primaryUrl = `${normalizedBaseUrl}config.json`;
    const candidates = primaryUrl === '/config.json' ? [primaryUrl] : [primaryUrl, '/config.json'];
    const requiresBpngProfile = window.location.hostname === 'explorer-bpng.soramitsu.io';
    const schema = requiresBpngProfile ? BpngRuntimeConfigSchema : RuntimeConfigSchema;

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 1500);

    try {
      for (const url of candidates) {
        const res = await fetch(url, {
          headers: { Accept: 'application/json' },
          cache: 'no-store',
          signal: controller.signal,
        });

        if (!res.ok) {
          if (res.status === 404 && !requiresBpngProfile) continue;
          throw new Error(CONFIGURATION_ERROR_MESSAGE);
        }

        const json = await res.json();
        const parsed = schema.safeParse(json);
        if (!parsed.success) throw new Error(CONFIGURATION_ERROR_MESSAGE);

        runtimeConfig = parsed.data;
        return runtimeConfig;
      }

      return runtimeConfig;
    } catch {
      // Never expose response bodies, schema inputs, or transport error details.
      throw new Error(CONFIGURATION_ERROR_MESSAGE);
    } finally {
      window.clearTimeout(timeout);
    }
  })();

  try {
    return await loadPromise;
  } catch (error) {
    // Failed loads are not a cached success: explicit retries fetch the same
    // configured location again without selecting another blockchain endpoint.
    loadPromise = null;
    throw error;
  }
}
