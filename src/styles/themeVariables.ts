import {default as theme} from './theme.json';

export function ThemeVariables(isDarkMode = true) {
  return {
    colors: {
      primary: theme['color-primary-500'],
      success: theme['color-success-500'],
      info: theme['color-info-500'],
      warning: theme['color-warning-500'],
      danger: theme['color-danger-500'],
      dark: theme['color-basic-800'],
      light: theme['color-basic-200'],
      basic: isDarkMode ? theme['color-basic-800'] : theme['color-basic-200'],
      font: isDarkMode ? theme['color-basic-200'] : theme['color-basic-800'],
      itemBackground: isDarkMode ? '#ffffff15' : '#00000015',
    },
  };
}
