import type { NotFoundStatus, UnknownErrorStatus } from '@/shared/api/consts';
import { NOT_FOUND_ERROR_STATUS } from '@/shared/api/consts';
import { NOT_FOUND_STATUS, UNKNOWN_ERROR_STATUS } from '@/shared/api/consts';

export type ErrorResponse = { status: NotFoundStatus } | { status: UnknownErrorStatus, error: Error };

export async function transformErrorResponse(response: Response): Promise<ErrorResponse> {
  if (response.status === NOT_FOUND_ERROR_STATUS) return { status: NOT_FOUND_STATUS };

  return { status: UNKNOWN_ERROR_STATUS, error: new Error(await response.text()) };
}
