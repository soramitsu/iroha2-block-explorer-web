import type { NotFound, UnknownError } from '@/shared/api/consts';
import { NOT_FOUND_ERROR_STATUS, NOT_FOUND, UNKNOWN_ERROR } from '@/shared/api/consts';

export type ErrorResponse = { status: NotFound } | { status: UnknownError, error: Error };

export async function transformErrorResponse(response: Response): Promise<ErrorResponse> {
  if (response.status === NOT_FOUND_ERROR_STATUS) return { status: NOT_FOUND };

  return { status: UNKNOWN_ERROR, error: new Error(await response.text()) };
}
