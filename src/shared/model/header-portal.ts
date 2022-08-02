import { readonly, ref } from 'vue';

const isLangOpen = ref(false);
const isMenuOpen = ref(false);

function toggleLang() {
  isLangOpen.value = !isLangOpen.value;
  isMenuOpen.value = false;
}

function toggleMenu() {
  isLangOpen.value = false;
  isMenuOpen.value = !isMenuOpen.value;
}

export const useLangDropdown = () => ({
  isOpen: readonly(isLangOpen),
  toggle: toggleLang,
});

export const useMenuDropdown = () => ({
  isOpen: readonly(isMenuOpen),
  toggle: toggleMenu,
});
