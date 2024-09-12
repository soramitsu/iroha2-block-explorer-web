import { useNotifications } from './notifications';
import { ZodError } from 'zod';

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

    if (error instanceof ZodError) {
      notifications.error(error.errors[0].code);
    } else {
      const errorMessage = getErrorMessage(error);
      notifications.error(errorMessage);
    }
  }

  return { handleUnknownError };
};
