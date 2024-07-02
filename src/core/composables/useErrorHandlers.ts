import { useNotifications } from './useNotifications';
import { ref } from 'vue';

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return '';
}

const isFakeApi = ref(true);

export function enableApi() {
  isFakeApi.value = false;
}

export const useErrorHandlers = () => {
  const notifications = useNotifications();

  function handleUnknownError(error: unknown) {
    if (isFakeApi.value) return;

    console.error(error);

    const errorMessage = getErrorMessage(error);
    notifications.error(errorMessage);
  }

  return { handleUnknownError } as const;
};
