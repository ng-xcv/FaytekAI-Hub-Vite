import PropTypes from 'prop-types';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { CssBaseline } from '@mui/material';
import { createTheme, ThemeProvider as MUIThemeProvider, StyledEngineProvider } from '@mui/material/styles';
import palette from './palette';
import typography from './typography';
import shadows, { customShadows } from './shadows';

ThemeProvider.propTypes = { children: PropTypes.node };

export default function ThemeProvider({ children }) {
  const themeMode = useSelector((s) => s.settings.themeMode);
  const currentPalette = palette[themeMode] || palette.dark;
  const currentShadows = themeMode === 'light' ? shadows.light : shadows.dark;
  const currentCustomShadows = themeMode === 'light' ? customShadows.light : customShadows.dark;

  const themeOptions = useMemo(() => ({
    palette: currentPalette,
    typography,
    shape: { borderRadius: 8 },
    direction: 'ltr',
    shadows: currentShadows,
    customShadows: currentCustomShadows,
  }), [themeMode]); // eslint-disable-line

  const theme = createTheme(themeOptions);

  return (
    <StyledEngineProvider injectFirst>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </StyledEngineProvider>
  );
}
