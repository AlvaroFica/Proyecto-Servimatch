// app/theme.ts
import { MD3LightTheme } from 'react-native-paper';

// Clonamos el tema Material 3 Light y sobreescribimos colores y elevaciones
const paperTheme = {
  ...MD3LightTheme,

  colors: {
    ...MD3LightTheme.colors,

    primary: '#006D77',        // verde azulado
    onPrimary: '#FFFFFF',
    secondary: '#83C5BE',      // verde suave
    onSecondary: '#000000',

    background: '#e4e6eb',     // crema muy claro
    onBackground: '#202C39',   // gris oscuro para texto
    surface: '#FFFFFF',
    onSurface: '#202C39',

    error: '#D00000',          // rojo vibrante
    onError: '#FFFFFF',
  },

  elevation: {
    level0: 0,
    level1: 2,
    level2: 4,
    level3: 6,
    level4: 8,
    level5: 12,
  },
};

export default paperTheme;
