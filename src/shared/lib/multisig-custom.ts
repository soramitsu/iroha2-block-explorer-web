import { noritoDecodeInstruction } from '@iroha/iroha-js/browser';
import { requireNetworkPrefix } from '@/shared/lib/network-prefix';

const MULTISIG_VARIANTS = ['Register', 'Propose', 'Approve', 'Cancel'] as const;

export type MultisigVariant = (typeof MULTISIG_VARIANTS)[number];

export interface MultisigCustomEnvelope {
  variant: MultisigVariant
  account: string
  instructions: string[]
  transaction_ttl_ms: number | null
}

export interface DecodedMultisigInstruction {
  index: number
  kind: string | null
  instruction: unknown | null
}

export interface MultisigCustomDisplayPayload {
  multisig: {
    variant: MultisigVariant
    account: string
    transaction_ttl_ms: number | null
    instructions_count: number
    decoded_instructions: DecodedMultisigInstruction[]
  }
  raw_payload: unknown
}

type AnyRecord = Record<string, unknown>;

const MULTISIG_VARIANT_SET = new Set<string>(MULTISIG_VARIANTS);

function asRecord(value: unknown): AnyRecord | null {
  return value && typeof value === 'object' ? (value as AnyRecord) : null;
}

function normalizeTtl(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function readMultisigVariantEntry(container: AnyRecord): { variant: MultisigVariant, body: AnyRecord } | null {
  const entries = Object.entries(container);
  if (entries.length !== 1) return null;

  const [variant, body] = entries[0];
  if (!MULTISIG_VARIANT_SET.has(variant)) return null;

  const bodyRecord = asRecord(body);
  if (!bodyRecord || typeof bodyRecord.account !== 'string') return null;

  return {
    variant: variant as MultisigVariant,
    body: bodyRecord,
  };
}

function extractEnvelope(entry: { variant: MultisigVariant, body: AnyRecord }): MultisigCustomEnvelope {
  const rawInstructions = Array.isArray(entry.body.instructions)
    ? entry.body.instructions.filter((item): item is string => typeof item === 'string')
    : [];

  return {
    variant: entry.variant,
    account: entry.body.account as string,
    instructions: rawInstructions,
    transaction_ttl_ms: normalizeTtl(entry.body.transaction_ttl_ms),
  };
}

function decodeBase64ToBytes(raw: string): Uint8Array | null {
  if (!raw || raw.trim() !== raw || raw.length % 4 !== 0 || !/^[A-Za-z0-9+/]*={0,2}$/.test(raw)) {
    return null;
  }

  try {
    const binary = atob(raw);
    if (!binary || btoa(binary) !== raw) return null;

    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index++) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  } catch {
    return null;
  }
}

function readDecodedInstructionKind(instruction: unknown): string | null {
  const instructionRecord = asRecord(instruction);
  if (!instructionRecord) return null;

  const variants = Object.keys(instructionRecord);
  return variants.length === 1 ? variants[0] ?? null : null;
}

function decodeNestedInstruction(encoded: string, index: number, networkPrefix: number): DecodedMultisigInstruction {
  const bytes = decodeBase64ToBytes(encoded);
  if (!bytes) {
    return {
      index,
      kind: null,
      instruction: null,
    };
  }

  try {
    const instruction = noritoDecodeInstruction(bytes, networkPrefix);
    return {
      index,
      kind: readDecodedInstructionKind(instruction),
      instruction,
    };
  } catch {
    return {
      index,
      kind: null,
      instruction: null,
    };
  }
}

export function readMultisigCustomEnvelope(payload: unknown): MultisigCustomEnvelope | null {
  const payloadRecord = asRecord(payload);
  if (!payloadRecord) return null;

  const directEntry = readMultisigVariantEntry(payloadRecord);
  if (directEntry) return extractEnvelope(directEntry);

  const nestedValue = asRecord(payloadRecord.value);
  if (!nestedValue) return null;

  const nestedEntry = readMultisigVariantEntry(nestedValue);
  if (!nestedEntry) return null;

  return extractEnvelope(nestedEntry);
}

export function buildMultisigCustomDisplayPayload(payload: unknown, networkPrefix: number): MultisigCustomDisplayPayload | null {
  requireNetworkPrefix(networkPrefix);
  const envelope = readMultisigCustomEnvelope(payload);
  if (!envelope) return null;

  return {
    multisig: {
      variant: envelope.variant,
      account: envelope.account,
      transaction_ttl_ms: envelope.transaction_ttl_ms,
      instructions_count: envelope.instructions.length,
      decoded_instructions: envelope.instructions.map((encoded, index) => decodeNestedInstruction(encoded, index, networkPrefix)),
    },
    raw_payload: payload,
  };
}
