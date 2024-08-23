import { useNotifications } from './notifications';
import type { ZodError } from 'zod';

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

export const useErrorHandlers = () => {
  const notifications = useNotifications();

  function handleUnknownError(error: unknown) {
    console.error(error);

    const errorMessage = getErrorMessage(error);
    notifications.error(errorMessage);
  }

  function handleZodError(error: ZodError) {
    console.error(error);

    notifications.error(error.errors[0].code);
  }

  return { handleUnknownError, handleZodError };
};
