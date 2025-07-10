import React from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from '../context/AuthContext';

import paperTheme from './theme';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={paperTheme}>
          <AuthProvider>
            <Stack screenOptions={{ headerShown: false }}>
              {/* Rutas principales */}
              <Stack.Screen name="index" />
              <Stack.Screen name="(tabs)" />

              {/* Deep links de pago */}
              <Stack.Screen name="pago-exitoso" />
              <Stack.Screen name="pago-fallido" />

              {/* Fallback */}
              <Stack.Screen
                name="+not-found"
                options={{ title: 'Página no encontrada' }}
              />
            </Stack>
          </AuthProvider>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
