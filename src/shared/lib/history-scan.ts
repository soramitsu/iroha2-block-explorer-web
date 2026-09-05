import { z } from 'zod/v4';
import { HistoryCursorPagination } from '@/shared/api/schemas';

const OpaqueCursor = z.string().min(1).max(1424).regex(/^[A-Za-z0-9_-]+$/u);
const Snapshot = z.object({
  height: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER),
  hash: z.string().regex(/^[0-9a-f]{64}$/u).nullable(),
}).strict().refine((value) => (value.height === 0) === (value.hash === null));

export const HistoryScanCursorSchema = z.object({
  nextCursor: OpaqueCursor.nullable(),
  snapshot: Snapshot.nullable(),
  visitedCursors: OpaqueCursor.array(),
}).strict();

export type HistoryScanCursor = z.infer<typeof HistoryScanCursorSchema>;

export function createHistoryScanCursor(): HistoryScanCursor {
  return { nextCursor: null, snapshot: null, visitedCursors: [] };
}

/** Keep every continuation bound to the first server-issued history snapshot. */
export function advanceHistoryScanCursor(
  current: HistoryScanCursor,
  value: z.infer<typeof HistoryCursorPagination>
): HistoryScanCursor {
  const pagination = HistoryCursorPagination.parse(value);
  if (current.snapshot !== null && (
    current.snapshot.height !== pagination.snapshot_height ||
    current.snapshot.hash !== pagination.snapshot_hash
  )) {
    throw new Error('Explorer history snapshot changed during the scan');
  }
  const nextCursor = pagination.next_cursor;
  if (nextCursor !== null && (nextCursor === current.nextCursor || current.visitedCursors.includes(nextCursor))) {
    throw new Error('Explorer history cursor did not advance');
  }
  return {
    nextCursor,
    snapshot: { height: pagination.snapshot_height, hash: pagination.snapshot_hash },
    visitedCursors: nextCursor === null ? current.visitedCursors : [...current.visitedCursors, nextCursor],
  };
}
