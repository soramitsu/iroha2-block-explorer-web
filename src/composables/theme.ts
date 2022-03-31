import { ref, readonly } from 'vue';

export type Theme = 'light' | 'dark';

const active = ref<Theme>('light');

export function useTheme() {
  function set(value: Theme) {
    if (active.value === value) return;

    localStorage.setItem('theme', value);
    active.value = value;
    document.body.classList.remove('theme--light', 'theme--dark');
    document.body.classList.add(`theme--${value}`);
  }

  function init() {
    const stored = localStorage.getItem('theme');
    set(stored === 'dark' ? 'dark' : 'light');
  }

  function toggle() {
    const newValue = active.value === 'light' ? 'dark' : 'light';
    set(newValue);
  }

  return {
    active: readonly(active),
    set,
    init,
    toggle,
  };
}
