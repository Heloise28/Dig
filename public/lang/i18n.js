let currentLanguage = 'en';
let translations = {};
let isLoaded = false;

// Load translation file
async function loadLanguage(lang) {
  const response = await fetch(`/public/lang/${lang}.json`);
  translations[lang] = await response.json();
  isLoaded = true;
}

// Get translation
export function t(key) {
  if (!translations[currentLanguage]) return key; // Prevent error
  return translations[currentLanguage][key] || key;
}

// Set language and reload translations
export async function setLanguage(lang) {
  currentLanguage = lang;
  await loadLanguage(lang);
}

// Wait for initial language to load
export async function initI18n() {
  await loadLanguage('en');
  return true;
}

// Check if translations are ready
export function isI18nReady() {
  return isLoaded;
}