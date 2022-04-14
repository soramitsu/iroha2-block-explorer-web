import { ref } from 'vue';

export interface CreateNotificationData {
  type: 'success' | 'error',
  message: string,
  autoClosing?: boolean,
};

export interface NotificationData extends CreateNotificationData {
  id: number,
}

const AUTO_CLOSING_INTERVAL = 4000;

const list = ref<NotificationData[]>([]);
let id = 0;

function close(id: number) {
  list.value = list.value.filter(item => item.id !== id);
}

function show(data: CreateNotificationData) {
  list.value.push({ ...data, id: id++ });
};

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

setInterval(() => {
  // auto remove by default
  const item = list.value.find(el => el.autoClosing !== false);

  if (item) close(item.id);
}, AUTO_CLOSING_INTERVAL);
