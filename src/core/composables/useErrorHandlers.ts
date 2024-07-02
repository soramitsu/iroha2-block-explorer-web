import { useNotifications } from './useNotifications';

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return '';
}

export const useErrorHandlers = () => {
  const notifications = useNotifications();

  function handleUnknownError(error: unknown) {
    console.error(error);

    const errorMessage = getErrorMessage(error);
    notifications.error(errorMessage);
  }

  return { handleUnknownError } as const;
};
