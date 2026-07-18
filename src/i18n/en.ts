import type { ja } from './ja';

type TranslationResource = {
  [Namespace in keyof typeof ja]: { [Key in keyof (typeof ja)[Namespace]]: string };
};

export const en: TranslationResource = {
  common: {
    appName: 'foot-tactic',
    appDescription: 'Football tactics board + notes app',
    loading: 'Loading...',
  },
  login: {
    requiresGoogle: 'A Google account is required to use this app',
    button: 'Sign in with Google',
    busy: 'Signing in...',
    failed: 'Sign-in failed. Please try again later.',
  },
  projects: {
    title: 'Projects',
  },
  board: {
    title: 'Tactics Board',
  },
  settings: {
    title: 'Settings',
    language: 'Language',
    logout: 'Sign out',
    logoutFailed: 'Sign-out failed. Please try again.',
    deleteAccount: 'Delete account',
  },
};
