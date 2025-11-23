import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { ThemeProvider, createTheme, type PaletteMode, type ThemeOptions } from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline';


type colorMode = 'light' | 'dark';

interface ColorModeContextValue {
    mode: colorMode;
    toggleColorMode: () => void;
}

export function useColorMode() {
    const ctx = useContext(ColorModeContext);
    if (!ctx) {
        throw new Error('useColorMode must be used within ColorModeProvider');
    }
    return ctx;
}

const getDesignTokens = (mode: PaletteMode): ThemeOptions => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light mode
          primary: {
            main: '#5f5b53',      // lämmin neutraali (napit, linkit, accent)
          },
          secondary: {
            main: '#d4a574',      // hillitty “sand”-accent
          },
          background: {
            default: '#f2f2f0',   // sivun tausta (vaalea, hieman lämmin)
            paper: '#ffffff',     // kortit, header, welcome-hero
          },
          text: {
            primary: '#1f1f1f',
            secondary: '#5f5f5f',
          },
        }
      : {
          // Dark mode
          primary: {
            main: '#e0ded8',      // vaalea lämmin harmaa korostuksiin
          },
          secondary: {
            main: '#d4a574',      // sama accent sävy toimii myös tummassa
          },
          background: {
            default: '#101010',   // tumma tausta
            paper: '#181818',     // header, kortit, welcome-hero
          },
          text: {
            primary: '#f5f5f5',
            secondary: '#b0b0b0',
          },
        }),
  },
});

const ColorModeContext = createContext<ColorModeContextValue | undefined>(undefined);

export default function ColorModeProvider({ children }: { children: ReactNode }) {
    const [mode, setMode] = useState<colorMode>('light');

    const value = useMemo(() => ({
        mode,
        toggleColorMode: () =>
            setMode(prev => prev === 'light' ? 'dark' : 'light')
    }), [mode]);

    const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);

    return (
        <ColorModeContext.Provider value={value}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                {children}
            </ThemeProvider>
        </ColorModeContext.Provider>
    );
}