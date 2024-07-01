import { ref } from 'vue';

export interface NotificationDataBlank {
  type: 'success' | 'error'
  message: string
  autoClosing?: boolean
}

export interface NotificationData extends NotificationDataBlank {
  id: number
}

const AUTO_CLOSING_TIMEOUT = 4000;

const list = ref<NotificationData[]>([]);
let id = 0;

function close(id: number) {
  list.value = list.value.filter((item) => item.id !== id);
}

function show(data: NotificationDataBlank) {
  const itemId = id++;
  list.value.push({ ...data, id: itemId });

  // auto remove by default
  if (data.autoClosing !== false) {
    setTimeout(() => close(itemId), AUTO_CLOSING_TIMEOUT);
  }
}

function error(message: string) {
  show({ type: 'error', message });
}

function success(message: string) {
  show({ type: 'success', message });
}

export function useNotifications() {
  return {
    list,
    show,
    close,
    error,
    success,
  };
}
