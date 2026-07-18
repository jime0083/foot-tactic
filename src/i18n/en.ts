import type { ja } from './ja';

/** jaと同じネスト構造を強制する型(末端はstring) */
type DeepTranslation<T> = {
  [Key in keyof T]: T[Key] extends string ? string : DeepTranslation<T[Key]>;
};

type TranslationResource = DeepTranslation<typeof ja>;

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
    sportLabel: 'Sport',
    layoutLabel: 'View',
    aspectLabel: 'Aspect',
    sport: {
      soccer11: '11-a-side',
      soccer8: '8-a-side',
      futsal: 'Futsal',
    },
    colors: {
      title: 'Colors',
      background: 'Background',
      line: 'Lines',
      lane: 'Lanes',
      laneOpacity: 'Lane opacity',
      zone: 'Zones',
      zoneOpacity: 'Zone opacity',
    },
    layout: {
      'full-landscape': 'Full pitch (landscape)',
      'full-portrait': 'Full pitch (portrait)',
      'half-home-landscape': 'Own half (landscape)',
      'half-away-landscape': 'Opponent half (landscape)',
      'half-home-portrait': 'Own half (portrait)',
      'half-away-portrait': 'Opponent half (portrait)',
      'penalty-home-portrait': 'Own goal area (portrait)',
      'penalty-away-portrait': 'Opponent goal area (portrait)',
    },
  },
  settings: {
    title: 'Settings',
    language: 'Language',
    logout: 'Sign out',
    logoutFailed: 'Sign-out failed. Please try again.',
    deleteAccount: 'Delete account',
  },
};
