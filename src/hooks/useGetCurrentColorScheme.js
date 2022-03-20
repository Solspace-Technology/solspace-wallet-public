import {useAppState} from '../providers/appState-context';

export function useGetCurrentColorScheme() {
  let {
    state: {settings},
  } = useAppState();

  let isDarkMode = settings.find(({name}) => name === 'darkMode').value;

  if (isDarkMode) {
    return 'dark';
  }
  if (!isDarkMode) {
    return 'light';
  }
}
