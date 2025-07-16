// PagoScreen.tsx

import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';
import { useAuth } from '../context/AuthContext';

export default function PagoScreen() {
  const { planId, dia, horaInicio, metodo } = useLocalSearchParams<{
    planId: string;
    dia: string;
    horaInicio: string;
    metodo: string;
  }>();
  const { tokens } = useAuth();
  const [urlPago, setUrlPago] = useState<string | null>(null);

  useEffect(() => {
    // Llamar al backend para crear sesión de pago y obtener URL
    fetch(`http://192.168.100.4:8000/api/pagos/crear/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${tokens?.access}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ plan: planId, dia, hora_inicio: horaInicio, metodo }),
    })
      .then(r => r.json())
      .then(data => setUrlPago(data.url))  // backend devuelve { url: 'https://...' }
      .catch(console.error);
  }, [tokens, planId, dia, horaInicio, metodo]);

  if (!urlPago) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <WebView source={{ uri: urlPago }} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
