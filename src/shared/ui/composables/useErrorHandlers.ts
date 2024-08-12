import { useNotifications } from './notifications';

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

  return { handleUnknownError };
};
