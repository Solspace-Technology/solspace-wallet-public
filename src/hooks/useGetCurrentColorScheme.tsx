import {useAppState} from '../providers/appState-context';

export function useGetCurrentColorScheme() {
  const {
    state: {settings},
  } = useAppState();

  const isDarkMode = settings.find(
    ({name}: {name: string}) => name === 'darkMode',
  ).value;

  if (isDarkMode) {
    return 'dark';
  }
  if (!isDarkMode) {
    return 'light';
  }
}
